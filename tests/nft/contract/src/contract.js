const DecentralizedKeyManagement = require("./DKIM");
const NPLBroker = require("./NLPbroker");

const mycontract = async (ctx) => {
    const npl = NPLBroker.init(ctx);

    console.log("\n - TEST 1: Initializing DKM");

    const DKM = new DecentralizedKeyManagement.Manager(ctx, npl, "hooks");

    try{
        var initResult = await DKM.init();
    } catch (err) {
        console.log(err);
    }

    console.log("\n - TEST 2: Sending Payment Transaction.");

    const tx = DKM.packageTxAPI({
        destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
        amount: ctx.lclSeqNo.toString(),
        memo: {
            data: "CHANGENOWORLOSEBRO",
            type: "21337",
            format: "text/csv"
        }
    });

    const tx_filled = await DKM.autofillTx({
        tx: tx,
        multisig: true
    });
    const tx_sig = await DKM.signTx(tx_filled);
    try {
        var tx_result = await DKM.submitTx(tx_sig);
    } catch (err) {
        console.log(err);
    }
    console.log("\n - TEST 3: Managing the state.");

    const state = await DKM.checkupSigners();

    console.log(`      Online peers: ${state.OnlineSigners.length}`);
    console.log(`     Offline peers: ${tate.OfflineSigners.length}`);
    console.log(` NPL Time duration: ${state.TimeTaken}ms / ${state.Timeout}ms`);

    await DKM.close();
};

