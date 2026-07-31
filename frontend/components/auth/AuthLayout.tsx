"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MdOutlineRestaurantMenu } from "react-icons/md";

import { Card, Text } from "@/components/ui";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="animate-float-delayed absolute -right-16 -bottom-32 h-96 w-96 rounded-full bg-success/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-ink) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="animate-pulse-soft flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-ink">
            <MdOutlineRestaurantMenu size={26} />
          </span>
          <Text variant="h1">{title}</Text>
          <Text variant="muted">{subtitle}</Text>
        </div>

        <Card>{children}</Card>

        <div className="mt-6 text-center">{footer}</div>
      </motion.div>
    </div>
  );
}
