import { Suspense } from "react";
import HeaderEcomWithSuspense from "@/components/home/HeaderEcomWithSuspense";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <>
      <HeaderEcomWithSuspense />
      <Suspense fallback={null}>
        <LoginClient />
      </Suspense>
    </>
  );
}