import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import WorkoutPlayer from "./WorkoutPlayer";

export default async function RoutinePlayerPage({ params }: { params: Promise<{ routineId: string }> }) {
    const { routineId } = await params;
    
    const routine = await prisma.routine.findUnique({
        where: { id: parseInt(routineId) },
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

    const settings = await prisma.settings.findFirst();

    if (!routine) return notFound();

    return <WorkoutPlayer routine={routine} ropeChangeDuration={settings?.ropeChangeDuration || 30} />;
}
