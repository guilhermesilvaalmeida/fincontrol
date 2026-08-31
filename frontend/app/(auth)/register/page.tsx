"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { register as registerUser } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { registerSchema, type RegisterFormValues } from "@/lib/validators/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser(values);
      router.push("/dashboard");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível criar sua conta. Tente novamente.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-ink dark:text-white">FinControl</h1>
          <p className="mt-1 text-sm text-ink-400">Crie sua conta gratuita.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card flex flex-col gap-4 p-6">
          <Input label="Nome" autoComplete="name" error={errors.name?.message} {...register("name")} />
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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-emerald hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
