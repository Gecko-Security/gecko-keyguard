"use client";

import { useState, useEffect } from 'react';
import Card from "../ui/dashboard/card/card";
import DKMICard from '../ui/dashboard/dkmi-card/dkmi-card';
import styles from "../ui/dashboard/dashboard.module.css";

const Dashboard = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className={styles.cards}>
                    <Card/>
                    <DKMICard/>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
