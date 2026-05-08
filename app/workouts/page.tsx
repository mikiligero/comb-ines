import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock, Dumbbell, Calendar } from "lucide-react";
import DeleteWorkoutButton from "./DeleteWorkoutButton";

export default async function WorkoutsPage() {
    const session = await getSession();
    if (!session || !session.userId) redirect("/login");

    const workouts = await prisma.workoutSession.findMany({
        where: { userId: session.userId as number },
        include: { routine: true },
        orderBy: { completedAt: "desc" },
    });

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2 mt-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Historial</h1>
                <p className="text-zinc-400 font-medium">
                    {workouts.length === 0
                        ? "Aún no has completado ningún entreno."
                        : `${workouts.length} entreno${workouts.length > 1 ? "s" : ""} registrado${workouts.length > 1 ? "s" : ""}`}
                </p>
            </header>

            {workouts.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl p-8 text-center space-y-4">
                    <Dumbbell size={48} className="text-zinc-600 mx-auto" />
                    <p className="text-zinc-400">Completa tu primera rutina para verla aquí.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {workouts.map((workout) => (
                        <div
                            key={workout.id}
                            className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                        >
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <p className="font-bold text-white truncate text-lg">
                                    {workout.routine?.name || "Rutina eliminada"}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} className="text-zinc-500" />
                                        {formatDate(workout.completedAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} className="text-zinc-500" />
                                        {formatTime(workout.completedAt)}
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-lg text-emerald-400 text-sm font-semibold">
                                    <Clock size={14} />
                                    {formatDuration(workout.duration)}
                                </div>
                            </div>
                            <DeleteWorkoutButton workoutId={workout.id} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
