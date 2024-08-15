const crypto = require('crypto');
const xrpl = require('xrpl');
const { nodes } = require('./keys');

function signTransaction(transactionHash, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(transactionHash);
  sign.end();
  return sign.sign(privateKey, 'hex');
}

async function collectSignatures(transaction) {
  const txHash = crypto.createHash('sha256').update(JSON.stringify(transaction)).digest('hex');
  const signatures = nodes.map(node => ({
    nodeId: node.id,
    signature: signTransaction(txHash, node.privateKey)
  }));

  return signatures;
}

function verifySignature(hash, signature, publicKey) {
  const verify = crypto.createVerify('SHA256');
  verify.update(hash);
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
}

async function submitMultiSigTransaction(client, account, transaction, signatures) {
  const multiSigTx = {
    ...transaction,
    Signers: signatures.map(sig => ({
      Signer: {
        Account: `rSignerAccount${sig.nodeId}`,
        SigningPubKey: nodes[sig.nodeId].publicKey,
        TxnSignature: sig.signature
      }
    }))
  };

  const signedMultiSigTx = xrpl.sign(multiSigTx, account);
  const submissionResult = await client.submitAndWait(signedMultiSigTx.tx_blob);
  console.log("Transaction result:", submissionResult);
}

module.exports = { collectSignatures, submitMultiSigTransaction };
