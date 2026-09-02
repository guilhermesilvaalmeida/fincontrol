"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { AdminForbiddenState } from "@/components/admin/AdminForbiddenState";
import { AdminUserActions, RoleBadge, StatusBadge } from "@/components/admin/AdminUserActions";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDetail } from "@/types/admin";
import type { UserSummary } from "@/types/auth";

const countCards = [
  { key: "transactionsCount", label: "Transações", icon: "💸" },
  { key: "accountsCount", label: "Contas", icon: "🏦" },
  { key: "creditCardsCount", label: "Cartões", icon: "💳" },
  { key: "goalsCount", label: "Metas", icon: "🏆" },
  { key: "budgetsCount", label: "Orçamentos", icon: "🎯" },
] as const;

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: currentUser } = useSWR<UserSummary>("/api/auth/me", api.get);
  const { data: user, error, isLoading } = useSWR<AdminUserDetail>(`/api/admin/users/${params.id}`, api.get);

  if (error instanceof ApiError && error.status === 403) {
    return <AdminForbiddenState />;
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-ink-400">Usuário não encontrado.</p>
        <Link href="/admin/users" className="text-sm font-medium text-emerald hover:underline">
          Voltar para usuários
        </Link>
      </Card>
    );
  }

  if (isLoading || !user) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/users" className="text-sm text-ink-400 hover:underline">
          ‹ Usuários
        </Link>
      </div>

      <Card className="flex flex-col items-center gap-3 text-center">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div>
          <p className="font-display text-lg font-bold text-ink dark:text-white">{user.name}</p>
          <p className="text-sm text-ink-400">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
          <StatusBadge active={user.active} />
        </div>
        <p className="text-xs text-ink-400">
          Cadastrado em {new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-400">Ações administrativas</p>
        <AdminUserActions user={user} currentUser={currentUser} />
      </Card>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-ink dark:text-white">Atividade no sistema</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {countCards.map((c) => (
            <Card key={c.key} className="p-4 text-center">
              <span className="text-lg" aria-hidden>
                {c.icon}
              </span>
              <p className="mt-1 font-mono text-xl font-bold text-ink dark:text-white">{user[c.key]}</p>
              <p className="text-xs text-ink-400">{c.label}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Por privacidade, valores financeiros individuais não são exibidos aqui — apenas quantidades de registros.
        </p>
      </div>
    </div>
  );
}
