import styles from "./Footer.module.css";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <span className={styles.brand}>
                Gah<span className={styles.brandAccent}>wua</span>
            </span>
            <span className={styles.copyright}>
                &copy; {year} Gahwua. All rights reserved.
            </span>
        </footer>
    );
}
