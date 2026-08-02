"use client";

import { useState, type FormEvent } from "react";

import { Button, Input, Switch, Text } from "@/components/ui";
import type { Employee, EmployeePayload, Role } from "@/types/employees";

export interface EmployeeFormProps {
  initialValue?: Employee;
  roles: Role[];
  onSubmit: (payload: EmployeePayload) => Promise<void>;
  onCancel: () => void;
}

export function EmployeeForm({ initialValue, roles, onSubmit, onCancel }: EmployeeFormProps) {
  const isEditing = Boolean(initialValue);

  const [username, setUsername] = useState(initialValue?.username ?? "");
  const [email, setEmail] = useState(initialValue?.email ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true);
  const [roleCodes, setRoleCodes] = useState<string[]>(initialValue?.roles ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(code: string) {
    setRoleCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEditing && !password) {
      setError("Senha é obrigatória para criar um funcionário.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: EmployeePayload = {
        username,
        email: email || undefined,
        is_active: isActive,
        role_codes: roleCodes,
      };
      if (password) payload.password = password;
      await onSubmit(payload);
    } catch {
      setError("Não foi possível salvar. Confira os dados.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Usuário"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label={isEditing ? "Nova senha (deixe em branco pra manter)" : "Senha"}
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required={!isEditing}
      />
      <div className="flex flex-col gap-2">
        <Text variant="label">Funções</Text>
        <div className="flex flex-col gap-2">
          {roles.map((role) => (
            <label key={role.code} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={roleCodes.includes(role.code)}
                onChange={() => toggleRole(role.code)}
                style={{ accentColor: "var(--color-accent)" }}
                className="h-4 w-4 rounded border-border"
              />
              {role.label}
            </label>
          ))}
        </div>
      </div>
      <Switch label="Funcionário ativo" checked={isActive} onChange={setIsActive} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
