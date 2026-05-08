"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRope(data: FormData) {
    const name = data.get("name") as string;
    const weight = data.get("weight") as string;
    const color = data.get("color") as string;
    
    if (!name) return;
    
    await prisma.rope.create({ data: { name, weight, color } });
    revalidatePath("/settings/ropes");
    revalidatePath("/routines/create");
}

export async function deleteRope(id: number) {
    await prisma.rope.delete({ where: { id } });
    revalidatePath("/settings/ropes");
    revalidatePath("/routines/create");
}

export async function createJumpType(data: FormData) {
    const name = data.get("name") as string;
    if (!name) return;
    
    await prisma.jumpType.create({ data: { name } });
    revalidatePath("/settings/exercises");
    revalidatePath("/routines/create");
}

export async function deleteJumpType(id: number) {
    await prisma.jumpType.delete({ where: { id } });
    revalidatePath("/settings/exercises");
    revalidatePath("/routines/create");
}
