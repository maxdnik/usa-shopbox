import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
        // Agregamos el campo opcional para la señal de seguridad
        loginType: { label: "Login Type", type: "text" } 
      },
      async authorize(credentials) {
        // Detectamos si vienen del Portal Admin
        const isAdminPortal = credentials?.loginType === "admin";
        
        // --- 1. INTENTO CON LLAVE MAESTRA (PRIORIDAD) ---
        const adminPw = process.env.ADMIN_PASSWORD;
        const inputEmail = credentials?.email;

        if (
          adminPw && 
          credentials?.password === adminPw && 
          (inputEmail === "admin" || inputEmail === "maxidimnik@gmail.com")
        ) {
          return {
            id: "master-admin",
            name: "Administrador",
            email: "maxidimnik@gmail.com", 
            image: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
            role: "admin"
          };
        }

        // --- 2. INTENTO CON BASE DE DATOS (NORMAL) ---
        await dbConnect();
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await User.findOne({ email }).lean();
        
        // Si el usuario no existe o el password está mal -> Reject
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // 🔥 3. FILTRO DE SEGURIDAD PARA ADMIN 🔥
        // Si vino desde el formulario de Admin, PERO el usuario NO es Maxi -> REJECT
        if (isAdminPortal) {
           if (user.email !== "maxidimnik@gmail.com") {
              // Aquí bloqueamos a prueba2@gmail.com aunque su pass sea correcto
              return null; 
           }
        }

        // Si pasó todos los filtros, devolvemos el usuario
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
    async signIn({ user, account }) {
      if (user.id === "master-admin") return true;

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
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

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