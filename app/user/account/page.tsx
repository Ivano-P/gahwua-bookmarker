"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-clients";
import { authClient } from "@/lib/auth-clients";
import styles from "./account.module.css";

export default function AccountPage() {
    const { data: session, isPending } = useSession();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const { error: changeError } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: false,
            });

            if (changeError) {
                setError(changeError.message ?? "Failed to change password.");
            } else {
                setSuccess("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className={styles.accountPage}>
                <div className={styles.accountContainer}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const user = session.user;
    const initials = (user.name ?? user.email ?? "?")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={styles.accountPage}>
            <div className={styles.accountContainer}>
                <div className={styles.accountHeader}>
                    <h1 className={styles.accountTitle}>My Account</h1>
                    <p className={styles.accountSubtitle}>
                        Manage your profile and security settings
                    </p>
                </div>

                {/* Avatar + Greeting */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatarLarge}>{initials}</div>
                    <div className={styles.avatarGreeting}>
                        <span className={styles.avatarName}>{user.name}</span>
                        <span className={styles.avatarEmail}>{user.email}</span>
                    </div>
                </div>

                {/* User Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Profile Information</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Username</span>
                            <span className={styles.infoValue}>
                                {(user as Record<string, unknown>).username as string ?? "—"}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email</span>
                            <span className={styles.infoValue}>
                                {user.email}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Name</span>
                            <span className={styles.infoValue}>
                                {user.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Change Password</h2>
                    <form
                        className={styles.passwordForm}
                        onSubmit={handleChangePassword}
                    >
                        {error && (
                            <div className={styles.errorMessage}>{error}</div>
                        )}
                        {success && (
                            <div className={styles.successMessage}>
                                {success}
                            </div>
                        )}

                        <div className={styles.fieldGroup}>
                            <label
                                htmlFor="current-password"
                                className={styles.fieldLabel}
                            >
                                Current Password
                            </label>
                            <input
                                id="current-password"
                                type="password"
                                className={styles.fieldInput}
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label
                                htmlFor="new-password"
                                className={styles.fieldLabel}
                            >
                                New Password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                className={styles.fieldInput}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label
                                htmlFor="confirm-password"
                                className={styles.fieldLabel}
                            >
                                Confirm New Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                className={styles.fieldInput}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading
                                ? "Updating…"
                                : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
