import styles from "./Footer.module.css";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
                <Link href="/" className={styles.logo}>
                <Image
                    src="/images/GahwuaBookmarkerLogo.png"
                    alt="Gahwua Bookmarker"
                    width={160}
                    height={40}
                    className={styles.logoImage}
                    priority
                />
            </Link>

           
            <span className={styles.copyright}>
                &copy; {year} Gahwua. All rights reserved.
            </span>
        </footer>
    );
}
