import Link from "next/link";

import { AuthLayout, SignupForm } from "@/components/auth";
import { Text } from "@/components/ui";

export default function CadastroPage() {
  return (
    <AuthLayout
      title="Cadastre seu restaurante"
      subtitle="Crie sua conta e comece a gerenciar seus pedidos"
      footer={
        <Text variant="muted">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Entrar
          </Link>
        </Text>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
