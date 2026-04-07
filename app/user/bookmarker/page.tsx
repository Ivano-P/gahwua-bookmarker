import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Bookmarker() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>My Comic Bookmarks</h1>
            <p>Welcome back, {session.user.name}! Your bookmarks will appear here.</p>
        </div>
    );
}