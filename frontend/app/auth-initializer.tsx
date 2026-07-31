"use client";

import { useEffect } from "react";

import { useAppDispatch } from "@/lib/redux/hooks";
import { restoreSessionThunk } from "@/lib/redux/slices/authSlice";

/** Dispara uma vez, no carregamento do app, pra revalidar o token salvo. */
export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSessionThunk());
  }, [dispatch]);

  return null;
}
