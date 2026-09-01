"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { api, ApiError } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import { resizeImageToDataUrl } from "@/lib/image";
import type { UserSummary } from "@/types/auth";

export default function ProfilePage() {
  const { data: user, isLoading } = useSWR<UserSummary>("/api/auth/me", api.get);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Sincroniza o estado local assim que os dados do usuário chegam, sem sobrescrever edições em curso.
  if (user && name === "" && avatar === undefined) {
    setName(user.name);
    setAvatar(user.avatar);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Selecione um arquivo de imagem.");
      return;
    }

    setIsProcessingImage(true);
    setFormError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatar(dataUrl);
    } catch (err) {
      setFormError("Não foi possível processar essa imagem. Tente outra.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  async function handleSave() {
    setFormError(null);
    setIsSaving(true);
    try {
      await api.put("/api/auth/me", { name, avatar: avatar ?? null });
      revalidateAll();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível salvar seu perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link href="/settings" className="text-sm text-ink-400 hover:underline">
          ‹ Configurações
        </Link>
        <h1 className="mt-1 font-display text-xl font-bold text-ink dark:text-white">Seu perfil</h1>
      </div>

      <Card className="flex flex-col items-center gap-4">
        <Avatar name={name || user.name} src={avatar} size="lg" />

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isProcessingImage}>
            {isProcessingImage ? "Processando..." : "📷 Trocar foto"}
          </Button>
          {avatar && (
            <Button variant="ghost" size="sm" onClick={() => setAvatar(null)}>
              Remover
            </Button>
          )}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="E-mail" value={user.email} disabled className="opacity-60" />
        <p className="-mt-2 text-xs text-ink-400">O e-mail não pode ser alterado por aqui ainda.</p>

        {formError && <p className="text-sm text-danger">{formError}</p>}
        {success && <p className="text-sm text-emerald">Perfil atualizado! ✅</p>}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </Card>
    </div>
  );
}
