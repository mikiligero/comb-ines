import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Play, Clock, Dumbbell, Layers, Activity, ChevronLeft, Pencil } from "lucide-react";

export default async function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const routineId = parseInt(id, 10);

    if (isNaN(routineId)) {
        notFound();
    }

    const routine = await prisma.routine.findUnique({
        where: { id: routineId },
        include: {
            blocks: {
                orderBy: { order: "asc" },
                include: {
                    rope: true,
                    steps: {
                        orderBy: { order: "asc" },
                        include: {
                            exercise: true,
                            jumpType: true
                        }
                    }
                }
            }
        }
    });

    if (!routine) {
        notFound();
    }

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
        <div className="p-6 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-4 mt-8">
                <Link href="/routines" className="inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300">
                    <ChevronLeft size={16} className="mr-1" /> Volver a Rutinas
                </Link>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{routine.name}</h1>
                    {routine.description && <p className="text-zinc-400 mt-2">{routine.description}</p>}
                </div>

                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-lg text-emerald-400 border border-emerald-900/30">
                        <Clock size={16} />
                        <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-lg text-blue-400 border border-blue-900/30">
                        <Dumbbell size={16} />
                        <span>{numExercises} Ejercicios</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-lg text-orange-400 border border-orange-900/30">
                        <Layers size={16} />
                        <span>{routine.blocks.length} Bloques</span>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {routine.blocks.map((block) => (
                    <div key={block.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                                    {block.name.replace("Bloque ", "")}
                                </span>
                                {block.name}
                            </h2>
                            {block.rope && (
                                <div className="text-xs font-semibold px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-400">
                                    Cuerda: <span className="text-emerald-400">{block.rope.name}</span> {block.rope.weight && `(${block.rope.weight})`}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            {block.steps.map((step) => (
                                <div key={step.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <div className="flex items-center gap-3">
                                        {step.type === "EXERCISE" ? (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <Activity className="text-emerald-400" size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-zinc-200">
                                                        {step.jumpType?.name || "Salto Básico"}
                                                    </p>
                                                    {step.exercise && (
                                                        <p className="text-xs text-zinc-500">{step.exercise.name}</p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <Clock className="text-blue-400" size={16} />
                                                </div>
                                                <p className="font-bold text-sm text-blue-400">Descanso</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg">{step.duration}s</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pb-8">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <Link href={`/routines/${routine.id}/edit`} className="flex-1 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg transition-colors flex justify-center items-center gap-2">
                        <Pencil size={20} />
                        Editar
                    </Link>
                    <Link href={`/player/${routine.id}`} className="flex-[2] py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 transition-colors flex justify-center items-center gap-2">
                        <Play size={20} fill="currentColor" />
                        Empezar Rutina
                    </Link>
                </div>
            </div>
        </div>
    );
}
