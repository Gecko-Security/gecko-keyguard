const { initializeNodes } = require('./keys');
const { createFundedAccount, connectClient, disconnectClient } = require('./xrplClient');
const { disableMasterKey, setSignerList } = require('./dkm');
const { createTransaction } = require('./transaction');
const { collectSignatures, submitMultiSigTransaction } = require('./signatures');

(async () => {
  const client = await connectClient();
  initializeNodes();
  const fundedAccount = await createFundedAccount(client);
  await disableMasterKey(client, fundedAccount);
  await setSignerList(client, fundedAccount);
  const transaction = createTransaction(fundedAccount);
  const signatures = await collectSignatures(transaction);
  await submitMultiSigTransaction(client, fundedAccount, transaction, signatures);
  await disconnectClient(client);
})();
