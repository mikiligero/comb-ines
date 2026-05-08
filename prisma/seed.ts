import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const username = "admin";
    const password = await bcrypt.hash("admin123", 10);

    const user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: {
            username,
            password,
            name: "Admin Mikines",
            role: "ADMIN",
        },
    });

    console.log({ user });

    // Seed JumpTypes
    const jumps = [
        { name: "Salto Básico", description: "Salto normal a pies juntos" },
        { name: "Salto Alterno", description: "Alternando pie izquierdo y derecho" },
        { name: "Doble Salto", description: "La comba pasa dos veces por debajo" },
        { name: "Cruzado", description: "Brazos cruzados durante el salto" }
    ];

    for (const jump of jumps) {
        await prisma.jumpType.create({ data: jump });
    }

    // Seed Ropes
    const ropes = [
        { name: "Ligera Verde", color: "green", weight: "1/4 lb" },
        { name: "Pesada Blanca", color: "white", weight: "1 lb" }
    ];

    for (const rope of ropes) {
        await prisma.rope.create({ data: rope });
    }

    // Settings
    await prisma.settings.create({
        data: { ropeChangeDuration: 30 }
    });

    console.log("Seeding finished.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
