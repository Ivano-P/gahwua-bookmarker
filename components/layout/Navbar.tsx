"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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
import { Menu, X, User, LogOut, Coffee, Bookmark, Shield, BookOpen, Users, Clock } from "lucide-react";
import styles from "./Navbar.module.css";

export function Navbar() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();
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

    const isAdmin = session?.user?.role === "admin";

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
                            <Button asChild variant="ghost" className={`${styles.pageLink} ${pathname.startsWith('/user/bookmarker') ? styles.activePageLink : ''}`}>
                                <Link href="/user/bookmarker"><Bookmark size={16} /> Bookmarker</Link>
                            </Button>
                            <Button asChild variant="ghost" className={`${styles.pageLink} ${pathname.startsWith('/cafe') ? styles.activePageLink : ''}`}>
                                <Link href="/cafe"><Coffee size={16} /> Cafe</Link>
                            </Button>
                        </div>

                        {/* Admin Dropdown (desktop) */}
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger className={`${styles.adminTrigger} ${pathname.startsWith('/admin') ? styles.adminTriggerActive : ''}`}>
                                    <Shield size={16} />
                                    <span>Admin</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className={styles.dropdownContent}>
                                    <DropdownMenuLabel className={styles.dropdownLabel}>
                                        <span className={styles.dropdownName}>Administration</span>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className={styles.dropdownItem}
                                        onClick={() => router.push("/admin/dashboard")}
                                    >
                                        <BookOpen className={styles.dropdownIcon} />
                                        Comics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className={styles.dropdownItem}
                                        onClick={() => router.push("/admin/pending")}
                                    >
                                        <Clock className={styles.dropdownIcon} />
                                        Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className={styles.dropdownItem}
                                        onClick={() => router.push("/admin/users")}
                                    >
                                        <Users className={styles.dropdownIcon} />
                                        Users
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

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
                            <Button asChild variant="ghost" className={`${styles.pageLink} ${pathname.startsWith('/cafe') ? styles.activePageLink : ''}`}>
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
                            <Button asChild variant="ghost" className={`${styles.pageLink} ${pathname.startsWith('/user/bookmarker') ? styles.activePageLink : ''}`} onClick={closeMenu}>
                                <Link href="/user/bookmarker"><Bookmark size={16} /> Bookmarker</Link>
                            </Button>
                            <Button asChild variant="ghost" className={`${styles.pageLink} ${pathname.startsWith('/cafe') ? styles.activePageLink : ''}`} onClick={closeMenu}>
                                <Link href="/cafe">Cafe</Link>
                            </Button>
                            <Button asChild variant="ghost" className={styles.pageLink} onClick={closeMenu}>
                                <Link href="/user/account">My Account</Link>
                            </Button>

                            {/* Admin links (mobile) */}
                            {isAdmin && (
                                <>
                                    <div className={styles.mobileAdminDivider}>
                                        <Shield size={14} />
                                        <span>Admin</span>
                                    </div>
                                    <Button asChild variant="ghost" className={`${styles.pageLink} ${styles.mobileAdminLink} ${pathname === '/admin/dashboard' ? styles.activePageLink : ''}`} onClick={closeMenu}>
                                        <Link href="/admin/dashboard"><BookOpen size={14} /> Comics</Link>
                                    </Button>
                                    <Button asChild variant="ghost" className={`${styles.pageLink} ${styles.mobileAdminLink} ${pathname === '/admin/pending' ? styles.activePageLink : ''}`} onClick={closeMenu}>
                                        <Link href="/admin/pending"><Clock size={14} /> Pending</Link>
                                    </Button>
                                    <Button asChild variant="ghost" className={`${styles.pageLink} ${styles.mobileAdminLink} ${pathname === '/admin/users' ? styles.activePageLink : ''}`} onClick={closeMenu}>
                                        <Link href="/admin/users"><Users size={14} /> Users</Link>
                                    </Button>
                                </>
                            )}

                            <Button className={styles.authButton} onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className={`${styles.pageLink} ${pathname.startsWith('/cafe') ? styles.activePageLink : ''}`} onClick={closeMenu}>
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
