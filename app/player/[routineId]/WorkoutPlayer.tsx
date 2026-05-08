"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { saveWorkoutSession } from "@/app/actions";
import { Play, Pause, X, RotateCcw, FastForward, CheckCircle2 } from "lucide-react";

type PlayerState = "IDLE" | "ACTIVE" | "REST" | "ROPE_CHANGE" | "FINISHED";

export default function WorkoutPlayer({ routine, ropeChangeDuration }: { routine: any, ropeChangeDuration: number }) {
    const router = useRouter();
    const [state, setState] = useState<PlayerState>("IDLE");
    
    // Instead of a single stepIndex, we track flat steps or block/step indices.
    // Flattening the steps makes the player logic much simpler while keeping block references.
    const flatSteps = useMemo(() => {
        const flat: any[] = [];
        routine.blocks.forEach((block: any, bIndex: number) => {
            block.steps.forEach((step: any, sIndex: number) => {
                flat.push({
                    ...step,
                    blockName: block.name,
                    rope: block.rope,
                    blockRopeChangeTime: block.ropeChangeTime ?? ropeChangeDuration,
                    isLastInBlock: sIndex === block.steps.length - 1,
                    nextBlockRope: bIndex < routine.blocks.length - 1 ? routine.blocks[bIndex + 1].rope : null,
                    nextBlockName: bIndex < routine.blocks.length - 1 ? routine.blocks[bIndex + 1].name : null,
                });
            });
        });
        return flat;
    }, [routine]);

    const [flatStepIndex, setFlatStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    const audioCtxRef = useRef<AudioContext | null>(null);

    const playBeep = useCallback((type: "low" | "high") => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(type === "high" ? 880 : 440, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }, []);

    const currentStep = flatSteps[flatStepIndex];

    const startRoutine = () => {
        setFlatStepIndex(0);
        const firstStep = flatSteps[0];
        setState(firstStep.type === "REST" ? "REST" : "ACTIVE");
        setTimeLeft(firstStep.duration);
        setIsPaused(false);
    };

    const nextPhase = useCallback(() => {
        if (state === "ROPE_CHANGE" || state === "REST" || state === "ACTIVE") {
            if (state === "ROPE_CHANGE") {
                // Transition to active
                setState(currentStep.type === "REST" ? "REST" : "ACTIVE");
                setTimeLeft(currentStep.duration);
            } else {
                // We finished a step (ACTIVE or REST)
                const isEndOfBlock = currentStep.isLastInBlock;
                const nextIndex = flatStepIndex + 1;
                
                if (nextIndex >= flatSteps.length) {
                    setState("FINISHED");
                    const totalDuration = flatSteps.reduce((acc: number, step: any) => acc + step.duration, 0);
                    saveWorkoutSession(routine.id, totalDuration);
                    return;
                }
                
                // If it's the end of a block, check if the rope changes for the next block
                if (isEndOfBlock && currentStep.rope?.id !== currentStep.nextBlockRope?.id) {
                    setState("ROPE_CHANGE");
                    setTimeLeft(currentStep.blockRopeChangeTime);
                    setFlatStepIndex(nextIndex);
                } else {
                    const nextStep = flatSteps[nextIndex];
                    setState(nextStep.type === "REST" ? "REST" : "ACTIVE");
                    setTimeLeft(nextStep.duration);
                    setFlatStepIndex(nextIndex);
                }
            }
        }
    }, [state, currentStep, flatStepIndex, flatSteps, ropeChangeDuration]);

    useEffect(() => {
        if (state === "IDLE" || state === "FINISHED" || isPaused) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (state !== "ROPE_CHANGE") playBeep("high");
                    nextPhase();
                    return 0;
                }
                
                if (prev <= 6 && (state === "ACTIVE" || state === "REST")) {
                    playBeep("low");
                }
                
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state, isPaused, nextPhase, playBeep]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m > 0) return `${m}:${s.toString().padStart(2, "0")}`;
        return seconds.toString();
    };

    if (state === "IDLE") {
        return (
            <div className="h-screen flex flex-col p-6 bg-zinc-950">
                <button onClick={() => router.back()} className="absolute top-6 left-6 text-zinc-400 hover:text-white">
                    <X size={32} />
                </button>
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                    <h1 className="text-4xl font-black">{routine.name}</h1>
                    <p className="text-zinc-400 max-w-xs">{routine.description}</p>
                    <div className="pt-8">
                        <button onClick={startRoutine} className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-emerald-500/20">
                            <Play fill="currentColor" size={48} className="ml-3 text-white" />
                        </button>
                    </div>
                    <p className="text-sm font-medium text-emerald-400 pt-4">Toca para empezar</p>
                </div>
            </div>
        );
    }

    if (state === "FINISHED") {
        return (
            <div className="h-screen flex flex-col p-6 bg-emerald-950 text-emerald-50">
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                    <CheckCircle2 size={80} className="text-emerald-400 mb-4" />
                    <h1 className="text-4xl font-black uppercase tracking-widest text-white">¡Completado!</h1>
                    <p className="text-emerald-200">Has terminado la rutina {routine.name}</p>
                    <div className="pt-12">
                        <button onClick={() => router.push("/")} className="px-8 py-4 bg-white text-emerald-900 font-bold rounded-full hover:bg-zinc-200 transition-colors">
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalSteps = flatSteps.length;
    const progress = ((flatStepIndex) / totalSteps) * 100;

    let bgColor = "bg-zinc-950";
    let accentColor = "text-emerald-400";
    if (state === "REST") {
        bgColor = "bg-blue-950";
        accentColor = "text-blue-400";
    } else if (state === "ROPE_CHANGE") {
        bgColor = "bg-orange-950";
        accentColor = "text-orange-400";
    }

    return (
        <div className={`h-screen flex flex-col transition-colors duration-500 ${bgColor}`}>
            <div className="h-1.5 w-full bg-black/50">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="p-6 flex justify-between items-center">
                <button onClick={() => setState("IDLE")} className="text-white/50 hover:text-white">
                    <X size={28} />
                </button>
                <div className="text-center">
                    <span className="font-bold text-white/50 text-xs block uppercase tracking-wider">{currentStep.blockName}</span>
                    <span className="font-bold text-white/50">{flatStepIndex + 1} / {totalSteps}</span>
                </div>
                <div className="w-7"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">


                {state === "ACTIVE" && (
                    <div className="space-y-6 w-full max-w-sm animate-in slide-in-from-bottom duration-500">
                        <div className="bg-black/20 rounded-3xl p-6 backdrop-blur-md border border-white/5">
                            <h2 className={`text-xl font-bold uppercase tracking-widest ${accentColor} mb-2`}>
                                {currentStep.jumpType?.name || "Saltando"}
                            </h2>
                            {currentStep.rope && (
                                <p className="text-white/70 font-medium">Cuerda: {currentStep.rope.name}</p>
                            )}
                        </div>
                        <div className={`text-[120px] font-black leading-none tracking-tighter ${timeLeft <= 5 ? "text-red-500 scale-110 transition-transform" : "text-white"}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                )}

                {state === "REST" && (
                    <div className="space-y-6 w-full max-w-sm animate-in slide-in-from-bottom duration-500">
                        <h2 className={`text-4xl font-bold uppercase tracking-widest ${accentColor}`}>Descanso</h2>
                        <div className="text-[120px] font-black leading-none text-white">{formatTime(timeLeft)}</div>
                    </div>
                )}

                {state === "ROPE_CHANGE" && (
                    <div className="space-y-6 w-full max-w-sm animate-in zoom-in duration-500">
                        <h2 className={`text-3xl font-bold uppercase ${accentColor}`}>Cambio de Cuerda</h2>
                        <p className="text-xl text-white">Siguiente: <span className="font-bold">{currentStep.rope?.name}</span></p>
                        <div className="text-[100px] font-black leading-none text-white">{formatTime(timeLeft)}</div>
                    </div>
                )}
            </div>

            <div className="p-8 pb-12 flex justify-center items-center gap-8">
                <button onClick={() => setFlatStepIndex(Math.max(0, flatStepIndex - 1))} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <RotateCcw className="text-white" size={24} />
                </button>
                <button 
                    onClick={() => setIsPaused(!isPaused)} 
                    className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                >
                    {isPaused ? <Play fill="currentColor" size={32} className="ml-1" /> : <Pause fill="currentColor" size={32} />}
                </button>
                <button onClick={() => { setIsPaused(false); nextPhase(); }} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <FastForward className="text-white" fill="currentColor" size={24} />
                </button>
            </div>
        </div>
    );
}
