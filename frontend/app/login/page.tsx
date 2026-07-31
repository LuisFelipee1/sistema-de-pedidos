import Link from "next/link";

import { AuthLayout, LoginForm } from "@/components/auth";
import { Text } from "@/components/ui";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse o painel do seu restaurante"
      footer={
        <Text variant="muted">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-accent hover:underline">
            Cadastre seu restaurante
          </Link>
        </Text>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
