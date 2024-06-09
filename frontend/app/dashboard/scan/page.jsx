import styles from "@/app/ui/dashboard/scan/scan.module.css";
import { MdCheck, MdClose } from "react-icons/md";

const ScanPage = () => {
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
                        <tr>
                            <td>rGtqnorC826zAfXbyWd53GNtycF8pFVCWW</td>
                            <td>r4yYS7d4nC1ssvjsk3UNzyvYxVLgeWgUUq</td>
                            <td>0.5 XRP</td>
                            <td>Payment</td>
                            <td className={styles.signerApproval}>
                                <div>
                                    <MdCheck className={styles.tick} />
                                    <MdCheck className={styles.tick} />
                                    <MdClose className={styles.tick} />
                                </div>
                            </td>
                            <td>D878DF...EC576E</td>
                        </tr>
                        <tr>
                            <td>rGtqnorC826zAfXbyWd53GNtycF8pFVCWW</td>
                            <td>r4yYS7d4nC1ssvjsk3UNzyvYxVLgeWgUUq</td>
                            <td>0.5 XRP</td>
                            <td>Payment</td>
                            <td className={styles.signerApproval}>
                                <div>
                                    <MdCheck className={styles.tick} />
                                    <MdCheck className={styles.tick} />
                                    <MdClose className={styles.tick} />
                                </div>
                            </td>
                            <td>D878DF...EC576E</td>
                        </tr>
                        <tr>
                            <td>rGtqnorC826zAfXbyWd53GNtycF8pFVCWW</td>
                            <td>r4yYS7d4nC1ssvjsk3UNzyvYxVLgeWgUUq</td>
                            <td>0.5 XRP</td>
                            <td>Payment</td>
                            <td className={styles.signerApproval}>
                                <div>
                                    <MdCheck className={styles.tick} />
                                    <MdCheck className={styles.tick} />
                                    <MdClose className={styles.tick} />
                                </div>
                            </td>
                            <td>D878DF...EC576E</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScanPage;
