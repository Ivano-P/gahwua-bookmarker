"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-clients";
import { Button } from "@/components/ui/button";
import styles from "./Navbar.module.css";

export function Navbar() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                Gah<span className={styles.logoAccent}>wua</span>
            </Link>

            <div className={styles.navLinks}>
                {isPending ? null : session ? (
                    <>
                        <Button asChild variant="ghost">
                            <Link href="/user/bookmarker">Bookmarker</Link>
                        </Button>
                        <Button variant="outline" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button asChild variant="ghost">
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/sign-up">Sign Up</Link>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
}
