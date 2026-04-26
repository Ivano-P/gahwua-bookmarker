import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminComicsAction } from "@/app/actions/admin.actions";
import { AdminComicsList } from "@/components/admin/AdminComicsList";
import styles from "./page.module.css";

export default async function AdminDashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    if (session.user.role !== "admin") {
        redirect("/user/bookmarker");
    }

    const result = await getAdminComicsAction();

    if ("error" in result) {
        return (
            <div className={styles.dashboardContainer}>
                <p>Something went wrong loading comics.</p>
            </div>
        );
    }

    const comics = result.data;

    // Serialize for client component
    const serializedComics = comics.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        description: c.description,
        imageUrl: c.imageUrl,
        sources: c.sources.map((s) => ({
            id: s.id,
            url: s.url,
            siteName: s.siteName,
        })),
        chapterLinks: c.chapterLinks.map((ch) => ({
            id: ch.id,
            chapterNum: ch.chapterNum,
            url: ch.url,
            source: ch.source
                ? { siteName: ch.source.siteName }
                : null,
        })),
        _count: c._count,
    }));

    return (
        <div className={styles.dashboardContainer}>
            <AdminComicsList comics={serializedComics} />
        </div>
    );
}