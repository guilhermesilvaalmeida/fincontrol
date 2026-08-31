"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
      router.push("/dashboard");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-ink dark:text-white">FinControl</h1>
          <p className="mt-1 text-sm text-ink-400">Controle seu dinheiro de forma simples.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card flex flex-col gap-4 p-6">
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-medium text-emerald hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
