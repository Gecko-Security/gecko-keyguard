const xrpl = require('xrpl');

async function generateWallet() {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233'); 

    try {
        await client.connect();
        const wallet = (await client.fundWallet()).wallet;
        console.log(`Wallet address: ${wallet.address}`);
        await client.disconnect();
    } catch (error) {
        console.error('Error generating wallet:', error);
    }
}
generateWallet();
