const DecentralizedKeyManagement = require("./DKIM");
const NPLBroker = require("./NLPbroker");

const mycontract = async (ctx) => {
    const npl = NPLBroker.init(ctx);

    console.log("\n - TEST 1: Initializing DKM. UTILIZES: constructor(), init()");

    const DKM = new DecentralizedKeyManagement.Manager(ctx, npl, "hooks");

    try{
        var initResult = await DKM.init();
    } catch (err) {
        console.log(err);
    }
   
	if (ctx.lclSeqNo % 10 === 0) {
        const state = await DKM.checkupSigners();
        console.log(`Online: ${state.OnlineSigners.length}`);
        console.log(`Offline: ${state.OfflineSigners.length}`);
	}

	if (DKM.dAppXrplTransactions.length >= 1) {
        console.log(`DKM: XRPL Account ${DKM.dAppXrplAccountClassicAddress} has received ${DKM.dAppXrplTransactions.length} new transaction(s) !!!`);
        var x = 1;
        DKM.dAppXrplTransactions.forEach(tx => {
            console.log(` - Transaction ${x}:`);
            console.log(` Transaction Type: ${tx.tx.TransactionType}`);
            console.log(`         inLedger: ${tx.tx.inLedger}`);
            console.log(`          Account: ${tx.tx.Account}`);
            console.log(`      Destination: ${tx.tx.Destination}`);
            console.log(`           Amount: ${tx.tx.Amount / 1000000} XRP`);
            console.log(`              Fee: ${tx.tx.Fee} drops`);
            x += 1;
        });
	}
    
    if (ctx.lclSeqNo > 1) {
        if (ctx.users.count() >= 1) {
            for (const user of ctx.users.list()) {
                console.log(`Connected users: ${ctx.users.count()}`);

                for (const input of user.inputs) {
                    const request = await ctx.users.read(input);
                    const userRequest = JSON.parse(request);

                    if (userRequest.TransactionType === "Payment" && xrpl.isValidAddress(userRequest.Destination) && userRequest.Amount <= 1) {
                        try {
                            var tx = DKM.packageTxAPI({
                                destination: userRequest.Destination,
                                amount: xrpl.xrpToDrops(userRequest.Amount),
                                memo: {
                                    data: `This transaction was signed using KeyGuard ${ctx.lclSeqNo} !`,
                                    type: "LEDGER",
                                    format: "text/csv"
                                }
                            });

                            const tx_filled = await DKM.autofillTx({tx: tx, multisig: true});
                            const tx_sig = await DKM.signTx(tx_filled);
                            const tx_result = await DKM.submitTx(tx_sig);
                        } catch (err) {
                            throw new Error(`ERROR: ${err}`);
                        }
                    }
                }
            }
        }
    }
    
    await DKM.close();
};

