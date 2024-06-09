const xrpl = require('xrpl');
const { nodes } = require('./keys');

async function disableMasterKey(client, account) {
  const accountSetTx = {
    TransactionType: "AccountSet",
    Account: account.address,
    SetFlag: xrpl.AccountSetFlags.asfDisableMaster,
    Fee: "12",
    Sequence: (await client.getAccountInfo(account.address)).account_data.Sequence
  };

  const signedAccountSetTx = xrpl.sign(accountSetTx, account);
  await client.submitAndWait(signedAccountSetTx.tx_blob);
  console.log("Master key disabled");
}

async function setSignerList(client, account) {
  const signerList = nodes.map((node, index) => ({
    SignerEntry: {
      Account: `rSignerAccount${index}`,
      SignerWeight: 1
    }
  }));

  const signerListSetTx = {
    TransactionType: "SignerListSet",
    Account: account.address,
    SignerQuorum: 5,
    SignerEntries: signerList,
    Fee: "12",
    Sequence: (await client.getAccountInfo(account.address)).account_data.Sequence
  };

  const signedSignerListSetTx = xrpl.sign(signerListSetTx, account);
  await client.submitAndWait(signedSignerListSetTx.tx_blob);
  console.log("Signer list set");
}

module.exports = { disableMasterKey, setSignerList };
