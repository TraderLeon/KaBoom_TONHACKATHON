const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://game.kaboom.meme/tonconnect-manifest.json",
    buttonRootId: "ton-connect",
});


async function initializeTradePage() {
    const tradePage = document.getElementById('tradePage');
    if (!tradePage) return;

    tradePage.style.position = 'relative';
    tradePage.style.height = '100vh';
    tradePage.style.overflow = 'hidden';
    tradePage.innerHTML = `
    <div class="trade-page-container h-full" style="background: url('resources/task_background.png') no-repeat center top fixed; background-size: cover;">
        <div class="trade-page-content" style="padding-top: 40px; max-height: calc(100vh - 40px); overflow-y: auto;">
            <!-- Header Section with improved positioning -->
            <div class="px-3 pt-4 relative">
                <div class="absolute inset-x-0 -inset-y-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-30 blur-lg rotate-2 scale-105 animate-pulse"></div>
                <div class="flex justify-between items-center">
                    <div class="relative">
                        <h1 class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 uppercase tracking-wider animate-in">
                            MEME Hunter!
                        </h1>
                    </div>
                    
                    <!-- Wallet Connection Container with improved positioning -->
                    <div class="wallet-connection-container relative">
                        <button id="ton-connect" class="bg-gradient-to-r from-purple-500 to-blue-500 text-yellow-300 font-bold text-sm px-4 py-2 rounded cursor-pointer">
                            Connect Wallet
                        </button>
                        <div id="ton-disconnect-dropdown" class="absolute top-full right-0 mt-1 hidden z-50">
                            <button id="ton-disconnect" class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-yellow-300 font-bold text-sm px-4 py-2 rounded cursor-pointer">
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-2">
                <div class="trade-token-grid grid grid-cols-2 gap-2" id="tradeTokenGrid">
                </div>
            </div>
        </div>
    </div>
    `;
    
    const walletConnectBtn = document.getElementById('ton-connect');
    const disconnectDropdown = document.getElementById('ton-disconnect-dropdown');
    const disconnectBtn = document.getElementById('ton-disconnect');
    
    let isWalletConnected = tonConnectUI.connected;
    let walletAddress = '';
    let isDropdownOpen = false;
    // Move the status change handler here, after DOM elements are created
    tonConnectUI.onStatusChange(async (wallet) => {
        if (wallet) {
            isWalletConnected = true;
            walletAddress = wallet.account.address;
            updateConnectButton(walletAddress);
            const defaultTonConnect = document.querySelector('.ton-connect');
            if (defaultTonConnect) defaultTonConnect.style.display = 'none';
        } else {
            isWalletConnected = false;
            walletAddress = '';
            updateConnectButton('Connect Wallet');
        }
    });
    
    // Update the connect button's text with wallet address or default text
    function updateConnectButton(address) {
        if (isWalletConnected) {
            const formattedAddress = `🚀 ${address.slice(0, 4)}...${address.slice(-4)}`;
            walletConnectBtn.textContent = formattedAddress;
            walletConnectBtn.classList.add('wallet-connected');
        } else {
            walletConnectBtn.textContent = address;
            walletConnectBtn.classList.remove('wallet-connected');
        }
    }

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
        if (isDropdownOpen) {
            disconnectDropdown.classList.remove('hidden');
            // Force a repaint
            disconnectDropdown.offsetHeight;
            // Add animation class
            disconnectDropdown.classList.add('dropdown-active');
        } else {
            disconnectDropdown.classList.remove('dropdown-active');
            disconnectDropdown.classList.add('hidden');
        }
    }
    
    async function initializeWallet() {
        try {
            if (tonConnectUI.connected) {
                isWalletConnected = true;
                walletAddress = tonConnectUI.account.address;
                updateConnectButton(walletAddress);
                // Add this line to check and hide default connect button
                const defaultTonConnect = document.querySelector('.ton-connect');
                if (defaultTonConnect) defaultTonConnect.style.display = 'none';
            } else {
                updateConnectButton('Connect Wallet');
            }
        } catch (error) {
            console.error("Error initializing wallet:", error);
            updateConnectButton('Connect Wallet');
        }
    }
    
    // Click handler for the connect button
    walletConnectBtn.addEventListener('click', async (event) => {
        event.stopPropagation();

            // Add this check first to see whether wallet already connected
        if (tonConnectUI.connected && !isWalletConnected) {
            isWalletConnected = true;
            walletAddress = tonConnectUI.account.address;
            updateConnectButton(walletAddress);
            return;
        }
        
        if (isWalletConnected) {
            console.log('Toggling disconnect dropdown');
            toggleDropdown();
        } else {
            console.log('Attempting to connect wallet');
            await connectWallet();
        }
    });
    
    // Click handler for the disconnect button
    disconnectBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await disconnectWallet();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.wallet-connection-container')) {
            isDropdownOpen = false;
            disconnectDropdown.classList.add('hidden');
            disconnectDropdown.classList.remove('dropdown-active');
        }
    });
    
    async function connectWallet() {
        try {
            // Check if already connected
            if (tonConnectUI.connected) {
                console.log('Wallet already connected, updating state');
                isWalletConnected = true;
                walletAddress = tonConnectUI.account.address;
                updateConnectButton(walletAddress);
                return;
            }
    
            // Only try to connect if not already connected
            const connectedWallet = await tonConnectUI.connectWallet();
            if (tonConnectUI.connected) {
                isWalletConnected = true;
                walletAddress = tonConnectUI.account.address;
                updateConnectButton(walletAddress);
            }
        } catch (error) {
            console.error("Failed to connect to wallet:", error);
        }
    }
    
    // Disconnect wallet function
    async function disconnectWallet() {
        try {
            await tonConnectUI.disconnect();
            isWalletConnected = false;
            walletAddress = '';
            updateConnectButton('Connect Wallet');
            disconnectDropdown.classList.add('hidden');
            disconnectDropdown.classList.remove('dropdown-active');
            isDropdownOpen = false;
        } catch (error) {
            console.error("Failed to disconnect wallet:", error);
        }
    }
    
    // Initialize wallet on page load
    initializeWallet();
    let tokenData = []; // Stores token data for plotting
    
    // Function to fetch token data from backend based on selected network
    async function fetchTokenData(network) {
        const endpointMap = {
            ton: envConfig.apiBaseURL + '/ton-pool-info', //http://127.0.0.1:3000/api/ton-pool-info, 
            solana: envConfig.apiBaseURL + '/solana-pool-info',//
            // Add other networks and their endpoints as needed
        };

        const endpoint = endpointMap[network.toLowerCase()];

        if (!endpoint) {
            console.error(`No endpoint configured for network: ${network}`);
            return;
        }

        try {
            const response = await fetch(endpoint);
            const data = await response.json();

            tokenData = data.map(pair => ({
                address: pair.pair_address,
                symbol: pair.symbol,
                name: pair.name,
                price: parseFloat(pair.price),
                priceChange5m: parseFloat(pair.priceChange5m || 0),
                priceChange1h: parseFloat(pair.priceChange1h || 0),
                fdv: pair.fdv,
                volume24h: pair.volume24h,
                imageUrl: pair.image_url,
                position: "1,000",
                value: (1000 * parseFloat(pair.price)).toFixed(0), // Assuming 1,000 as a default position value
                pnl: 15 // Default PnL for demonstration
            }));

            updateTokenDisplay();

        } catch (error) {
            console.error(`Error fetching data for network ${network}:`, error);
        }
    }


    // Dictionary to store previous prices, active flash intervals, and current arrows for tokens
    const previousPrices = {};
    const activeFlashIntervals = {};
    const currentArrows = {}; 

    async function updateTokenDisplay() {
        const tokenGrid = document.getElementById('tradeTokenGrid');
        const sortedTokens = [...tokenData].sort((a, b) => b.priceChange5m - a.priceChange5m);
        tokenGrid.innerHTML = '';
        
        sortedTokens.forEach(token => {
            const tokenBlock = document.createElement('div');
            tokenBlock.id = `token-${token.address}`;
            tokenBlock.classList.add('trade-token-block');
            tokenBlock.innerHTML = createTokenBlockContent(token);
            
            const previousPrice = previousPrices[token.address];
            const priceHasChanged = previousPrice !== undefined && previousPrice !== token.price;
    
            // Determine arrow and flashClass based on price changes and priceChange5m
            let arrow = '';
            let arrowColor = '';
            let flashClass = '';
    
            // Initial flash based on 5m price change
            if (previousPrice === undefined) {
                // Set flash based on priceChange5m when there is no previous price
                flashClass = token.priceChange5m > 0 ? 'flash-green' : token.priceChange5m < 0 ? 'flash-red' : '';
                arrow = token.priceChange5m > 0 ? '↑' : token.priceChange5m < 0 ? '↓' : '';
                arrowColor = token.priceChange5m > 0 ? 'green' : token.priceChange5m < 0 ? 'red' : '';
                currentArrows[token.address] = { arrow, arrowColor };
            } else if (priceHasChanged) {
                // Update arrow and flash based on real-time price change
                arrow = token.price > previousPrice ? '↑' : '↓';
                arrowColor = token.price > previousPrice ? 'green' : 'red';
                flashClass = token.price > previousPrice ? 'flash-green' : 'flash-red';
                currentArrows[token.address] = { arrow, arrowColor };
            } else {
                // Maintain previous arrow and flash class if no price change
                const currentArrowState = currentArrows[token.address];
                if (currentArrowState) {
                    arrow = currentArrowState.arrow;
                    arrowColor = currentArrowState.arrowColor;
                    flashClass = arrowColor === 'green' ? 'flash-green' : 'flash-red';
                }
            }
    
            // Update price element with arrow and color
            const priceElement = tokenBlock.querySelector('.price');
            if (priceElement) {
                priceElement.innerHTML = `$${token.price.toFixed(4)}${arrow ? ` <span class="price-arrow" style="color: ${arrowColor};">${arrow}</span>` : ''}`;
            }
    
            // Flashing effect with random delay and cycle
            if (flashClass) {
                if (activeFlashIntervals[token.address]) {
                    clearInterval(activeFlashIntervals[token.address]);
                    tokenBlock.classList.remove('flash-green', 'flash-red');
                }
    
                let cycleCount = 0;
                const maxCycles = 5;
    
                function flashCycle() {
                    let flashCount = 0;
                    const flashInterval = setInterval(() => {
                        tokenBlock.classList.toggle(flashClass);
                        flashCount++;
    
                        if (flashCount >= 5) {
                            clearInterval(flashInterval);
                            tokenBlock.classList.remove(flashClass);
    
                            cycleCount++;
                            if (cycleCount < maxCycles) {
                                // Random delay between 1.5 to 2.5 seconds before next cycle
                                const randomDelay = 1000 + Math.random() * 500;
                                setTimeout(flashCycle, randomDelay);
                            }
                        }
                    }, 200);
                }
    
                // Random initial delay between 0 to 0.5 seconds
                const initialDelay = Math.random() * 500;
                setTimeout(() => flashCycle(), initialDelay);
            }
    
            // Store the current price as the previous price for future comparisons
            previousPrices[token.address] = token.price;
            tokenGrid.appendChild(tokenBlock);
        });
    }
    // Function to format the price according to the specified rules
    function formatPrice(price) {
        let formattedPrice = price.toFixed(4);
        if (/\.00[1-9]/.test(formattedPrice)) {
            return formattedPrice;
        }
        return formattedPrice.replace(/(\.0{2})(0+)([1-9]*)/, '$1($2)$3');
    }

    // Function for generating HTML content for each token block
    function createTokenBlockContent(token) {
        const isPositiveChange = (value) => value > 0;
    
        return `
            <div class="flash-overlay"></div>
            <div class="flex items-center h-6" data-pair-address="${token.address}">
                <span class="trade-token-symbol text-base font-bold">${token.symbol}</span>
                <div class="min-h-screen flex items-center mx-1.5">
                    <span class="text-gray-400">|</span>
                </div>
                <span class="trade-token-name text-xs text-gray-600">${token.name}</span>
            </div>
            <div class="mb-0.5 mt-0.5 flex items-center">
                <p class="font-bold price" style="font-size: 1.44rem;">$${formatPrice(token.price)} <span class="price-arrow"></span></p>
            </div>
            <div class="grid grid-cols-2 text-xs mb-2">
                <div>
                    <span class="text-black-400">5m: </span>
                    <span class="${isPositiveChange(token.priceChange5m) ? 'text-green-500' : 'text-red-500'}">
                        ${token.priceChange5m.toFixed(1)}%
                    </span>
                </div>
                <div>
                    <span class="text-black-400">1h: </span>
                    <span class="${isPositiveChange(token.priceChange1h) ? 'text-green-500' : 'text-red-500'}">
                        ${token.priceChange1h.toFixed(1)}%
                    </span>
                </div>
            </div>
            <div class="grid grid-cols-2 text-xs mb-2">
                <div>
                    <div class="text-black-400">FDV:</div>
                    <div class="text-purple-600 fdv">$${token.fdv}</div>
                </div>
                <div>
                    <div class="text-black-400">24h Vol:</div>
                    <div class="text-purple-600 volume24h">$${token.volume24h}</div>
                </div>
            </div>
            <div class="flex gap-2 mb-2">
                <button class="flex-1 bg-green-500 text-white py-1 rounded text-sm font-medium" onclick="handleBuyClick(this)">Buy</button>
                <button class="flex-1 bg-red-500 text-white py-1 rounded text-sm font-medium">Sell</button>
            </div>
            <div class="grid grid-cols-2 text-xs mb-1.5">
                <div>
                    <div class="text-black-400">Position</div>
                    <div class="text-purple-600 position">${token.position}</div>
                </div>
                <div>
                    <div class="text-black-400">Value</div>
                    <div class="text-purple-600 value">$${token.value}</div>
                </div>
            </div>
            <div class="text-center text-sm pnl ${isPositiveChange(token.pnl) ? 'text-green-500' : 'text-red-500'} border-t-2 border-gray-200 pt-1">
                PnL: ${isPositiveChange(token.pnl) ? '+' : ''}${token.pnl}%
            </div>
        `;
    }

    // Example network selection and initial call
    const selectedNetwork = 'ton'; // Change this to 'solana' or another network as needed
    await fetchTokenData(selectedNetwork);

    // Update display periodically if needed
    setInterval(() => fetchTokenData(selectedNetwork), 10 * 1000); // Fetch and display data every 10 seconds
}


// Error boundary
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, 'at', url, 'line:', lineNo);
    return false;
};
window.initializeTradePage = initializeTradePage;
console.log('version 0.1')



class TonConnectSender {
    constructor(tonConnectUI, address) {
        this.tonConnectUI = tonConnectUI;
        this.address = address;
    }

    async send(args) {
        return await this.tonConnectUI.sendTransaction({
            validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
            messages: [{
                address: args.to.toString(),
                amount: args.value.toString(),
                payload: args.body?.toBoc().toString('base64'),
                stateInit: args.init ? 
                    beginCell()
                        .store(storeStateInit(args.init))
                        .endCell()
                        .toBoc()
                        .toString('base64') 
                    : undefined,
            }]
        });
    }
}

class SwapButtonManager {
    constructor(button) {
        this.button = button;
        this.originalText = button.textContent;
        this.statusElement = this.createStatusElement();
    }

    createStatusElement() {
        const tokenBlock = this.button.closest('.trade-token-block');
        const status = document.createElement('div');
        status.className = 'swap-status hidden';
        tokenBlock.appendChild(status);
        return status;
    }

    setLoading(isLoading) {
        this.button.disabled = isLoading;
        this.button.textContent = isLoading ? 'Processing...' : this.originalText;
    }

    updateStatus(message, type = 'info') {
        this.statusElement.textContent = message;
        this.statusElement.className = `swap-status ${type} p-2 rounded mt-2 ${
            type === 'error' ? 'bg-red-100 text-red-600' : 
            type === 'success' ? 'bg-green-100 text-green-600' : 
            'bg-blue-100 text-blue-600'
        }`;
    }
}

// API helpers
const swapApi = {
    async prepareSwap(poolAddress, walletAddress, amount) {
        console.log('Preparing swap for:', poolAddress, walletAddress, amount);
        const response = await appFetch('/api/ton-swap/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ poolAddress, walletAddress })
        });

        const data = await response.json();
        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || 'Failed to prepare swap');
        }
        return data.data;
    },

    async recordTrade(walletAddress, pairAddress, transactionId, amount, type) {
        const response = await appFetch('/api/ton-swap/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress,
                pairAddress,
                transactionId,
                amount,
                type
            })
        });

        if (!response.ok) {
            console.warn('Failed to record trade:', await response.text());
        }
    }
};

// Helper functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded shadow-lg z-50 
        ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} 
        text-white animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4700);
}

function getPairAddress(tokenBlock) {
    const element = tokenBlock.querySelector('[data-pair-address]');
    if (!element) throw new Error('Pair address not found');
    return element.getAttribute('data-pair-address');
}

function getTokenSymbol(tokenBlock) {
    return tokenBlock.querySelector('.trade-token-symbol')?.textContent || 'token';
}

// Main swap handler
async function handleBuyClick(button) {
    if (!tonConnectUI.connected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const buttonManager = new SwapButtonManager(button);

    try {
        buttonManager.setLoading(true);

        const tokenBlock = button.closest('.trade-token-block');
        const pairAddress = getPairAddress(tokenBlock);
        console.log('pairAddress:', pairAddress);
        const symbol = getTokenSymbol(tokenBlock);

        // Create sender instance
        const sender = new TonConnectSender(
            tonConnectUI, 
            tonConnectUI.account.address
        );

        // Prepare the swap
        buttonManager.updateStatus('Preparing swap...');
        console.log('Preparing swap for:', pairAddress);
        const swapData = await swapApi.prepareSwap(
            pairAddress, 
            tonConnectUI.account.address,
            '0.1' // Default amount
        );
        console.log('Swap data:', swapData);
        // Send transaction
        buttonManager.updateStatus('Confirming transaction...');
        console.log('payload:', swapData.payload);
        const result = await sender.send({
            to: pairAddress,
            value: swapData.totalAmount,
            payload: swapData.payload
        });
        
        // Record trade
        buttonManager.updateStatus('Recording transaction...');
        await swapApi.recordTrade(
            tonConnectUI.account.address,
            pairAddress,
            result.boc,
            '0.1',
            'buy'
        );

        showNotification(`Successfully swapped for ${symbol}!`, 'success');
        buttonManager.updateStatus('Swap completed', 'success');

    } catch (error) {
        console.error('Swap failed:', error);
        showNotification('Swap failed: ' + error.message, 'error');
        buttonManager.updateStatus('Swap failed', 'error');
    } finally {
        buttonManager.setLoading(false);
    }
}

// Make functions globally available
window.handleBuyClick = handleBuyClick;
window.showNotification = showNotification;