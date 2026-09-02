"use client";

import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { AdminForbiddenState } from "@/components/admin/AdminForbiddenState";
import { AdminUserActions, RoleBadge, StatusBadge } from "@/components/admin/AdminUserActions";
import { api, ApiError } from "@/lib/api";
import type { AdminUser } from "@/types/admin";
import type { UserSummary } from "@/types/auth";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");

  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (role) params.set("role", role);
  if (active) params.set("active", active);

  const { data: currentUser } = useSWR<UserSummary>("/api/auth/me", api.get);
  const { data: users, error, isLoading } = useSWR<AdminUser[]>(`/api/admin/users?${params.toString()}`, api.get);

  if (error instanceof ApiError && error.status === 403) {
    return <AdminForbiddenState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-sm text-ink-400 hover:underline">
          ‹ Administração
        </Link>
        <h1 className="mt-1 font-display text-xl font-bold text-ink dark:text-white">Usuários</h1>
      </div>

      <Card className="flex flex-col gap-4">
        <input
          type="search"
          placeholder="Buscar por nome ou e-mail..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald dark:border-white/10 dark:bg-surface-cardDark"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Todas</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <Select label="Status" value={active} onChange={(e) => setActive(e.target.value)}>
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <Card className="py-10 text-center text-sm text-ink-400">Nenhum usuário encontrado com esses filtros.</Card>
      ) : (
        <>
          {/* Tabela — desktop/tablet */}
          <Card className="hidden overflow-x-auto p-0 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs text-ink-400 dark:border-white/10">
                  <th className="px-5 py-3 font-medium">Usuário</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Cadastro</th>
                  <th className="px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/10">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar name={u.name} src={u.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink dark:text-white">{u.name}</p>
                          <p className="truncate text-xs text-ink-400">{u.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge active={u.active} />
                    </td>
                    <td className="px-3 py-3 text-xs text-ink-400">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-5 py-3">
                      <AdminUserActions user={u} currentUser={currentUser} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Cards — mobile */}
          <div className="flex flex-col gap-3 md:hidden">
            {users.map((u) => (
              <Card key={u.id} className="flex flex-col gap-3">
                <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                  <Avatar name={u.name} src={u.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink dark:text-white">{u.name}</p>
                    <p className="truncate text-xs text-ink-400">{u.email}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <RoleBadge role={u.role} />
                  <StatusBadge active={u.active} />
                  <span className="text-xs text-ink-400">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <AdminUserActions user={u} currentUser={currentUser} />
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
