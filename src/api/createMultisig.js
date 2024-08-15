// Import the xrpl library
const xrpl = require('xrpl');

async function createMultisigWallet() {
  // Connect to the XRPL testnet
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  // Create a main wallet (to be the multisig wallet)
  const mainWallet = (await client.fundWallet()).wallet;
  console.log(`Main wallet address: ${mainWallet.address}`);

  // Create signer wallets
  const signerWallet1 = (await client.fundWallet()).wallet;
  const signerWallet2 = (await client.fundWallet()).wallet;
  console.log(`Signer wallet 1 address: ${signerWallet1.address}`);
  console.log(`Signer wallet 2 address: ${signerWallet2.address}`);

  // Define signers
  const signers = [
    {
      Account: signerWallet1.classicAddress,
      SigningPubKey: signerWallet1.publicKey
    },
    {
      Account: signerWallet2.classicAddress,
      SigningPubKey: signerWallet2.publicKey
    }
  ];

  // Configure the multisig settings on the main wallet
  const multisigTx = {
    TransactionType: 'SignerListSet',
    Account: mainWallet.classicAddress,
    SignerQuorum: 2, // The number of signatures required to authorize a transaction
    SignerEntries: signers.map(signer => ({
      SignerEntry: {
        Account: signer.Account,
        SignerWeight: 1
      }
    }))
  };

  // Submit the multisig settings transaction
  const prepared = await client.autofill(multisigTx);
  const signed = mainWallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log(`Multisig wallet created with transaction result: ${result.result.meta.TransactionResult}`);

  // Disconnect from the client
  await client.disconnect();
}

createMultisigWallet().catch(console.error);
