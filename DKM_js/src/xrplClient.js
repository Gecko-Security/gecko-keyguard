const xrpl = require('xrpl');

async function connectClient() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  console.log("Connected to XRPL");
  return client;
}

async function disconnectClient(client) {
  await client.disconnect();
  console.log("Disconnected from XRPL");
}

async function createFundedAccount(client) {
  const wallet = xrpl.Wallet.generate();
  await client.fundWallet(wallet);

  console.log(`Funded account: ${wallet.address}`);
  return wallet;
}

module.exports = { connectClient, disconnectClient, createFundedAccount };
