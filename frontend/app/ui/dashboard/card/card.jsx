import { useState } from 'react';
import styles from './card.module.css';
import Image from "next/image";
import sdk from '@crossmarkio/sdk';
import Button from '../button/button';

const Card = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [loading, setLoading] = useState(false); // Initially set to false
    const [error, setError] = useState(null);
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionId, setTransactionId] = useState(null);
    const storedAddress = "raF3An625yzS3EksmJSwJmmqVG1tZpL192"; // Example stored value for paste functionality
    const storedAmount = "500000"; // Adjusted to a higher amount for demonstration

    const connectWallet = async () => {
        setLoading(true); // Set loading to true when connecting
        try {
            let { request, response, createdAt, resolvedAt } = await sdk.methods.signInAndWait();
            console.log('Wallet connected:', response.data.address);
            setWalletAddress(response.data.address);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            setError('Failed to connect wallet');
        } finally {
            setLoading(false); // Set loading to false when done
        }
    };

    const pollTransactionStatus = async (id, maxRetries = 10, delay = 5000) => {
        for (let i = 0; i < maxRetries; i++) {
            const responseData = await sdk.sync.getResponse(id);
            if (responseData) {
                return responseData;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        throw new Error('Transaction response polling timed out');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!destination || !amount) {
            setError('Please fill in both fields');
            return;
        }

        try {
            console.log("Starting transaction...");

            let id = await sdk.sync.signAndSubmit({
                TransactionType: 'Payment',
                Account: walletAddress,
                Destination: destination,
                Amount: amount, // XRP in drops
            });

            console.log("Transaction submitted with ID:", id);

            const responseData = await pollTransactionStatus(id);

            const { request, response, createdAt, resolvedAt } = responseData;

            console.log("Transaction details:", response);

            setTransactionId(response.data.resp.result.hash);
            setError(null); // Clear any previous errors
            window.open(`https://testnet.xrpl.org/transactions/${response.data.resp.result.hash}`, '_blank');

        } catch (error) {
            console.error('Error during transaction:', error);
            setError('Failed to send transaction');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <Image className={styles.img} src="/xrp.png" alt="" width={60} height={60} />
                    <span className={styles.title}>Traditional Transaction</span>
                </div>
                {loading ? (
                    <Button disabled>Connecting...</Button>
                ) : error && !walletAddress ? (
                    <p>{error}</p>
                ) : walletAddress ? (
                    <Button>Connected</Button>
                ) : (
                    <Button onClick={connectWallet}>Connect Wallet</Button>
                )}
            </div>
            <div className={styles.texts}>
                {walletAddress && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Wallet Address</label>
                            <div className={styles.address}>{walletAddress}</div>
                        </div>
                        <form onSubmit={handleSend} className={styles.form}>
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
                            <Button type="submit" className={styles.button}>Send</Button>
                        </form>
                        {transactionId && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Transaction ID</label>
                                <div className={styles.address}>{transactionId}</div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Card;
