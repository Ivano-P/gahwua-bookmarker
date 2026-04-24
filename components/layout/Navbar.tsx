"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-clients";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

export function Navbar() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMenu = () => setIsMobileMenuOpen(false);

    const handleSignOut = async () => {
        await signOut();
        closeMenu();
        router.push("/");
        router.refresh();
    };

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo} onClick={closeMenu}>
                <Image
                    src="/images/GahwuaBookmarkerLogo.png"
                    alt="Gahwua Bookmarker"
                    width={160}
                    height={40}
                    className={styles.logoImage}
                    priority
                />
            </Link>

            {/* Desktop Navigation */}
            <div className={styles.desktopNav}>
                {isPending ? null : session ? (
                    <>
                        <div className={styles.centerLink}>
                            <Button asChild variant="ghost" className={styles.pageLink}>
                                <Link href="/user/bookmarker">Bookmarker</Link>
                            </Button>
                        </div>
                        <Button className={styles.authButton} onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button asChild className={styles.authButton}>
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button asChild className={styles.authButton}>
                            <Link href="/sign-up">Sign Up</Link>
                        </Button>
                    </>
                )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button 
                className={styles.mobileMenuToggle}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className={styles.mobileNav}>
                    {isPending ? null : session ? (
                        <>
                            <Button asChild variant="ghost" className={styles.pageLink} onClick={closeMenu}>
                                <Link href="/user/bookmarker">Bookmarker</Link>
                            </Button>
                            <Button className={styles.authButton} onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild className={styles.authButton} onClick={closeMenu}>
                                <Link href="/sign-in">Sign In</Link>
                            </Button>
                            <Button asChild className={styles.authButton} onClick={closeMenu}>
                                <Link href="/sign-up">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
