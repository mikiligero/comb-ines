import Link from "next/link";
import { Settings as SettingsIcon, Dumbbell, MoveVertical } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mt-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Configuración</h1>
                <p className="text-zinc-400">Personaliza tus entrenamientos</p>
            </header>

            <div className="space-y-4">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider pl-2">Base de Datos</h2>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden divide-y divide-zinc-800">
                    <Link href="/settings/exercises" className="flex items-center gap-4 p-5 hover:bg-zinc-800/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <MoveVertical className="text-blue-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Ejercicios y Saltos</h3>
                            <p className="text-xs text-zinc-400">Gestiona los tipos de salto</p>
                        </div>
                    </Link>
                    
                    <Link href="/settings/ropes" className="flex items-center gap-4 p-5 hover:bg-zinc-800/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Dumbbell className="text-orange-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Cuerdas</h3>
                            <p className="text-xs text-zinc-400">Tus herramientas de entreno</p>
                        </div>
                    </Link>
                </div>
            </div>
            
            <div className="space-y-4 pt-4">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider pl-2">General</h2>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <SettingsIcon className="text-zinc-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Tiempo de Cambio</h3>
                            <p className="text-xs text-zinc-400">Descanso entre cuerdas</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-emerald-400 text-lg">30s</span>
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <form action={async () => {
                    "use server";
                    const { logout } = await import("@/lib/auth");
                    const { redirect } = await import("next/navigation");
                    await logout();
                    redirect("/login");
                }}>
                    <button type="submit" className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-lg transition-colors flex justify-center items-center">
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}
