const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDb() {
    try {
        const result = await prisma.electricalComponent.updateMany({
            where: {
                OR: [
                    { code: "4015 R4032" },
                    { alias: "El paraiso" }
                ]
            },
            data: {
                longitude: -99.363867
            }
        });
        console.log("Updated components:", result.count);
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

updateDb();
