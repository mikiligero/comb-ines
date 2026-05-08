"use client";

import { Trash2 } from "lucide-react";
import { deleteRoutine } from "@/app/actions";
import { useState } from "react";

export default function DeleteRoutineButton({ routineId }: { routineId: number }) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteRoutine(routineId);
        } catch (e) {
            setDeleting(false);
            setConfirming(false);
        }
    };

    if (confirming) {
        return (
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                    {deleting ? "..." : "Sí"}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 transition-colors"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
        >
            <Trash2 size={18} />
        </button>
    );
}
