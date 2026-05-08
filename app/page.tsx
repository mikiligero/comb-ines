import Link from "next/link";
import { Play, Activity, Clock, Flame } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
                        {(await prisma.routine.findMany({
                            include: { blocks: { include: { steps: true } } },
                            orderBy: { createdAt: "desc" },
                            take: 3
                        })).map((routine) => {
                            let totalDuration = 0;
                            routine.blocks.forEach(block => {
                                block.steps.forEach(step => {
                                    totalDuration += step.duration;
                                });
                            });
                            const mins = Math.floor(totalDuration / 60);
                            const secs = totalDuration % 60;
                            const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

                            return (
                                <div key={routine.id} className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                                    <div className="space-y-1">
                                        <p className="font-bold">{routine.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                            <Clock size={12} />
                                            <span>{formattedTime}</span>
                                            <span className="text-zinc-700">•</span>
                                            <span>{routine.blocks.length} Bloques</span>
                                        </div>
                                    </div>
                                    <Link href={`/player/${routine.id}`} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <Play className="text-white ml-1" fill="currentColor" size={16} />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
