"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-clients";
import styles from "../auth.module.css";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error: signUpError } = await signUp.email({
                email,
                password,
                name,
            });

            if (signUpError) {
                setError(
                    signUpError.message ?? "Could not create account."
                );
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
                    <h1 className={styles.authTitle}>Create your account</h1>
                    <p className={styles.authSubtitle}>
                        Start tracking your comics today
                    </p>
                </div>

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.errorMessage}>{error}</div>
                    )}

                    <div className={styles.fieldGroup}>
                        <label htmlFor="name" className={styles.fieldLabel}>
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            className={styles.fieldInput}
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? "Creating account…" : "Create Account"}
                    </button>
                </form>

                <p className={styles.authFooter}>
                    Already have an account?{" "}
                    <Link href="/sign-in" className={styles.authLink}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}