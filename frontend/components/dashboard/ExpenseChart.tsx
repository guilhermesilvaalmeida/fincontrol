"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatBRL } from "@/lib/currency";
import type { DashboardResponse } from "@/types/finance";

export function ExpenseChart({ data }: { data: DashboardResponse["expensesByCategory"] }) {
  if (data.length === 0) {
    return (
      <Card>
        <h2 className="font-display text-base font-semibold text-ink dark:text-white">Despesas por categoria</h2>
        <p className="mt-6 text-center text-sm text-ink-400">
          Você ainda não possui despesas registradas neste período.
        </p>
      </Card>
    );
  }

  const chartData = data.map((d) => ({ name: d.name, total: d.total, color: d.color ?? "#0F9D74" }));

  return (
    <Card>
      <h2 className="font-display text-base font-semibold text-ink dark:text-white">Despesas por categoria</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#4C5E82" }}
            />
            <Tooltip
              formatter={(value: number) => formatBRL(value)}
              contentStyle={{ borderRadius: 12, border: "1px solid #EEF1F6", fontSize: 12 }}
            />
            <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={18}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
