"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAppSelector } from "@/lib/redux/hooks";

/** Redireciona pra /login se, depois da checagem inicial, não houver sessão válida. */
export function useRequireAuth(): { isChecking: boolean; isAuthenticated: boolean } {
  const router = useRouter();
  const { accessToken, initialized } = useAppSelector((state) => state.auth);
  const isAuthenticated = Boolean(accessToken);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initialized, isAuthenticated, router]);

  return { isChecking: !initialized, isAuthenticated };
}
