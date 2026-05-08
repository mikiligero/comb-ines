import prisma from "@/lib/prisma";
import RoutineForm from "@/components/RoutineForm";

export default async function CreateRoutinePage() {
    const exercises = await prisma.exercise.findMany();
    const jumpTypes = await prisma.jumpType.findMany();
    const ropes = await prisma.rope.findMany();

    return (
        <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mt-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Nueva Rutina</h1>
                <p className="text-zinc-400">Diseña tu entrenamiento</p>
            </header>

            <RoutineForm 
                exercises={exercises} 
                jumpTypes={jumpTypes} 
                ropes={ropes} 
            />
        </div>
    );
}
