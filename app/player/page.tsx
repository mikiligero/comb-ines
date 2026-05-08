import Link from "next/link";
import prisma from "@/lib/prisma";
import { Play } from "lucide-react";

export default async function PlayerIndexPage() {
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
            <header className="mt-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Entrenar</h1>
                <p className="text-zinc-400">Selecciona una rutina para empezar</p>
            </header>

            <div className="space-y-4">
                {routines.map((routine) => {
                    let totalDuration = 0;
                    let numExercises = 0;
                    routine.blocks.forEach(block => {
                        block.steps.forEach(step => {
                            totalDuration += step.duration;
                            if (step.type === "EXERCISE") numExercises++;
                        });
                    });
                    const mins = Math.floor(totalDuration / 60);
                    
                    return (
                        <Link key={routine.id} href={`/player/${routine.id}`} className="block bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-5 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors">{routine.name}</h3>
                                    <p className="text-sm text-zinc-500">{mins} min • {numExercises} bloques</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                    <Play size={24} className="text-emerald-500 group-hover:text-white ml-1 transition-colors" fill="currentColor" />
                                </div>
                            </div>
                        </Link>
                    )
                })}
                
                {routines.length === 0 && (
                    <div className="text-center p-8">
                        <p className="text-zinc-500">No hay rutinas disponibles.</p>
                        <Link href="/routines/create" className="text-emerald-400 mt-2 inline-block">Crear una ahora</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
