import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models/User"; // ✅ named export

export const authOptions: NextAuthOptions = {
  providers: [
    // --- Google OAuth ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // --- Email/Password ---
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await User.findOne({ email }).lean();
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // 1) Cuando loguea con Google, creamos usuario si no existe
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();

        const email = user.email?.toLowerCase();
        if (!email) return false;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          await User.create({
            email,
            name: user.name ?? "",
            image: user.image ?? "",
            address: {},
            arca: {},
            billing: {},
            paymentMethods: [],
          });
        } else {
          existingUser.name = user.name ?? existingUser.name;
          existingUser.image = user.image ?? existingUser.image;
          await existingUser.save();
        }
      }

      return true;
    },

    // 2) Guardamos userId en el token
    async jwt({ token }) {
      if (token?.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },

    // 3) Exponemos id en session.user
    async session({ session, token }) {
      if (session.user && token?.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
