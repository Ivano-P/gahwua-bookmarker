import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username, admin } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // changed from sqlite to match your schema
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username(),
        admin(),
    ],
});