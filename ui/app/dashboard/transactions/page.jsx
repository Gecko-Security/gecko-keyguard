"use client";

import { useState, useEffect } from 'react';
import styles from "@/app/ui/dashboard/scan/scan.module.css";
import { MdCheck, MdClose } from "react-icons/md";
import transactionsData from './data.json';

const ScanPage = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        // Load transactions from the JSON file
        setTransactions(transactionsData);
    }, []);

    const shortenHash = (hash) => {
        return `${hash.slice(0, 4)}...${hash.slice(-4)}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}></div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Sending Address</th>
                            <th>Receiving Address</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Signer Approval</th>
                            <th>Transaction Hash</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{transaction.sendingAddress}</td>
                                <td>{transaction.receivingAddress}</td>
                                <td>{transaction.amount}</td>
                                <td>{transaction.type}</td>
                                <td className={styles.signerApproval}>
                                    <div>
                                        {transaction.signerApproval.map((approval, idx) => (
                                            approval ? <MdCheck key={idx} className={styles.tick} /> : <MdClose key={idx} className={`${styles.tick} ${styles.cross}`} />
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <a href={`https://testnet.xrpl.org/transactions/${transaction.transactionHash}`} target="_blank" rel="noopener noreferrer" className={styles.hashLink}>
                                        {shortenHash(transaction.transactionHash)}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScanPage;
