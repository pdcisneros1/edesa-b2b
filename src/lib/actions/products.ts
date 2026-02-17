'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleProductFeatured(id: string, isFeatured: boolean) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: { isFeatured },
        });
        revalidatePath('/admin/productos');
        revalidatePath('/'); // Update main page if necessary
        return { success: true, product };
    } catch (error) {
        console.error('Error toggling featured status:', error);
        return { success: false, error: 'Error al actualizar estado destacado' };
    }
}
