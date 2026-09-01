import { mutate } from "swr";

/**
 * Invalida TODO o cache do SWR (dashboard, contas, transações, cartões, etc.).
 * Chamado após qualquer criação/edição/exclusão para garantir que a tela
 * sempre reflita o dado mais recente, sem precisar recarregar a página.
 */
export function revalidateAll() {
  mutate(() => true, undefined, { revalidate: true });
}
