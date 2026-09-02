"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { api, ApiError } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import type { AdminUser } from "@/types/admin";
import type { UserSummary } from "@/types/auth";

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
        role === "ADMIN"
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald/10 dark:text-emerald"
          : "bg-ink-50 text-ink-400 dark:bg-white/5"
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald/10 dark:text-emerald" : "bg-danger/10 text-danger"
      }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export function AdminUserActions({ user, currentUser }: { user: AdminUser; currentUser?: UserSummary }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const isSelf = currentUser?.id === user.id;

  async function toggleRole() {
    setBusy("role");
    setError(null);
    try {
      const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
      await api.patch(`/api/admin/users/${user.id}/role`, { role: newRole });
      revalidateAll();
      setFeedback("Usuário atualizado com sucesso.");
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível alterar a role.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleStatus() {
    if (user.active && !confirm(`Desativar o acesso de ${user.name}?`)) return;

    setBusy("status");
    setError(null);
    try {
      await api.patch(`/api/admin/users/${user.id}/status`, { active: !user.active });
      revalidateAll();
      setFeedback("Usuário atualizado com sucesso.");
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível alterar o status.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleRole}
          disabled={busy !== null || isSelf}
          title={isSelf ? "Você não pode alterar sua própria role." : undefined}
          className="rounded-lg border border-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-40 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
        >
          {busy === "role" ? "..." : user.role === "ADMIN" ? "Remover admin" : "Tornar admin"}
        </button>
        <button
          onClick={toggleStatus}
          disabled={busy !== null || isSelf}
          title={isSelf ? "Você não pode desativar a própria conta." : undefined}
          className="rounded-lg border border-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-40 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
        >
          {busy === "status" ? "..." : user.active ? "Desativar" : "Ativar"}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {feedback && <p className="text-xs text-emerald">{feedback}</p>}
    </div>
  );
}

export { RoleBadge, StatusBadge, Avatar };
