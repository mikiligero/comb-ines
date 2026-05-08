import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { createJumpType, deleteJumpType } from "../actions";

export default async function ExercisesPage() {
    const jumpTypes = await prisma.jumpType.findMany();

    return (
        <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <header className="flex items-center gap-4 mt-8">
                <Link href="/settings" className="text-zinc-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Tipos de Salto</h1>
                </div>
            </header>

            <form action={createJumpType} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-2 items-center">
                <input type="text" name="name" placeholder="Nuevo salto (ej. Doble unders)" required className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white" />
                <button type="submit" className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <Plus size={16} />
                </button>
            </form>

            <div className="space-y-3">
                {jumpTypes.map(jump => (
                    <div key={jump.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold">{jump.name}</p>
                        </div>
                        <form action={async () => {
                            "use server";
                            await deleteJumpType(jump.id);
                        }}>
                            <button type="submit" className="text-zinc-600 hover:text-red-400 p-2">
                                <Trash2 size={18} />
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}
