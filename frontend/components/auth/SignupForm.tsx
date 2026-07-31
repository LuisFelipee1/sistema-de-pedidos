"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

import { Button, Input, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { signupRestaurantThunk } from "@/lib/redux/slices/authSlice";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function SignupForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((state) => state.auth);

  const [restaurantName, setRestaurantName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLoading = status === "loading";
  const autoSlug = useMemo(() => slugify(restaurantName), [restaurantName]);
  const effectiveSlug = slugTouched ? slug : autoSlug;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(
      signupRestaurantThunk({
        restaurant_name: restaurantName,
        restaurant_slug: effectiveSlug,
        username,
        email: email || undefined,
        password,
      }),
    );
    if (signupRestaurantThunk.fulfilled.match(result)) {
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Nome do restaurante"
        name="restaurant_name"
        icon={<MdOutlineStorefront size={18} />}
        value={restaurantName}
        onChange={(event) => setRestaurantName(event.target.value)}
        required
      />
      <Input
        label="Endereço (slug)"
        name="restaurant_slug"
        value={effectiveSlug}
        onChange={(event) => {
          setSlugTouched(true);
          setSlug(slugify(event.target.value));
        }}
        required
      />
      <Input
        label="Usuário (admin)"
        name="username"
        icon={<FiUser size={18} />}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        icon={<FiMail size={18} />}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        icon={<FiLock size={18} />}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        required
      />
      {error && (
        <Text variant="muted" className="text-danger">
          {error}
        </Text>
      )}
      <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
        Criar restaurante
      </Button>
    </form>
  );
}
