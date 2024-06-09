import { useState } from 'react';
import styles from './dkmi-card.module.css';
import Image from "next/image";
import * as xrpl from 'xrpl';
import Button from '../button/button';

const DKMICard = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [publicKey, setPublicKey] = useState(null);
    const [privateKey, setPrivateKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [destination1, setDestination1] = useState('');
    const [amount1, setAmount1] = useState('');
    const [transactionId, setTransactionId] = useState(null);
    const storedAddress = "raF3An625yzS3EksmJSwJmmqVG1tZpL192"; // Example stored value for paste functionality
    const storedAmount = "500000"; // Adjusted to a higher amount for demonstration
    const storedAddress1 = "r4yYS7d4nC1ssvjsk3UNzyvYxVLgeWgUUq";
    const storedAmount1 = "100000";

    const generateAndFundWallet = async () => {
        setLoading(true);
        try {
            const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
            await client.connect();

            const { wallet } = await client.fundWallet();
            setWalletAddress(wallet.address);
            setPublicKey(wallet.classicAddress);
            setPrivateKey(wallet.privateKey);

            await client.disconnect();
            setLoading(false);
        } catch (error) {
            setError('Failed to generate and fund wallet');
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
            const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
            await client.connect();

            const transaction1 = {
                TransactionType: 'Payment',
                Account: walletAddress,
                Destination: destination,
                Amount: xrpl.xrpToDrops(amount), // Convert XRP to drops
            };

            const transaction2 = {
                TransactionType: 'Payment',
                Account: walletAddress,
                Destination: destination1,
                Amount: xrpl.xrpToDrops(amount1), // Convert XRP to drops
            };

            const prepared1 = await client.autofill(transaction1);
            const signed1 = wallet.sign(prepared1);
            const result1 = await client.submitAndWait(signed1.tx_blob);

            const prepared2 = await client.autofill(transaction2);
            const signed2 = wallet.sign(prepared2);
            const result2 = await client.submitAndWait(signed2.tx_blob);

            setTransactionId(`${result1.tx_json.hash}, ${result2.tx_json.hash}`);
            setError(null); // Clear any previous errors

            await client.disconnect();
        } catch (error) {
            console.error('Error during transactions:', error);
            setError('Failed to send transactions');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <Image className={styles.img} src="/clarity.png" alt="" width={60} height={60} />
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
                            <div className={styles.address}>{publicKey}</div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Private Key</label>
                            <div className={styles.address}>{privateKey}</div>
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
                        {transactionId && <p>Transaction ID: {transactionId}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default DKMICard;

