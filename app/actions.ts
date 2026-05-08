"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createRoutine(data: any) {
    if (!data.name || !data.blocks || data.blocks.length === 0) {
        throw new Error("Invalid data");
    }

    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");
    const userId = session.userId as number;

    const routine = await prisma.routine.create({
        data: {
            name: data.name,
            description: data.description,
            userId: userId,
            blocks: {
                create: data.blocks.map((block: any, blockIndex: number) => ({
                    name: block.name,
                    order: blockIndex + 1,
                    ropeId: block.ropeId ? parseInt(block.ropeId) : null,
                    ropeChangeTime: block.ropeChangeTime ? parseInt(block.ropeChangeTime) : 30,
                    steps: {
                        create: block.steps.map((step: any, stepIndex: number) => ({
                            type: step.type,
                            duration: parseInt(step.duration),
                            order: stepIndex + 1,
                            exerciseId: step.exerciseId ? parseInt(step.exerciseId) : null,
                            jumpTypeId: step.jumpTypeId ? parseInt(step.jumpTypeId) : null,
                        }))
                    }
                }))
            }
        }
    });

    revalidatePath("/routines");
    revalidatePath("/");
    
    return routine.id;
}

export async function updateRoutine(id: number, data: any) {
    if (!data.name || !data.blocks || data.blocks.length === 0) {
        throw new Error("Invalid data");
    }

    // Delete existing blocks (steps are cascade deleted)
    await prisma.routineBlock.deleteMany({
        where: { routineId: id }
    });

    const routine = await prisma.routine.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            blocks: {
                create: data.blocks.map((block: any, blockIndex: number) => ({
                    name: block.name,
                    order: blockIndex + 1,
                    ropeId: block.ropeId ? parseInt(block.ropeId) : null,
                    ropeChangeTime: block.ropeChangeTime ? parseInt(block.ropeChangeTime) : 30,
                    steps: {
                        create: block.steps.map((step: any, stepIndex: number) => ({
                            type: step.type,
                            duration: parseInt(step.duration),
                            order: stepIndex + 1,
                            exerciseId: step.exerciseId ? parseInt(step.exerciseId) : null,
                            jumpTypeId: step.jumpTypeId ? parseInt(step.jumpTypeId) : null,
                        }))
                    }
                }))
            }
        }
    });

    revalidatePath("/routines");
    revalidatePath(`/routines/${id}/edit`);
    revalidatePath(`/player/${id}`);
    revalidatePath("/");
    
    return routine.id;
}

export async function saveWorkoutSession(routineId: number, duration: number) {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");
    const userId = session.userId as number;
    
    await prisma.workoutSession.create({
        data: {
            userId,
            routineId,
            duration,
            completedAt: new Date(),
        }
    });

    revalidatePath("/");
    revalidatePath("/routines");
}

export async function deleteWorkoutSession(id: number) {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");
    
    await prisma.workoutSession.delete({
        where: { id }
    });

    revalidatePath("/");
    revalidatePath("/workouts");
}
