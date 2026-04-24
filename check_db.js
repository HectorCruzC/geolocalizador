const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        const comps = await prisma.electricalComponent.findMany({
            where: {
                OR: [
                    { code: { contains: "4032", mode: "insensitive" } },
                    { name: { contains: "4032", mode: "insensitive" } },
                    { alias: { contains: "4032", mode: "insensitive" } }
                ]
            }
        });
        console.log("Found components:");
        console.log(JSON.stringify(comps, null, 2));
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
