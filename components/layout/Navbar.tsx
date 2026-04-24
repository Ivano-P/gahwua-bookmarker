"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-clients";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Coffee } from "lucide-react";
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

    const getInitials = (name?: string | null, email?: string | null) => {
        const source = name ?? email ?? "?";
        return source
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
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
                            <Button asChild variant="ghost" className={styles.pageLink}>
                                <Link href="/cafe"><Coffee size={16} /> Cafe</Link>
                            </Button>
                        </div>

                        {/* Avatar Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className={styles.avatarTrigger}>
                                <Avatar size="default">
                                    <AvatarFallback className={styles.avatarFallback}>
                                        {getInitials(session.user.name, session.user.email)}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={styles.dropdownContent}>
                                <DropdownMenuLabel className={styles.dropdownLabel}>
                                    <span className={styles.dropdownName}>{session.user.name}</span>
                                    <span className={styles.dropdownEmail}>{session.user.email}</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className={styles.dropdownItem}
                                    onClick={() => router.push("/user/account")}
                                >
                                    <User className={styles.dropdownIcon} />
                                    My Account
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className={styles.dropdownItem}
                                    onClick={handleSignOut}
                                >
                                    <LogOut className={styles.dropdownIcon} />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        <div className={styles.centerLink}>
                            <Button asChild variant="ghost" className={styles.pageLink}>
                                <Link href="/cafe"><Coffee size={16} /> Cafe</Link>
                            </Button>
                        </div>
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
                            <Button asChild variant="ghost" className={styles.pageLink} onClick={closeMenu}>
                                <Link href="/cafe">Cafe</Link>
                            </Button>
                            <Button asChild variant="ghost" className={styles.pageLink} onClick={closeMenu}>
                                <Link href="/user/account">My Account</Link>
                            </Button>
                            <Button className={styles.authButton} onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className={styles.pageLink} onClick={closeMenu}>
                                <Link href="/cafe">Cafe</Link>
                            </Button>
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
