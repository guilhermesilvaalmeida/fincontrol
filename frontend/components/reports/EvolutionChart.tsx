"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatBRL } from "@/lib/currency";
import type { ReportsResponse } from "@/types/finance";

function formatMonthLabel(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short" });
}

export function EvolutionChart({ data }: { data: ReportsResponse["monthlyEvolution"] }) {
  const chartData = data.map((d) => ({
    month: formatMonthLabel(d.month),
    Receitas: d.income,
    Despesas: d.expense,
  }));

  return (
    <Card>
      <h2 className="font-display text-base font-semibold text-ink dark:text-white">Evolução: receitas x despesas</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -20, right: 12 }}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#4C5E82" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#4C5E82" }} />
            <Tooltip
              formatter={(value: number) => formatBRL(value)}
              contentStyle={{ borderRadius: 12, border: "1px solid #EEF1F6", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Receitas" stroke="#0F9D74" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Despesas" stroke="#D64545" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
