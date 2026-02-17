import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.supplier.count();
    if (count === 0) {
        console.log('No suppliers found. Creating default supplier...');
        await prisma.supplier.create({
            data: {
                name: 'Fábrica EDESA',
                contact: 'Soporte Fábrica',
                email: 'pedidos@edesa.ec',
                phone: '02-222-2222',
            },
        });
        console.log('Default supplier "Fábrica EDESA" created.');
    } else {
        console.log(`Found ${count} suppliers. Ready to test.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
