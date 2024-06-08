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

    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className={styles.cards}>
                    <Card title="Vulnerable Bank" time="Last Updated: 30/05/2024, 7:10:02 AM" number="SP6527H2G38..." detail="2" positive={false} />
                    <Card title="Test Contract" time="Last Updated: 30/05/2024, 7:10:02 AM" number="SP2470N2A31..." detail="1" positive={false} />
                </div>
                <div className={styles.cards}>
                    {loading ? (
                        <p>Loading wallet...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <p>Wallet Address: {walletAddress}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
