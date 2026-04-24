"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-clients";
import styles from "../auth.module.css";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error: signInError } = await signIn.email({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message ?? "Invalid email or password.");
            } else {
                router.push("/user/bookmarker");
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1 className={styles.authTitle}>Welcome back</h1>
                    <p className={styles.authSubtitle}>
                        Sign in to continue to your bookmarks
                    </p>
                </div>

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.errorMessage}>{error}</div>
                    )}

                    <div className={styles.fieldGroup}>
                        <label htmlFor="email" className={styles.fieldLabel}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className={styles.fieldInput}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="password" className={styles.fieldLabel}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className={styles.fieldInput}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>


                <p className={styles.authFooter}>
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className={styles.authLink}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}