import { useState } from 'react';
import styles from './dkmi-card.module.css';
import Image from "next/image";
import { MdIosShare } from 'react-icons/md';
import Button from '../button/button';

const DKMICard = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [signers, setSigners] = useState([]);
    const [publicKey, setPublicKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [destination1, setDestination1] = useState('');
    const [amount1, setAmount1] = useState('');
    const [transactionIds, setTransactionIds] = useState([]);
    const storedAddress = "raF3An625yzS3EksmJSwJmmqVG1tZpL192";
    const storedAmount = "500000";
    const storedAddress1 = "r4yYS7d4nC1ssvjsk3UNzyvYxVLgeWgUUq";
    const storedAmount1 = "100000";

    const generateAndFundWallet = async () => {
        setLoading(true);
        try {
            const signersResponse = await fetch('http://localhost:3030/generate-signers');
            if (!signersResponse.ok) {
                throw new Error(`Error generating signers: ${signersResponse.statusText}`);
            }
            const signersData = await signersResponse.json();

            const signers = [
                { account: signersData.address1, seed: signersData.seed1, weight: 1 },
                { account: signersData.address2, seed: signersData.seed2, weight: 1 },
                { account: signersData.address3, seed: signersData.seed3, weight: 1 },
            ];

            const multiSigResponse = await fetch('http://localhost:3030/create-multisig-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signers: signers.map(({ account, weight }) => ({ account, weight })),
                    signerQuorum: 2,
                }),
            });
            if (!multiSigResponse.ok) {
                throw new Error(`Error creating multi-signature wallet: ${multiSigResponse.statusText}`);
            }
            const multiSigData = await multiSigResponse.json();

            setWalletAddress(multiSigData.mainWalletAddress);
            setSigners(signers);
            setPublicKey(multiSigData.mainWalletAddress);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!destination || !amount || !destination1 || !amount1) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const transaction1 = {
                TransactionType: 'Payment',
                Account: walletAddress,
                Destination: destination,
                Amount: amount,
                Fee: "15000",
                SigningPubKey: ""
            };

            const transaction2 = {
                TransactionType: 'Payment',
                Account: walletAddress,
                Destination: destination1,
                Amount: amount1,
                Fee: "15000",
                SigningPubKey: ""
            };

            const transactions = [transaction1, transaction2];
            const transactionHashes = [];

            for (const transaction of transactions) {
                const response = await fetch('http://localhost:3030/sign-multisig-transaction', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mainAddress: walletAddress,
                        signers,
                        transaction
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Error signing transaction: ${response.statusText}`);
                }
                // const result = await response.json();
                // console.log(`Transaction result for ${transaction.Destination}:`, result);
                // transactionHashes.push(result.result.tx_json.hash);
            }

            // setTransactionIds(transactionHashes);
            setError(null);
        } catch (error) {
            console.error('Error during transactions:', error);
            setError('Failed to send transactions');
        }
    };

    const shortenHash = (hash) => {
        if (!hash) return '';
        return `${hash.slice(0, 4)}...${hash.slice(-4)}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <Image className={styles.img} src="/xrp.png" alt="" width={60} height={60} />
                    <span className={styles.title}>Non-Custodial Transaction</span>
                </div>
                {loading ? (
                    <Button disabled>Generating...</Button>
                ) : error ? (
                    <p>{error}</p>
                ) : walletAddress ? (
                    <Button>Generated</Button>
                ) : (
                    <Button onClick={generateAndFundWallet}>Generate Keypair</Button>
                )}
            </div>
            <div className={styles.texts}>
                {walletAddress && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Public Key</label>
                            <div className={styles.addressContainer}>
                                <div className={styles.address}>{publicKey}</div>
                                <a href={`https://testnet.xrpl.org/accounts/${publicKey}`} target="_blank" rel="noopener noreferrer">
                                    <MdIosShare className={styles.shareIcon} />
                                </a>
                            </div>
                        </div>
                        <form onSubmit={handleSend} className={styles.form}>
                            <div className={styles.row}>
                                <div className={styles.column}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="destination" className={styles.label}>Destination</label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                type="text"
                                                id="destination"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                className={styles.input}
                                            />
                                            <Button type="button" onClick={() => setDestination(storedAddress)}>Paste</Button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="amount" className={styles.label}>Amount</label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                type="text"
                                                id="amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className={styles.input}
                                            />
                                            <Button type="button" onClick={() => setAmount(storedAmount)}>Paste</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.column}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="destination1" className={styles.label}>Destination</label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                type="text"
                                                id="destination1"
                                                value={destination1}
                                                onChange={(e) => setDestination1(e.target.value)}
                                                className={styles.input}
                                            />
                                            <Button type="button" onClick={() => setDestination1(storedAddress1)}>Paste</Button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="amount1" className={styles.label}>Amount</label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                type="text"
                                                id="amount1"
                                                value={amount1}
                                                onChange={(e) => setAmount1(e.target.value)}
                                                className={styles.input}
                                            />
                                            <Button type="button" onClick={() => setAmount1(storedAmount1)}>Paste</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className={styles.button}>Send</Button>
                        </form>
                        {transactionIds.length > 0 && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Transaction IDs</label>
                                <div className={styles.address}>
                                    {transactionIds.map((id, index) => (
                                        <div key={index}>
                                            <a href={`https://testnet.xrpl.org/transactions/${id}`} target="_blank" rel="noopener noreferrer" className={styles.hashLink}>
                                                {shortenHash(id)}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DKMICard;
