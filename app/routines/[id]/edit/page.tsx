import prisma from "@/lib/prisma";
import RoutineForm from "@/components/RoutineForm";
import { notFound } from "next/navigation";

export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const routineId = parseInt(id, 10);

    if (isNaN(routineId)) {
        notFound();
    }

    const routine = await prisma.routine.findUnique({
        where: { id: routineId },
        include: {
            blocks: {
                include: { steps: true }
            }
        }
    });

    if (!routine) {
        notFound();
    }

    const exercises = await prisma.exercise.findMany();
    const jumpTypes = await prisma.jumpType.findMany();
    const ropes = await prisma.rope.findMany();

    return (
        <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mt-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Editar Rutina</h1>
                <p className="text-zinc-400">Modifica tu entrenamiento</p>
            </header>

            <RoutineForm 
                exercises={exercises} 
                jumpTypes={jumpTypes} 
                ropes={ropes} 
                initialData={routine}
            />
        </div>
    );
}
