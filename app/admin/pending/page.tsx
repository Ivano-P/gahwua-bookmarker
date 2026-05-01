import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPendingComicsAction } from "@/app/actions/admin.actions";
import { PendingComicsList } from "@/components/admin/PendingComicsList";
import styles from "./page.module.css";

export default async function AdminPendingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    if (session.user.role !== "admin") {
        redirect("/user/bookmarker");
    }

    const result = await getPendingComicsAction();

    if ("error" in result) {
        return (
            <div className={styles.dashboardContainer}>
                <p>Something went wrong loading pending comics.</p>
            </div>
        );
    }

    const comics = result.data;

    const serializedComics = comics.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        description: c.description,
        imageUrl: c.imageUrl,
        createdAt: c.createdAt.toISOString(),
        sources: c.sources.map((s) => ({
            id: s.id,
            url: s.url,
            siteName: s.siteName,
            language: s.language,
        })),
        submittedBy: c.submittedBy,
        _count: c._count,
    }));

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <h1 className={styles.dashboardTitle}>Pending Comics</h1>
                    <span className={styles.pendingCount}>
                        {comics.length} pending
                    </span>
                </div>
            </div>
            <PendingComicsList comics={serializedComics} />
        </div>
    );
}
