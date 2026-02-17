'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createPurchaseOrder } from '@/lib/actions/purchase-orders';
import { createSupplier, updateSupplier, deleteSupplier } from '@/lib/actions/suppliers';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

// Mock product type for selection
type ProductOption = {
    id: string;
    name: string;
    sku: string;
};

type OrderItem = {
    productId: string;
    quantity: number;
    unitCost: number;
};

export function PurchaseOrderForm({ suppliers: initialSuppliers, products }: { suppliers: any[], products: ProductOption[] }) {
    const router = useRouter();
    const [items, setItems] = useState<OrderItem[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [loading, setLoading] = useState(false);
    const [loadedFromStorage, setLoadedFromStorage] = useState(false);

    // Persist state to localStorage
    useEffect(() => {
        const savedData = localStorage.getItem('purchaseOrderDraft');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setInvoiceNumber(parsed.invoiceNumber || '');
                setSupplierId(parsed.supplierId || '');
                setItems(parsed.items || []);
                // Also restore search queries if possible, or just let them remain empty (showing SKU/Name in inputs)
            } catch (e) {
                console.error('Error parsing draft', e);
            }
        }
        setLoadedFromStorage(true);
    }, []);

    useEffect(() => {
        if (loadedFromStorage) {
            const dataToSave = { invoiceNumber, supplierId, items };
            localStorage.setItem('purchaseOrderDraft', JSON.stringify(dataToSave));
        }
    }, [invoiceNumber, supplierId, items, loadedFromStorage]);


    // Supplier Management State
    const [isSupplierManagerOpen, setIsSupplierManagerOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null); // If null, mode is CREATE
    const [supplierForm, setSupplierForm] = useState({ name: '', contact: '', email: '' });
    const [managingSuppliers, setManagingSuppliers] = useState(false); // To show list vs form

    // Searchable Product State
    // keys are index of item, value is search query
    const [productSearchQueries, setProductSearchQueries] = useState<Record<number, string>>({});
    const [openProductDropdowns, setOpenProductDropdowns] = useState<Record<number, boolean>>({});

    const addItem = () => {
        setItems([...items, { productId: '', quantity: 1, unitCost: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
        // Cleanup search state
        const newQueries = { ...productSearchQueries };
        delete newQueries[index];
        setProductSearchQueries(newQueries);
    };

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleProductSelect = (index: number, product: ProductOption) => {
        updateItem(index, 'productId', product.id);
        // Update search query to match selected product name for display
        setProductSearchQueries(prev => ({ ...prev, [index]: product.name }));
        setOpenProductDropdowns(prev => ({ ...prev, [index]: false }));
    };

    const toggleProductDropdown = (index: number) => {
        setOpenProductDropdowns(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const filteredProducts = (query: string) => {
        if (!query) return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase())
        );
    };

    const getProductDetails = (id: string) => products.find(p => p.id === id);

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    // Supplier Actions
    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingSupplier) {
                // Update
                const result = await updateSupplier(editingSupplier.id, supplierForm);
                if (result.success && result.supplier) {
                    toast.success('Proveedor actualizado');
                    setSuppliers(suppliers.map(s => s.id === result.supplier.id ? result.supplier : s));
                    setEditingSupplier(null);
                } else {
                    toast.error(result.error);
                }
            } else {
                // Create
                const result = await createSupplier(supplierForm);
                if (result.success && result.supplier) {
                    toast.success('Proveedor creado');
                    setSuppliers([...suppliers, result.supplier]);
                    setSupplierId(result.supplier.id);
                    setManagingSuppliers(false); // Go back to list or close
                    setEditingSupplier(null);
                } else {
                    toast.error(result.error);
                }
            }
            setSupplierForm({ name: '', contact: '', email: '' });
        } catch (error) {
            toast.error('Error al guardar proveedor');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSupplier = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
        try {
            const result = await deleteSupplier(id);
            if (result.success) {
                toast.success('Proveedor eliminado');
                setSuppliers(suppliers.filter(s => s.id !== id));
                if (supplierId === id) setSupplierId('');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const startEditSupplier = (supplier: any) => {
        setEditingSupplier(supplier);
        setSupplierForm({ name: supplier.name, contact: supplier.contact || '', email: supplier.email || '' });
        setManagingSuppliers(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting order:', { invoiceNumber, supplierId, items });

            // Validation
            if (!invoiceNumber) { toast.error('Falta número de factura'); setLoading(false); return; }
            if (!supplierId) { toast.error('Falta proveedor'); setLoading(false); return; }
            if (items.length === 0) { toast.error('Agrega productos'); setLoading(false); return; }
            if (items.some(i => !i.productId)) { toast.error('Selecciona el producto para todos los items'); setLoading(false); return; }

            const result = await createPurchaseOrder({
                invoiceNumber,
                supplierId,
                items,
                date: new Date().toISOString(),
            });

            if (result.success) {
                toast.success('Orden de compra creada exitosamente');
                localStorage.removeItem('purchaseOrderDraft'); // Clear draft
                router.push('/admin/purchases');
                router.refresh();
            } else {
                console.error('Submission error:', result.error);
                toast.error(result.error || 'Error al crear orden');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (!loadedFromStorage) return null; // Prevent hydration mismatch

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-[1400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="invoice">Número de Factura</Label>
                    <Input
                        id="invoice"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        required
                        placeholder="Ej. 001-001-123456789"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="supplier">Proveedor</Label>
                    <div className="flex gap-2">
                        <Select value={supplierId} onValueChange={setSupplierId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Dialog open={isSupplierManagerOpen} onOpenChange={setIsSupplierManagerOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon" title="Gestionar Proveedores">
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Gestionar Proveedores</DialogTitle>
                                    <DialogDescription>
                                        Crear, editar o eliminar proveedores.
                                    </DialogDescription>
                                </DialogHeader>

                                {managingSuppliers ? (
                                    <form onSubmit={handleSaveSupplier} className="space-y-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Nombre</Label>
                                            <Input value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Contacto</Label>
                                            <Input value={supplierForm.contact} onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Email</Label>
                                            <Input value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button type="button" variant="ghost" onClick={() => setManagingSuppliers(false)}>Cancelar</Button>
                                            <Button type="submit">{editingSupplier ? 'Actualizar' : 'Crear'}</Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="py-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-medium">Lista de Proveedores</h4>
                                            <Button size="sm" onClick={() => {
                                                setEditingSupplier(null);
                                                setSupplierForm({ name: '', contact: '', email: '' });
                                                setManagingSuppliers(true);
                                            }}>
                                                <Plus className="h-3 w-3 mr-1" /> Nuevo
                                            </Button>
                                        </div>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded p-2">
                                            {suppliers.map(s => (
                                                <div key={s.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                                    <div>
                                                        <div className="font-medium">{s.name}</div>
                                                        <div className="text-xs text-gray-500">{s.contact}</div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => startEditSupplier(s)}>✏️</Button>
                                                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteSupplier(s.id)}>🗑️</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Productos
                    </h3>
                    <Button type="button" onClick={addItem} size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Agregar Item
                    </Button>
                </div>

                <div className="space-y-2">
                    {/* Header Row */}
                    {items.length > 0 && (
                        <div className="hidden md:flex gap-4 px-4 pb-2 text-sm font-medium text-gray-500 border-b mb-4">
                            <div className="w-32">Código / SKU</div>
                            <div className="flex-1">Producto</div>
                            <div className="w-24">Cantidad</div>
                            <div className="w-32">Costo Unit.</div>
                            <div className="w-32">Total</div>
                            <div className="w-10"></div>
                        </div>
                    )}

                    {items.map((item, index) => {
                        const selectedProduct = getProductDetails(item.productId);
                        return (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-gray-50 p-4 rounded border relative group hover:bg-white hover:shadow-sm transition-all">
                                {/* SKU Column */}
                                <div className="w-full md:w-32">
                                    <Label className="md:hidden text-xs mb-1 block">SKU</Label>
                                    <div className="bg-gray-100 border rounded px-3 py-2 text-sm h-10 flex items-center font-mono">
                                        {selectedProduct?.sku || '-'}
                                    </div>
                                </div>

                                {/* Product Name Column (Searchable) */}
                                <div className="flex-1 w-full relative">
                                    <Label className="md:hidden text-xs mb-1 block">Producto</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Buscar producto..."
                                            value={productSearchQueries[index] !== undefined ? productSearchQueries[index] : (selectedProduct?.name || '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setProductSearchQueries(prev => ({ ...prev, [index]: val }));
                                                if (!openProductDropdowns[index]) setOpenProductDropdowns(prev => ({ ...prev, [index]: true }));
                                                // Clear productId if user starts typing, forcing re-selection
                                                if (item.productId) updateItem(index, 'productId', '');
                                            }}
                                            onClick={() => toggleProductDropdown(index)}
                                            className={!item.productId ? "border-red-300 ring-red-200 focus:ring-red-200" : ""}
                                        />
                                        {!item.productId && (productSearchQueries[index] || '').length > 0 && (
                                            <div className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                                                Seleccione de la lista
                                            </div>
                                        )}
                                        {openProductDropdowns[index] && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-xl max-h-60 overflow-auto">
                                                {filteredProducts(productSearchQueries[index] || '').length > 0 ? (
                                                    filteredProducts(productSearchQueries[index] || '').map(p => (
                                                        <div
                                                            key={p.id}
                                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0 flex justify-between items-center"
                                                            onClick={() => handleProductSelect(index, p)}
                                                        >
                                                            <span>{p.name}</span>
                                                            <Badge variant="outline" className="text-xs font-mono ml-2">{p.sku}</Badge>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-gray-500">No se encontraron productos</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="w-full md:w-24">
                                    <Label className="md:hidden text-xs mb-1 block">Cantidad</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="bg-white text-center"
                                    />
                                </div>

                                {/* Unit Cost */}
                                <div className="w-full md:w-32">
                                    <Label className="md:hidden text-xs mb-1 block">Costo Unit.</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitCost}
                                            onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                                            className="pl-7 bg-white text-right"
                                        />
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="w-full md:w-32">
                                    <Label className="md:hidden text-xs mb-1 block">Total</Label>
                                    <div className="h-10 flex items-center justify-end px-3 bg-gray-100 border rounded text-sm font-bold">
                                        ${(item.quantity * item.unitCost).toFixed(2)}
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="shrink-0 mt-4 md:mt-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        );
                    })}

                    {items.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50 text-gray-500">
                            <p>No hay productos en la orden.</p>
                            <Button variant="link" onClick={addItem} type="button">
                                Agregar primer producto
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end items-center gap-4 pt-4 border-t">
                    <span className="text-gray-500">Total a Pagar:</span>
                    <span className="text-3xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex justify-end gap-4 sticky bottom-4 bg-white/80 p-4 backdrop-blur-sm border rounded shadow-lg">
                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading || items.length === 0} size="lg">
                    {loading ? 'Guardando...' : 'Guardar Orden de Compra'}
                </Button>
            </div>
        </form>
    );
}
