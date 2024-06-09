const xrpl = require('xrpl');

// test only
const signer1 = xrpl.Wallet.fromSeed('sEdS584Sv6LJhNkJzKVk4XKTcRv7qXg');
const signer2 = xrpl.Wallet.fromSeed('sEdSxxurPdVncuAq18fM5mXvDb462rG');
const signer3 = xrpl.Wallet.fromSeed('sEd7fw9x8f8bAXPXgfTjAEmk16f5DeT');
const primaryAddress = 'r4yYS7d4nC1ssvjsk3UNzyvYxVLgeWgUUq';
const destinationAddress = 'raF3An625yzS3EksmJSwJmmqVG1tZpL192';

const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

async function multisigning() {
  await client.connect();

  const payment = {
    "TransactionType": "Payment",
    "Account": primaryAddress,
    "Destination": destinationAddress,
    "Amount": "1000000",
    "Fee": "15000", 
    //"Sequence": 1357776, 
    "SigningPubKey": "" 
  };

  const prepared = await client.autofill(payment);
  const signFor = (signer, preparedTx) => {
    const signedTx = signer.sign(preparedTx, true);
    return signedTx.tx_blob;
  };

  const txBlob1 = signFor(signer1, prepared);
  const txBlob2 = signFor(signer2, prepared);
  const txBlob3 = signFor(signer3, prepared);

  const multisignedTx = xrpl.multisign([txBlob1, txBlob2, txBlob3]);
  const submitResponse = await client.submit(multisignedTx);
  console.log(submitResponse);

  if (submitResponse.result.engine_result === 'tesSUCCESS') {
    console.log('The multisigned transaction was accepted by the ledger:');
    console.log(submitResponse);
    if (submitResponse.result.tx_json.Signers) {
      console.log(
        `The transaction had ${submitResponse.result.tx_json.Signers.length} signatures`
      );
    }
  } else {
    console.log(
      "The multisigned transaction was rejected by rippled. Here's the response from rippled:",
    );
    console.log(submitResponse);
  }

  await client.disconnect();
}

multisigning().catch(console.error);
