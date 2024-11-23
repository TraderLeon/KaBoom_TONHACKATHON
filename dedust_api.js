const { Factory, MAINNET_FACTORY_ADDR } = require('@dedust/sdk');
const { Address, TonClient4 } = require("@ton/ton");
const { Asset, PoolType } = require('@dedust/sdk');
const { DeDustClient } = require('@dedust/sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tonClient = new TonClient4({ endpoint: "https://mainnet-v4.tonhubapi.com" });
const factory = tonClient.open(Factory.createFromAddress(MAINNET_FACTORY_ADDR));

const SCALE_ADDRESS = Address.parse('EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE');
const TON = Asset.native();
const SCALE = Asset.jetton(SCALE_ADDRESS);

const IMAGE_DIR = path.join(__dirname, 'public', 'images');

// Ensure the image directory exists
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const MAX_RETRIES = 3; // Set the maximum number of retries

// Utility function to download an image and save it locally
async function downloadImage(url, filename, retries = 0) {
    const filePath = path.join(IMAGE_DIR, filename);

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
        //console.log(`Image already exists for ${filename}. Skipping download.`);
        return `/images/${filename}`; // Return the local path if file exists
    }

    // Start the download and save the image as a stream
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            // Check the file size after download
            const stats = fs.statSync(filePath);
            if (stats.size === 0 && retries < MAX_RETRIES) {
                //console.warn(`Download failed for ${filename}, file size is 0. Retrying... (${retries + 1}/${MAX_RETRIES})`);
                
                // Delete the incomplete file
                fs.unlinkSync(filePath);

                // Retry the download
                downloadImage(url, filename, retries + 1)
                    .then(resolve)  // Resolve with the path on success
                    .catch(reject); // Reject if there's an error on retry
            } else if (stats.size === 0) {
                reject(new Error(`Failed to download image ${filename} after ${MAX_RETRIES} attempts.`));
            } else {
                resolve(`/images/${filename}`); // Return the local path on success
            }
        });
        
        writer.on('error', (error) => {
            reject(error); // Handle any other errors
        });
    });
}

async function getTopPairs() {
    const dedustClient = new DeDustClient({ endpointUrl: 'https://api.dedust.io' });
    const pools = await dedustClient.getPools();

    // Process pools and handle async downloads for images
    const poolPromises = pools
        .filter(pool => pool.assets.some(asset => asset.metadata && asset.metadata.symbol === "TON") && pool.lastPrice !== null &&
                pool.assets[1].metadata?.symbol !== "USDT"   
        )
        .map(async (pool) => { // Mark this function as async
            const asset2 = pool.assets[1];
            const reserveTON = pool.reserves[0] || 'N/A';
            const volumeTON = pool.stats.volume ? pool.stats.volume[0] : 'N/A';

            // Download and save the image if it exists
            let localImageUrl = 'N/A';
            if (asset2.metadata && asset2.metadata.image) {
                const imageName = `${asset2.metadata.symbol}.webp`; // Unique filename for each image
                try {
                    localImageUrl = await downloadImage(asset2.metadata.image, imageName); // Await downloadImage
                } catch (error) {
                    console.error(`Failed to download image for ${asset2.metadata.symbol}:`, error);
                }
            }

            return {
                symbol: asset2.metadata ? asset2.metadata.symbol : 'N/A',
                name: asset2.metadata ? asset2.metadata.name : 'N/A',
                base_token_address: asset2.address || 'N/A',
                pair_address: pool.address,
                last_price: pool.lastPrice,
                ton_volume: volumeTON,
                token_volume: pool.stats.volume ? pool.stats.volume[1] : 'N/A',
                ton_reserve: reserveTON,
                token_reserve: pool.reserves[1] || 'N/A',
                image_url: localImageUrl, // Use the awaited local image URL
            };
        });

    // Wait for all async operations in the map to complete
    const filteredPools = (await Promise.all(poolPromises))
        .filter(pool => pool.symbol && pool.base_token_address && pool.ton_volume && pool.token_volume) // Ensuring required fields
        .sort((a, b) => parseFloat(b.ton_volume) - parseFloat(a.ton_volume)) // Sort by ton_volume in descending order
        .slice(0, 20); // Get the top 20 pairs

    return filteredPools; // Return filtered data
}

module.exports = { getTopPairs };