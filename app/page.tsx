import Link from "next/link";
import { Play, Activity, Clock, Flame } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function Dashboard() {
    const routineCount = await prisma.routine.count();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlySessions = await prisma.workoutSession.findMany({
        where: {
            completedAt: {
                gte: startOfMonth
            }
        }
    });

    const totalWorkouts = monthlySessions.length;
    const totalSeconds = monthlySessions.reduce((acc, session) => acc + session.duration, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    
    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2 mt-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Hola,<br/><span className="text-emerald-400">Deportista</span></h1>
                <p className="text-zinc-400 font-medium">¿Listo para saltar hoy?</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-5 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Activity className="text-emerald-400" size={20} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Entrenos (Mes)</p>
                        <p className="text-2xl font-bold">{totalWorkouts}</p>
                    </div>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-5 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Flame className="text-orange-400" size={20} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Minutos (Mes)</p>
                        <p className="text-2xl font-bold">{totalMinutes}</p>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Tus Rutinas</h2>
                    <Link href="/routines" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">Ver todas</Link>
                </div>
                
                {routineCount === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl p-8 text-center space-y-4">
                        <p className="text-zinc-400">Aún no tienes rutinas.</p>
                        <Link href="/routines/create" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">
                            Crear Rutina
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-zinc-400">Tienes {routineCount} rutinas disponibles.</p>
                        <Link href="/routines" className="block p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Ir a Rutinas</span>
                                <Play size={20} className="text-emerald-400" />
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
