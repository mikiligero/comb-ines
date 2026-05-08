"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, List, Play, Settings } from "lucide-react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // Hide navigation on the active player screen or login screen
    const isPlayerRoute = pathname.startsWith("/player") || pathname === "/login";

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
            <main className={`flex-1 w-full max-w-md mx-auto ${!isPlayerRoute ? "pb-20" : ""}`}>
                {children}
            </main>

            {!isPlayerRoute && (
                <nav className="fixed bottom-0 w-full bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 pb-safe">
                    <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
                        <NavItem href="/" icon={<Home size={24} />} active={pathname === "/"} label="Inicio" />
                        <NavItem href="/routines" icon={<List size={24} />} active={pathname.startsWith("/routines")} label="Rutinas" />
                        <NavItem href="/player" icon={<Play size={28} className="text-emerald-400" />} active={pathname === "/player"} label="Entrenar" />
                        <NavItem href="/settings" icon={<Settings size={24} />} active={pathname.startsWith("/settings")} label="Ajustes" />
                    </div>
                </nav>
            )}
        </div>
    );
}

function NavItem({ href, icon, active, label }: { href: string; icon: React.ReactNode; active: boolean; label: string }) {
    return (
        <Link href={href} className={`flex flex-col items-center justify-center space-y-1 w-16 ${active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}>
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
