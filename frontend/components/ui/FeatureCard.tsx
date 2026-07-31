"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";

import { Card } from "./Card";
import { Text } from "./Text";

export interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="flex h-full flex-col gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon size={22} />
        </span>
        <Text variant="h2" className="text-base">
          {title}
        </Text>
        <Text variant="muted">{description}</Text>
      </Card>
    </motion.div>
  );
}
