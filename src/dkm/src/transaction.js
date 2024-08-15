const xrpl = require('xrpl');

function createTransaction(account) {
  return {
    TransactionType: "Payment",
    Account: account.address,
    Destination: "rDestinationAddress",
    Amount: xrpl.xrpToDrops("10"),
    Fee: "12",
    Sequence: account.sequence
  };
}

module.exports = { createTransaction };
