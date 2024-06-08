"use client";

import { useState, useEffect } from 'react';
import Card from "../ui/dashboard/card/card";
import styles from "../ui/dashboard/dashboard.module.css";
import Transactions from "../ui/dashboard/transactions/transactions";
import Rightbar from "../ui/dashboard/rightbar/rightbar";
import sdk from '@crossmarkio/sdk';

const Dashboard = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionId, setTransactionId] = useState(null);

    useEffect(() => {
        const connectWallet = async () => {
            try {
                let { request, response, createdAt, resolvedAt } = await sdk.methods.signInAndWait();
                setWalletAddress(response.data.address);
            } catch (error) {
                setError('Failed to connect wallet');
            } finally {
                setLoading(false);
            }
        };

        connectWallet();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!destination || !amount) {
            setError('Please fill in both fields');
            return;
        }

        try {
            let id = await sdk.sync.signAndSubmit({
                TransactionType: 'Payment',
                Account: walletAddress,
                Destination: destination,
                Amount: amount, // XRP in drops
            });
            setTransactionId(id);
            setError(null); // Clear any previous errors
        } catch (error) {
            setError('Failed to send transaction');
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className={styles.cards}>
                    <Card title="Vulnerable Bank" time="Last Updated: 30/05/2024, 7:10:02 AM" number="SP6527H2G38..." detail="2" positive={false} />
                    <Card title="Test Contract" time="Last Updated: 30/05/2024, 7:10:02 AM" number="SP2470N2A31..." detail="1" positive={false} />
                    <Card title="ALEX Token" time="Last Updated: 30/05/2024, 7:10:02 AM" number="SP1YK770QXS..." detail="" positive={true} />
                </div>
                <div className={styles.cards}>
                    {loading ? (
                        <p>Loading wallet...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <>
                            <p>Wallet Address: {walletAddress}</p>
                            <form onSubmit={handleSend} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="destination">Destination Address:</label>
                                    <input
                                        type="text"
                                        id="destination"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="amount">Amount (in drops):</label>
                                    <input
                                        type="text"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <button type="submit" className={styles.button}>Send</button>
                            </form>
                            {transactionId && <p>Transaction ID: {transactionId}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
