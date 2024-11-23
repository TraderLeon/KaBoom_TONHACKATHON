const { Factory, MAINNET_FACTORY_ADDR, Asset, PoolType, ReadinessStatus, VaultJetton } = require('@dedust/sdk');
const { Address, TonClient4, beginCell } = require("@ton/ton");
const { toNano, Cell } = require("@ton/core");

// Constants
const CONSTANTS = {
    VAULT_ADDRESS: "EQDa4VOnTYlLvDJ0gZjNYm5PXfSmmtL6Vs6A_CZEtXCNICq_",
    TON_AMOUNT: toNano('0.1'),     // 0.1 TON in nanoTON
    GAS_AMOUNT: toNano('0.25'),   // 0.25 TON in nanoTON
    SWAP_OP_CODE: 0xea06185d       // Swap operation code
};

function createSwapPayload({
    poolAddress,
}) {
    const swapParams = beginCell() // Define `SwapParams`
        .storeUint(Math.floor(Date.now() / 1000) + 300, 32) // Deadline (timestamp in seconds, +5 minutes)
        .storeAddress(null) // Recipient address (null for simplicity)
        .storeAddress(null) // Referral address (null for simplicity)
        .storeMaybeRef(null) // Fulfill payload (null for simplicity)
        .storeMaybeRef(null) // Reject payload (null for simplicity)
        .endCell();

    const swapStepParams = beginCell() // Define `SwapStepParams`
        .storeUint(0, 1) // Swap kind (default to 0)
        .storeCoins(0) // Limit (set to 0 for no limit)
        .storeMaybeRef(null) // Next step (null for simplicity)
        .endCell();

    const swapStep = beginCell() // Define `SwapStep`
        .storeAddress(poolAddress) // Pool address
        .storeRef(swapStepParams) // Step params (reference to `SwapStepParams`)
        .endCell();

    return beginCell() // Define the main payload (`InMsgBody`)
        .storeUint(CONSTANTS.SWAP_OP_CODE, 32) // Swap operation code
        .storeUint(0, 64) // Query ID (can be 0 for simplicity)
        .storeCoins(CONSTANTS.TON_AMOUNT) // Use CONSTANTS.TON_AMOUNT directly
        .storeRef(swapStep) // Reference to `SwapStep`
        .storeRef(swapParams) // Reference to `SwapParams`
        .endCell();
}

/**
 * Sets up routes for the DeDust API.
 */
function setupDedustRoutes(app, database_pool) {
    app.post("/api/ton-swap/prepare", async (req, res) => {
        try {
            console.log('Received prepare swap request:', req.body);
            const { poolAddress, walletAddress } = req.body;

            if (!poolAddress || !walletAddress) {
                return res.status(400).json({
                    status: "error",
                    message: "Missing required parameters",
                });
            }

            try {
                // Create the swap payload
                const payload = createSwapPayload({
                    poolAddress: Address.parse(poolAddress),
                });

                // Calculate total amount (TON_AMOUNT + GAS_AMOUNT)
                const totalAmount = (
                    BigInt(CONSTANTS.TON_AMOUNT) + BigInt(CONSTANTS.GAS_AMOUNT)
                ).toString();

                res.json({
                    status: "success",
                    data: {
                        vaultAddress: CONSTANTS.VAULT_ADDRESS,
                        totalAmount,
                        payload: payload.toBoc().toString("base64"),
                    },
                });
            } catch (swapError) {
                console.error("Failed to create swap payload:", swapError);
                throw new Error(`Swap preparation failed: ${swapError.message}`);
            }
        } catch (err) {
            console.error("Swap preparation failed:", err);
            res.status(500).json({
                status: "error",
                message: err.message,
            });
        }
    });


    // Add a new route for direct swap transaction
    app.post("/api/ton-swap/direct", async (req, res) => {
        try {
            const { poolAddress, walletAddress, amount } = req.body;

            if (!poolAddress || !walletAddress || !amount) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "Missing required parameters" 
                });
            }

            await initializeDeDust();
            const tonVault = await getTonVault();
            
            // Send swap directly to the pool
            const swapAmount = toNano(amount);
            const gasAmount = toNano('0.25');

            // Create the swap transaction
            await tonVault.sendSwap(Address.parse(walletAddress), {
                poolAddress: Address.parse(poolAddress),
                amount: swapAmount,
                gasAmount: gasAmount
            });

            res.json({
                status: "success",
                message: "Swap transaction sent"
            });

        } catch (err) {
            console.error('Direct swap failed:', err);
            res.status(500).json({ 
                status: "error", 
                message: err.message
            });
        }
    });


    // 2. Endpoint to record a completed trade
    app.post("/api/ton-swap/record", async (req, res) => {
        try {
            const { walletAddress, pairAddress, transactionId, amount, type } = req.body;

            if (!walletAddress || !pairAddress || !transactionId || !amount || !type) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "Missing required parameters" 
                });
            }

            const result = await database_pool.query(
                `INSERT INTO trades (
                    wallet_address, pair_address, transaction_id, 
                    amount, type, status, timestamp
                ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW()) 
                RETURNING id`,
                [walletAddress, pairAddress, transactionId, amount, type]
            );

            res.json({ 
                status: "success", 
                data: {
                    tradeId: result.rows[0].id 
                }
            });

        } catch (err) {
            console.error('Failed to record trade:', err);
            res.status(500).json({ 
                status: "error", 
                message: err.message 
            });
        }
    });

    // 3. Endpoint to get user's trade history
    app.get("/api/ton-swap/trades", async (req, res) => {
        try {
            const { walletAddress } = req.query;

            if (!walletAddress) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "Wallet address is required" 
                });
            }

            const result = await database_pool.query(
                `SELECT * FROM trades 
                WHERE wallet_address = $1 
                ORDER BY timestamp DESC`,
                [walletAddress]
            );

            res.json({
                status: "success",
                data: result.rows
            });

        } catch (err) {
            console.error('Failed to fetch trades:', err);
            res.status(500).json({ 
                status: "error", 
                message: err.message 
            });
        }
    });

    console.log('DeDust routes setup completed');
}

module.exports = {
    setupDedustRoutes
};
