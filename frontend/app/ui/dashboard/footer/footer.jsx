import styles from './footer.module.css'

const Footer = () => {
    return (
        <div className={styles.container}>
            <div className={styles.logo}>DKMI</div>
            <div className={styles.text}>XRPL</div>
        </div>
    )
}

export default Footer