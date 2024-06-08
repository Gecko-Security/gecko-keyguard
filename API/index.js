// const express = require('express');
// const bodyParser = require('body-parser');
// const xrpl = require('xrpl');

// const app = express();
// const port = 3000;

// // Middleware to parse JSON bodies
// app.use(bodyParser.json());


// // POST request to add an item
// app.get('/createWallet', async (req, res) => {
//     try {
//         const api = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
//         await api.connect();
//         const { wallet, balance } = await api.fundWallet();

// // Disable the master key
//         const prepared = await api.autofill({
//             TransactionType: "AccountSet",
//             Account: wallet.address,
//             SetFlag: xrpl.AccountSetAsfFlags.asfDisableMaster
//         });

//         const signed = wallet.sign(prepared);
//         const result = await api.submitAndWait(signed.tx_blob);

//         await api.disconnect();

//         if (result.result.meta.TransactionResult === 'tesSUCCESS') {
//             res.status(201).json({ message: 'Wallet Created and Master Key Disabled', wallet, balance });
//         } else {
//             res.status(500).json({ error: 'Failed to disable master key', result });
//         }
//     } catch (error) {
//         console.error('Error generating wallet:', error);
//         res.status(500).json({ error: 'Error generating wallet' });
//     }
// });

// app.post('/shareWallet', (req, res) => {
    
//     //shareWalletFunction
//     info = []
    
//     res.status(201).json({ message: 'Wallet Shared', info });
// });


// // GET request to retrieve all items
// app.get('/deleteWallet', (req, res) => {
//     //deleteWalletFunction
//     res.json({message: "Wallet Deleted"});
// });

// app.get('/items', (req, res) => {
//     res.json(items);
// });




// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });



const express = require('express');
const bodyParser = require('body-parser');
const xrpl = require('xrpl');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.post('/create-multisig-wallet', async (req, res) => {
    const { signers, signerQuorum } = req.body;

    if (!Array.isArray(signers) || signers.length === 0 || !signerQuorum) {
        return res.status(400).send('Invalid request payload');
    }

    try {
        // Connect to the XRPL testnet
        const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();

        // Create a main wallet (to be the multisig wallet)
        const mainWallet = (await client.fundWallet()).wallet;
        console.log(`Main wallet address: ${mainWallet.address}`);

        // Prepare the signers list
        const signerEntries = signers.map(signer => ({
            SignerEntry: {
                Account: signer.account,
                SignerWeight: signer.weight
            }
        }));

        // Configure the multisig settings on the main wallet
        const multisigTx = {
            TransactionType: 'SignerListSet',
            Account: mainWallet.classicAddress,
            SignerQuorum: signerQuorum,
            SignerEntries: signerEntries
        };

        // Submit the multisig settings transaction
        const prepared = await client.autofill(multisigTx);
        const signed = mainWallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        // Disconnect from the client
        await client.disconnect();

        res.status(200).send({
            mainWalletAddress: mainWallet.classicAddress,
            transactionResult: result.result.meta.TransactionResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while creating the multisig wallet');
    }
});

// Other routes...

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
