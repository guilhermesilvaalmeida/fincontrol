import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AdminForbiddenState() {
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-3 py-10 text-center">
      <span className="text-3xl" aria-hidden>
        🔒
      </span>
      <p className="font-medium text-ink dark:text-white">Acesso restrito</p>
      <p className="text-sm text-ink-400">Esta área é exclusiva para administradores.</p>
      <Link href="/dashboard">
        <Button variant="secondary">Voltar ao início</Button>
      </Link>
    </Card>
  );
}
