"use client";

import Image from "next/image";
import { FiMapPin, FiPhone } from "react-icons/fi";

import { Text } from "@/components/ui";
import type { PublicRestaurant } from "@/types/restaurant";

export interface RestaurantHeaderProps {
  restaurant: PublicRestaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <header className="flex items-start gap-4">
      <span
        className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl
          border border-border bg-surface sm:size-24"
      >
        {restaurant.logo ? (
          <Image
            src={restaurant.logo}
            alt={`Logo de ${restaurant.name}`}
            width={96}
            height={96}
            className="size-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-ink-muted" aria-hidden>
            {restaurant.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text variant="h1" className="text-2xl sm:text-3xl">
          {restaurant.name}
        </Text>

        {restaurant.full_address && (
          <p className="flex items-start gap-2 text-sm text-ink-muted">
            <FiMapPin size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>{restaurant.full_address}</span>
          </p>
        )}

        {restaurant.phone && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <FiPhone size={16} className="shrink-0" aria-hidden />
            <a href={`tel:${restaurant.phone.replace(/\D/g, "")}`} className="hover:text-accent">
              {restaurant.phone}
            </a>
          </p>
        )}
      </div>
    </header>
  );
}
