import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminUsersAction } from "@/app/actions/admin.actions";
import { AdminUsersList } from "@/components/admin/AdminUsersList";
import styles from "./page.module.css";

export default async function AdminUsersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    if (session.user.role !== "admin") {
        redirect("/user/bookmarker");
    }

    const result = await getAdminUsersAction();

    if ("error" in result) {
        return (
            <div className={styles.dashboardContainer}>
                <p>Something went wrong loading users.</p>
            </div>
        );
    }

    const users = result.data;

    // Serialize dates for client component
    const serializedUsers = users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
    }));

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <h1 className={styles.dashboardTitle}>Users</h1>
                    <span className={styles.userCount}>
                        {users.length} user{users.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>
            <AdminUsersList users={serializedUsers} />
        </div>
    );
}
