"use client";

import { Users } from "lucide-react";
import styles from "@/app/admin/users/page.module.css";

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: string;
  banned: boolean;
  createdAt: string;
  _count: { bookmarks: number };
}

interface AdminUsersListProps {
  users: UserData[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminUsersList({ users }: AdminUsersListProps) {
  if (users.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Users className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>No users found</h2>
      </div>
    );
  }

  return (
    <div className={styles.userList}>
      {users.map((user) => (
        <div key={user.id} className={styles.userRow}>
          {/* Avatar */}
          <div className={styles.userAvatar}>
            {getInitials(user.name)}
          </div>

          {/* Info */}
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user.name}
              {user.username && (
                <span style={{ fontWeight: 400, opacity: 0.5, marginLeft: "0.3rem" }}>
                  @{user.username}
                </span>
              )}
            </span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>

          {/* Meta (desktop only) */}
          <div className={styles.userMeta}>
            <span>{user._count.bookmarks} bookmarks</span>
            <span>
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Role Badge */}
          <span
            className={`${styles.roleBadge} ${
              user.role === "admin" ? styles.roleAdmin : styles.roleUser
            }`}
          >
            {user.role}
          </span>
        </div>
      ))}
    </div>
  );
}
