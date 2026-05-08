import Link from "next/link";
import prisma from "@/lib/prisma";
import { Plus, Play, Clock, Dumbbell, Pencil, Eye } from "lucide-react";

export default async function RoutinesPage() {
    const routines = await prisma.routine.findMany({
        include: {
            blocks: {
                include: { steps: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between mt-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Rutinas</h1>
                    <p className="text-zinc-400">Tus entrenamientos</p>
                </div>
                <Link href="/routines/create" className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                    <Plus className="text-white" />
                </Link>
            </header>

            <div className="space-y-4">
                {routines.length === 0 ? (
                    <div className="text-center p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
                        <p className="text-zinc-400">No tienes rutinas.</p>
                    </div>
                ) : (
                    routines.map((routine) => {
                        let totalDuration = 0;
                        let numExercises = 0;
                        routine.blocks.forEach(block => {
                            block.steps.forEach(step => {
                                totalDuration += step.duration;
                                if (step.type === "EXERCISE") numExercises++;
                            });
                        });
                        
                        const mins = Math.floor(totalDuration / 60);
                        const secs = totalDuration % 60;
                        const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

                        return (
                            <div key={routine.id} className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-5 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{routine.name}</h3>
                                    {routine.description && <p className="text-sm text-zinc-400 line-clamp-1">{routine.description}</p>}
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium pt-2">
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{formattedTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Dumbbell size={14} />
                                            <span>{numExercises} Ejercicios</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/routines/${routine.id}`} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                        <Eye className="text-zinc-400 hover:text-white" size={18} />
                                    </Link>
                                    <Link href={`/routines/${routine.id}/edit`} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                        <Pencil className="text-zinc-400 hover:text-white" size={18} />
                                    </Link>
                                    <Link href={`/player/${routine.id}`} className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <Play className="text-white ml-1" fill="currentColor" size={20} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
