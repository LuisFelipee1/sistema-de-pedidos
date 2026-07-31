"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FiLock, FiUser } from "react-icons/fi";

import { Button, Input, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { loginThunk } from "@/lib/redux/slices/authSlice";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(loginThunk({ username, password }));
    if (loginThunk.fulfilled.match(result)) {
      router.push("/painel");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Usuário"
        name="username"
        icon={<FiUser size={18} />}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        icon={<FiLock size={18} />}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />
      {error && (
        <Text variant="muted" className="text-danger">
          {error}
        </Text>
      )}
      <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
