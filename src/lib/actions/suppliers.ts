'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSupplier(data: { name: string; contact?: string; email?: string; phone?: string }) {
    try {
        const supplier = await prisma.supplier.create({
            data,
        });
        revalidatePath('/admin/purchases');
        return { success: true, supplier };
    } catch (error) {
        console.error('Error creating supplier:', error);
        return { success: false, error: 'Error al crear proveedor' };
    }
}


export async function getSuppliers() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        });
        return suppliers;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return [];
    }
}

export async function updateSupplier(id: string, data: { name: string; contact?: string; email?: string; phone?: string }) {
    try {
        const supplier = await prisma.supplier.update({
            where: { id },
            data,
        });
        revalidatePath('/admin/purchases');
        return { success: true, supplier };
    } catch (error) {
        console.error('Error updating supplier:', error);
        return { success: false, error: 'Error al actualizar proveedor' };
    }
}

export async function deleteSupplier(id: string) {
    try {
        await prisma.supplier.delete({
            where: { id },
        });
        revalidatePath('/admin/purchases');
        return { success: true };
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return { success: false, error: 'Error al eliminar proveedor' };
    }
}
