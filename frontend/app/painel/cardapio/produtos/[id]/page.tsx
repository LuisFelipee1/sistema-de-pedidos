import { ProdutoFormPage } from "../ProdutoFormPage";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProdutoFormPage productId={Number(id)} />;
}
