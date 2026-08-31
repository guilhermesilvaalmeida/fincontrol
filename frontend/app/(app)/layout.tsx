import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pb-20 md:pb-0">
        <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
