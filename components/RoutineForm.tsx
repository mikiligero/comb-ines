"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoutine, updateRoutine } from "@/app/actions";
import { Plus, Trash2, GripVertical, Clock, Layers } from "lucide-react";

export default function RoutineForm({ exercises, jumpTypes, ropes, initialData }: any) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [blocks, setBlocks] = useState<any[]>(initialData?.blocks || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getNextBlockName = () => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return alphabet[blocks.length % alphabet.length];
    };

    const addBlock = () => {
        setBlocks([...blocks, {
            id: Date.now(),
            name: `Bloque ${getNextBlockName()}`,
            ropeId: ropes.length > 0 ? ropes[0].id : null,
            ropeChangeTime: 30,
            steps: []
        }]);
    };

    const removeBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const updateBlock = (index: number, field: string, value: any) => {
        const newBlocks = [...blocks];
        newBlocks[index][field] = value;
        setBlocks(newBlocks);
    };

    const addStepToBlock = (blockIndex: number, type: "EXERCISE" | "REST") => {
        const newBlocks = [...blocks];
        newBlocks[blockIndex].steps.push({
            id: Date.now() + Math.random(),
            type,
            duration: 30,
            exerciseId: type === "EXERCISE" && exercises.length > 0 ? exercises[0].id : null,
            jumpTypeId: type === "EXERCISE" && jumpTypes.length > 0 ? jumpTypes[0].id : null,
        });
        setBlocks(newBlocks);
    };

    const removeStepFromBlock = (blockIndex: number, stepIndex: number) => {
        const newBlocks = [...blocks];
        newBlocks[blockIndex].steps = newBlocks[blockIndex].steps.filter((_: any, i: number) => i !== stepIndex);
        setBlocks(newBlocks);
    };

    const updateStepInBlock = (blockIndex: number, stepIndex: number, field: string, value: any) => {
        const newBlocks = [...blocks];
        newBlocks[blockIndex].steps[stepIndex][field] = value;
        setBlocks(newBlocks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (initialData) {
                await updateRoutine(initialData.id, { name, description, blocks });
            } else {
                await createRoutine({ name, description, blocks });
            }
            router.push("/routines");
        } catch (error) {
            console.error(error);
            alert("Error al guardar rutina");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre</label>
                    <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Ej: Cardio Intenso 15m"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
                    <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors h-24 resize-none"
                        placeholder="Opcional"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Layers size={20} className="text-emerald-500"/> Estructura</h3>
                    <button type="button" onClick={addBlock} className="px-4 py-2 text-sm font-bold bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
                        + Añadir Bloque
                    </button>
                </div>

                {blocks.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl">
                        <p className="text-zinc-500 text-sm">Empieza añadiendo tu primer bloque.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {blocks.map((block, bIndex) => (
                            <div key={block.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-black">{block.name.split(" ")[1]}</div>
                                        <input 
                                            type="text" 
                                            value={block.name}
                                            onChange={e => updateBlock(bIndex, "name", e.target.value)}
                                            className="bg-transparent border-none text-lg font-bold text-white focus:outline-none w-32"
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeBlock(bIndex)} className="text-zinc-500 hover:text-red-400">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                                        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Cuerda para este bloque</label>
                                        <select 
                                            value={block.ropeId || ""} 
                                            onChange={e => updateBlock(bIndex, "ropeId", e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-sm text-emerald-400 font-bold"
                                        >
                                            <option value="">Seleccionar Cuerda...</option>
                                            {ropes.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.weight})</option>)}
                                        </select>
                                    </div>
                                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                                        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">T. Cambio Cuerda (s)</label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={block.ropeChangeTime ?? 30} 
                                            onChange={e => updateBlock(bIndex, "ropeChangeTime", e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-sm text-orange-400 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {block.steps.map((step: any, sIndex: number) => (
                                        <div key={step.id} className={`p-3 rounded-xl border flex items-center gap-3 ${step.type === "REST" ? "bg-zinc-950/50 border-zinc-800/50" : "bg-zinc-800/50 border-zinc-700"}`}>
                                            <GripVertical size={16} className="text-zinc-600 shrink-0" />
                                            
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                {step.type === "EXERCISE" ? (
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <select 
                                                            value={step.jumpTypeId || ""} 
                                                            onChange={e => updateStepInBlock(bIndex, sIndex, "jumpTypeId", e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none text-sm font-medium"
                                                        >
                                                            <option value="">Tipo de salto...</option>
                                                            {jumpTypes.map((j: any) => <option key={j.id} value={j.id}>{j.name}</option>)}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="col-span-2 sm:col-span-1 flex items-center">
                                                        <span className="text-sm font-bold text-blue-400">Descanso</span>
                                                    </div>
                                                )}
                                                
                                                <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1">
                                                    <Clock size={14} className="text-zinc-500" />
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={step.duration}
                                                        onChange={e => updateStepInBlock(bIndex, sIndex, "duration", e.target.value)}
                                                        className="w-16 bg-transparent border-none outline-none text-sm text-right font-bold"
                                                    />
                                                    <span className="text-zinc-500 text-xs">s</span>
                                                </div>
                                            </div>

                                            <button type="button" onClick={() => removeStepFromBlock(bIndex, sIndex)} className="text-zinc-600 hover:text-red-400 shrink-0">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                                    <button type="button" onClick={() => addStepToBlock(bIndex, "EXERCISE")} className="flex-1 py-2 text-xs font-semibold bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">
                                        + Ejercicio
                                    </button>
                                    <button type="button" onClick={() => addStepToBlock(bIndex, "REST")} className="flex-1 py-2 text-xs font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
                                        + Descanso
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={blocks.length === 0 || isSubmitting}
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-lg transition-colors flex justify-center items-center"
                >
                    {isSubmitting ? "Guardando..." : "Guardar Rutina"}
                </button>
            </div>
        </form>
    );
}
