import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    // TODO: Add admin role check once Better Auth admin plugin is integrated.
    // For now, any authenticated user can reach this page.
    // Future implementation:
    // if (session.user.role !== "admin") {
    //     redirect("/user/bookmarker");
    // }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {session.user.name}. Admin controls will appear here.</p>
        </div>
    );
}