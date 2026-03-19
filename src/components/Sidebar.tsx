"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Layers, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/new", label: "New", icon: PlusCircle },
    { href: "/deck", label: "Deck", icon: Layers },
  ];

  return (
    <aside className={cn("flex flex-col items-center py-10 px-4", className)}>
      <div className="flex items-center gap-3 mb-12 w-full px-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center flex-shrink-0 shadow-md">
          <Keyboard className="w-6 h-6 text-zinc-50 dark:text-zinc-900" />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Letter Leap</span>
      </div>

      <nav className="flex flex-col gap-2 w-full">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl font-semibold text-lg transition-all",
                isActive 
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm underline underline-offset-4 decoration-2 decoration-zinc-900 dark:decoration-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50"
              )}
            >
              <link.icon className={cn("w-6 h-6", isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500")} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
