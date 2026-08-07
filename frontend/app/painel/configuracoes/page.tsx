"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { FiExternalLink, FiLoader } from "react-icons/fi";

import { Button, Card, Input, Text, Toast } from "@/components/ui";
import { fetchMyRestaurant, updateMyRestaurant } from "@/lib/api/restaurant";
import type { RestaurantSettings, RestaurantSettingsPayload } from "@/types/restaurant";

const EMPTY: RestaurantSettingsPayload = {
  name: "",
  phone: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  zip_code: "",
};

export default function ConfiguracoesPage() {
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [form, setForm] = useState<RestaurantSettingsPayload>(EMPTY);
  const [logo, setLogo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchMyRestaurant()
      .then((data) => {
        if (!active) return;
        setRestaurant(data);
        setForm({
          name: data.name,
          phone: data.phone,
          street: data.street,
          number: data.number,
          complement: data.complement,
          district: data.district,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
        });
      })
      .catch(() => active && setError("Não foi possível carregar os dados."))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function field(key: keyof RestaurantSettingsPayload) {
    return {
      value: (form[key] as string) ?? "",
      onChange: (event: { target: { value: string } }) =>
        setForm((current) => ({ ...current, [key]: event.target.value })),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateMyRestaurant(logo ? { ...form, logo } : form);
      setRestaurant(updated);
      setLogo(null);
      setToast("Dados do restaurante atualizados.");
    } catch {
      setError("Não foi possível salvar. Confira os dados.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <FiLoader className="animate-spin text-ink-muted" size={28} aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Text variant="h1" className="text-2xl sm:text-3xl">
          Configurações
        </Text>
        <Text variant="muted">
          Esses dados aparecem no topo do cardápio que o cliente acessa.
        </Text>
      </div>

      {restaurant && (
        <a
          href={`/cardapio/${restaurant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          <FiExternalLink size={16} aria-hidden />
          /cardapio/{restaurant.slug}
        </a>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <Text variant="label">Identificação</Text>

          <div className="flex items-center gap-4">
            <span
              className="flex size-20 shrink-0 items-center justify-center overflow-hidden
                rounded-2xl border border-border bg-paper"
            >
              {restaurant?.logo && !logo ? (
                <Image
                  src={restaurant.logo}
                  alt="Logo atual"
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-ink-muted" aria-hidden>
                  {(form.name ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Logo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
                className="text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0
                  file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium
                  file:text-accent-ink"
              />
            </label>
          </div>

          <Input label="Nome do restaurante" name="name" required {...field("name")} />
          <Input label="Telefone" name="phone" placeholder="(19) 3232-1010" {...field("phone")} />
        </Card>

        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <Text variant="label">Endereço</Text>

          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Input label="Rua" name="street" {...field("street")} />
            <Input label="Número" name="number" {...field("number")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Complemento" name="complement" {...field("complement")} />
            <Input label="Bairro" name="district" {...field("district")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
            <Input label="Cidade" name="city" {...field("city")} />
            <Input label="UF" name="state" maxLength={2} {...field("state")} />
            <Input label="CEP" name="zip_code" placeholder="13015-002" {...field("zip_code")} />
          </div>
        </Card>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            Salvar alterações
          </Button>
        </div>
      </form>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
