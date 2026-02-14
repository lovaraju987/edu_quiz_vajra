
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface Product {
    _id: string;
    productName: string;
    description: string;
    category: string;
    originalPrice: number;
    imageUrl: string;
    brand?: string;
    stock: number;
    isActive: boolean;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState = {
        productName: "",
        description: "",
        category: "Gadgets",
        originalPrice: 1000,
        imageUrl: "",
        brand: "",
        stock: 5
    };

    const [formData, setFormData] = useState(initialFormState);

    const categories = ['Electronics', 'Books', 'Gadgets', 'Accessories', 'Other'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.products) {
                setProducts(data.products);
            }
        } catch (error) {
            toast.error("Failed to fetch products");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setIsEditing(true);
        setEditingId(product._id);
        setFormData({
            productName: product.productName,
            description: product.description,
            category: product.category,
            originalPrice: product.originalPrice,
            imageUrl: product.imageUrl,
            brand: product.brand || "",
            stock: product.stock
        });
        toast.info(`Editing ${product.productName}`);

        // Scroll to form (optional UX improvement)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Determine API Endpoint and Method
            const url = isEditing && editingId
                ? `/api/products/${editingId}`
                : "/api/products";

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(isEditing ? "Product updated!" : "Product added to Store!");
                setFormData(initialFormState);
                if (isEditing) handleCancelEdit();
                fetchProducts(); // Refresh list
            } else {
                toast.error(data.error || "Operation failed");
            }
        } catch (error) {
            toast.error("Connection error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY remove this product?")) return;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast.success("Product deleted");
                fetchProducts();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Store</h1>
                    <p className="text-slate-500 mt-1">Add, Edit, and Manage products for the student reward store.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium text-sm border border-blue-100">
                    Total Products: {products.length}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className={`rounded-2xl shadow-sm border p-6 sticky top-8 transition-colors ${isEditing ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
                        }`}>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className={`p-2 rounded-lg ${isEditing ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                                {isEditing ? "✏️" : "✨"}
                            </span>
                            {isEditing ? "Edit Item" : "Add New Item"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    placeholder="e.g. Wireless Earbuds"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Price (Points)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.originalPrice}
                                        onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all h-24 resize-none"
                                    placeholder="Product details..."
                                />
                            </div>

                            <div className="flex gap-2">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-[2] py-3 font-bold rounded-xl transition-colors disabled:opacity-50 text-white ${isEditing ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isSubmitting ? "Saving..." : (isEditing ? "Update Product" : "Add Product")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold mb-4">Current Inventory</h2>

                    {isLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading products...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No products found. Add your first item!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all relative">
                                    {/* Action Buttons Overlay */}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="bg-white p-2 rounded-lg shadow-sm hover:bg-amber-50 text-amber-600 transition-colors border border-slate-100"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="bg-white p-2 rounded-lg shadow-sm hover:bg-red-50 text-red-600 transition-colors border border-slate-100"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <div className="relative h-40 w-full bg-slate-100">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                            {product.category}
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-800 line-clamp-1">{product.productName}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mt-1 mb-3 flex-1">{product.description}</p>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                <span>💎</span>
                                                <span>{product.originalPrice}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">
                                                Stock: <span className={product.stock > 0 ? "text-green-600" : "text-red-500"}>{product.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
