import styles from './button.module.css';

const Button = ({ onClick, type = 'button', children }) => {
    return (
        <button type={type} onClick={onClick} className={styles.button}>
            {children}
        </button>
    );
};

export default Button;