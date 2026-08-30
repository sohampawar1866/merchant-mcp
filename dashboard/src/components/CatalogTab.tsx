'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, RefreshCw, Sparkles, Download, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { ProductModal } from './ProductModal';

export function CatalogTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load catalog from database');
      }
      setProducts(data.products || []);
    } catch (e: any) {
      console.error('Failed to load catalog:', e);
      setErrorMessage(e.message || 'Database connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImportRazorpay = async () => {
    setImporting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Razorpay product import failed');
      }
      setNotification(`Successfully imported ${data.imported_products?.length || 1} product(s) from Razorpay!`);
      setTimeout(() => setNotification(''), 4000);
      fetchProducts();
    } catch (e: any) {
      console.error('Import failed:', e);
      setErrorMessage(e.message || 'Failed to import from Razorpay');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the catalog?`)) return;
    setErrorMessage('');
    try {
      const res = await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }
      fetchProducts();
    } catch (e: any) {
      console.error('Delete failed:', e);
      setErrorMessage(e.message || 'Product deletion failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="p-5 rounded-xl bg-[#0e1e36] border border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-base font-semibold text-white">Merchant Catalog Management</h2>
            <p className="text-xs text-slate-400">Configure base and private floor prices for AI buyer agent negotiations</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleImportRazorpay}
            disabled={importing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            {importing ? 'Importing...' : '📥 Prefill from Razorpay'}
          </button>

          <button
            onClick={() => {
              setSelectedProduct(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>

          <button
            onClick={fetchProducts}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold">Error:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-400 hover:text-white font-bold text-sm px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <span>{notification}</span>
        </div>
      )}

      {/* Catalog Table */}
      <div className="rounded-xl bg-[#0e1e36] border border-slate-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading catalog items...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No products found in catalog. Add your first item!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#071324] text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base Price</th>
                  <th className="p-4">
                    Floor Price <span className="text-[10px] text-amber-400">(Private)</span>
                  </th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/30 transition">
                    <td className="p-4 font-semibold text-white max-w-xs">
                      {p.name}
                      <span className="block text-[11px] text-slate-500 truncate font-normal">{p.description}</span>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p.category || 'general'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      ₹{p.formatted_base_price}
                    </td>
                    <td className="p-4 font-mono text-amber-400 font-semibold">
                      ₹{p.formatted_floor_price}
                    </td>
                    <td className="p-4 font-mono">
                      <span className={p.stock > 10 ? 'text-emerald-400' : 'text-amber-400'}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(p.tags) &&
                          p.tags.map((t: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40">
                              {t}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchProducts}
        product={selectedProduct}
      />
    </div>
  );
}
