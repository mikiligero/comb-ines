import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { signToken, verifyPassword, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSystemStatus() {
    const userCount = await prisma.user.count();
    return { hasUsers: userCount > 0 };
}

async function loginAction(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await verifyPassword(password, user.password))) {
        redirect("/login?error=InvalidCredentials");
    }

    const token = await signToken({ userId: user.id, username: user.username, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    redirect("/");
}

async function registerAdminAction(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
        redirect("/login?error=PasswordMismatch");
    }

    // Double check to prevent race conditions
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        redirect("/login?error=SetupAlreadyCompleted");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            role: "ADMIN",
            name: "Admin User",
        },
    });

    const token = await signToken({ userId: user.id, username: user.username, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    redirect("/");
}

export default async function LoginPage() {
    const { hasUsers } = await getSystemStatus();

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
                <div className="text-center">
                    <h1 className="text-4xl font-black tracking-tight text-white">
                        Comb-ines
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        {hasUsers ? "Acceso a tus entrenamientos" : "Configuración Inicial del Sistema"}
                    </p>
                </div>

                {hasUsers ? (
                    <form action={loginAction} className="mt-8 space-y-6" suppressHydrationWarning>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-bold text-zinc-300 mb-1">
                                    Usuario
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="usuario"
                                    suppressHydrationWarning
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-zinc-300 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="••••••••"
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition-colors"
                        >
                            Empezar
                        </button>
                    </form>
                ) : (
                    <form action={registerAdminAction} className="mt-8 space-y-6" suppressHydrationWarning>
                        <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-900">
                            <p className="text-sm text-emerald-400 font-medium">
                                ¡Bienvenido! Crea tu cuenta principal para empezar a organizar tus entrenamientos.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-bold text-zinc-300 mb-1">
                                    Usuario
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="admin"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-zinc-300 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-bold text-zinc-300 mb-1">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition-colors"
                        >
                            Crear Cuenta
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
