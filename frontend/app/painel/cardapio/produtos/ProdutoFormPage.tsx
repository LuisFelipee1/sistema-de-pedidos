"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FiArrowLeft, FiLoader } from "react-icons/fi";

import {
  QuestionBuilder,
  toAddonGroupsInput,
  type DraftQuestion,
} from "@/components/painel/QuestionBuilder";
import { Button, Card, Input, Select, Switch, Text } from "@/components/ui";
import {
  createProduct,
  fetchProduct,
  listCategories,
  replaceAddonGroups,
  updateProduct,
} from "@/lib/api/menu";
import type { Category, Product } from "@/types/menu";

/** Reconstrói o rascunho a partir do que já está salvo, mantendo os ids para
 * o servidor atualizar no lugar em vez de recriar. */
function toDraft(product: Product): DraftQuestion[] {
  return product.addon_groups.map((group) => ({
    key: `q-${group.id}`,
    id: group.id,
    name: group.name,
    is_addon: group.is_addon,
    is_required: group.is_required,
    options: group.options.map((option) => ({
      key: `op-${option.id}`,
      id: option.id,
      name: option.name,
      description: option.description,
      price_delta: Number(option.price_delta) ? option.price_delta : "",
    })),
  }));
}

export interface ProdutoFormPageProps {
  /** Ausente = cadastro novo. */
  productId?: number;
}

export function ProdutoFormPage({ productId }: ProdutoFormPageProps) {
  const router = useRouter();
  const isEditing = productId !== undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState<File | undefined>();
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([listCategories(), isEditing ? fetchProduct(productId) : Promise.resolve(null)])
      .then(([categoriesData, product]) => {
        if (!active) return;
        setCategories(categoriesData);

        if (product) {
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price);
          setCategoryId(String(product.category));
          setIsAvailable(product.is_available);
          setCurrentImage(product.image);
          setQuestions(toDraft(product));
        } else {
          setCategoryId(categoriesData[0] ? String(categoriesData[0].id) : "");
        }
      })
      .catch(() => active && setError("Não foi possível carregar os dados."))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [isEditing, productId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryId) {
      setError("Crie uma categoria antes de cadastrar produtos.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        category: Number(categoryId),
        name,
        description,
        price,
        is_available: isAvailable,
        ...(image ? { image } : {}),
      };

      const saved = isEditing
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

      // As perguntas vão num segundo request porque o produto usa multipart
      // (foto) e a árvore é JSON aninhado — misturar os dois complicaria os
      // dois lados sem ganho.
      await replaceAddonGroups(saved.id, toAddonGroupsInput(questions));

      router.push("/painel/cardapio/produtos");
    } catch {
      setError("Não foi possível salvar. Confira os dados.");
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
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push("/painel/cardapio/produtos")}
          className="flex w-fit items-center gap-2 text-sm font-medium text-ink-muted
            transition-colors hover:text-accent"
        >
          <FiArrowLeft size={16} aria-hidden />
          Voltar para produtos
        </button>
        <Text variant="h1" className="text-2xl sm:text-3xl">
          {isEditing ? "Editar produto" : "Novo produto"}
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <Text variant="label">Dados do produto</Text>

          <Input
            label="Nome do produto"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Categoria"
              name="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              searchable
              searchPlaceholder="Buscar categoria..."
            >
              {categories.length === 0 && <option value="">Crie uma categoria primeiro</option>}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Input
              label="Preço"
              name="price"
              type="number"
              step="0.01"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Descrição
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Pão, burger, american cheese, maionese da casa"
              className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5
                text-ink outline-none transition-colors duration-150 placeholder:text-ink-muted
                focus:border-accent"
            />
          </label>

          <div className="flex items-center gap-4">
            {currentImage && !image && (
              <Image
                src={currentImage}
                alt={name}
                width={72}
                height={72}
                className="size-18 shrink-0 rounded-xl border border-border object-cover"
              />
            )}
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                Foto do produto
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0])}
                className="text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0
                  file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium
                  file:text-accent-ink"
              />
            </label>
          </div>

          <Switch label="Disponível no cardápio" checked={isAvailable} onChange={setIsAvailable} />
        </Card>

        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <Text variant="label">Perguntas do pedido</Text>
          <QuestionBuilder questions={questions} onChange={setQuestions} />
        </Card>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/painel/cardapio/produtos")}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Salvar produto
          </Button>
        </div>
      </form>
    </div>
  );
}
