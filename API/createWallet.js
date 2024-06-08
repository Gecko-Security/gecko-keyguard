// Import the xrpl library
const xrpl = require('xrpl');

// Function to generate an XRP wallet
async function generateWallet() {
    // Create a new client instance
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233'); // Connect to the testnet

    try {
        // Connect to the XRP Ledger
        await client.connect();

        // Generate a new wallet
        const wallet = (await client.fundWallet()).wallet;
        console.log(`Wallet address: ${wallet.address}`);

        // // Log the wallet details
        // console.log('Generated XRP Wallet:');
        // console.log(`Address: ${wallet.address}`);
        // console.log(`Secret: ${wallet.seed}`);

        // Disconnect from the client
        await client.disconnect();
    } catch (error) {
        console.error('Error generating wallet:', error);
    }
}

// Call the function to generate the wallet
generateWallet();
