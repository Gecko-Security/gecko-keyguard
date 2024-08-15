const express = require('express');
const bodyParser = require('body-parser');
const xrpl = require('xrpl');
const cors = require('cors');

const app = express();
const port = 3030;

app.use(cors());
app.use(bodyParser.json());

app.post('/create-multisig-wallet', async (req, res) => {
    const { signers, signerQuorum } = req.body;

    if (!Array.isArray(signers) || signers.length === 0 || !signerQuorum) {
        return res.status(400).send('Invalid request payload');
    }

    try {
        const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();
        const mainWallet = (await client.fundWallet()).wallet;
        console.log(`Main wallet address: ${mainWallet.address}`);

        const signerEntries = signers.map(signer => ({
            SignerEntry: {
                Account: signer.account,
                SignerWeight: signer.weight
            }
        }));

        const multisigTx = {
            TransactionType: 'SignerListSet',
            Account: mainWallet.classicAddress,
            SignerQuorum: signerQuorum,
            SignerEntries: signerEntries
        };

        const preparedMultisigTx = await client.autofill(multisigTx);
        const signedMultisigTx = mainWallet.sign(preparedMultisigTx);
        const resultMultisigTx = await client.submitAndWait(signedMultisigTx.tx_blob);

        const disableMasterKeyTx = {
            TransactionType: 'AccountSet',
            Account: mainWallet.classicAddress,
            SetFlag: xrpl.AccountSetAsfFlags.asfDisableMaster
        };

        const preparedDisableTx = await client.autofill(disableMasterKeyTx);
        const signedDisableTx = mainWallet.sign(preparedDisableTx);
        const resultDisableTx = await client.submitAndWait(signedDisableTx.tx_blob);

        await client.disconnect();

        res.status(200).send({
            mainWalletAddress: mainWallet.classicAddress,
            multisigTransactionResult: resultMultisigTx.result.meta.TransactionResult,
            disableMasterKeyTransactionResult: resultDisableTx.result.meta.TransactionResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while creating the multisig wallet');
    }
});

app.get('/generate-signers', async (req, res) => {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    
    try {
        const [signer1, signer2, signer3] = await Promise.all([
            client.fundWallet(),
            client.fundWallet(),
            client.fundWallet()
        ]);

        res.json({
            address1: signer1.wallet.address, seed1: signer1.wallet.seed,
            address2: signer2.wallet.address, seed2: signer2.wallet.seed,
            address3: signer3.wallet.address, seed3: signer3.wallet.seed
        });
    } catch (error) {
        console.error(`Error generating wallet: ${error}`);
        res.status(500).json({ error: 'Failed to generate wallet' });
    } finally {
        client.disconnect();
    }
});

app.post('/sign-multisig-transaction', async (req, res) => {
    const { mainAddress, signers, transaction } = req.body;

    if (!mainAddress || !Array.isArray(signers) || signers.length !== 3 || !transaction) {
        return res.status(400).send('Invalid request payload');
    }

    try {
        const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();

        const wallets = signers.map(signer => xrpl.Wallet.fromSeed(signer.seed));

        const preparedTx = await client.autofill(transaction);
        console.log('Prepared Transaction:', preparedTx);

        const signFor = (signer, preparedTx) => {
            const signedTx = signer.sign(preparedTx, true);
            return signedTx.tx_blob;
        };

        const txBlobs = await Promise.all(wallets.map(wallet => signFor(wallet, preparedTx)));
        console.log('Signed Transaction Blobs:', txBlobs);

        const multisignedTx = xrpl.multisign(txBlobs);
        console.log('Multisigned Transaction:', multisignedTx);

        const submitResponse = await client.submit(multisignedTx);
        console.log('response:', submitResponse);

        if (submitResponse.result.engine_result === 'tesSUCCESS') {
            res.status(200).send({
                transactionResult: submitResponse.result.meta ? submitResponse.result.meta.TransactionResult : 'No TransactionResult',
                signers: submitResponse.result.tx_json.Signers
            });
        } else {
            res.status(500).send({
                error: "The multisigned transaction was rejected by rippled",
                submitResponse
            });
        }

        await client.disconnect();
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while signing the multisig transaction');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
