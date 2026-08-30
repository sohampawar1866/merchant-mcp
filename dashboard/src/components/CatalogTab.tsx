'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, RefreshCw, Download, Edit2, Trash2, Lock } from 'lucide-react';
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
    if (!confirm(`Are you sure you want to remove "${name}" from your store catalog?`)) return;
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
      {/* Figma Signature Story Block: Lilac Ground for Catalog & Pricing Rules */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-lilac text-figma-ink border border-black/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono tracking-wider uppercase mb-2">
              <Package className="w-3.5 h-3.5" /> STORE INVENTORY & BARGAINING
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-figma-ink">
              Store Catalog & Pricing Rules
            </h2>
            <p className="text-xs sm:text-sm text-figma-ink/80 mt-1 max-w-2xl font-medium">
              Configure public listing prices and secret minimum bargaining floors. AI buyers negotiate within your safe margin rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleImportRazorpay}
              disabled={importing}
              className="flex-1 sm:flex-none h-11 px-5 bg-white hover:bg-figma-surfaceSoft text-figma-ink rounded-full text-xs font-bold transition flex items-center justify-center gap-2 border border-black/15 shadow-xs"
            >
              <Download className="w-4 h-4" />
              {importing ? 'Importing...' : 'Import from Razorpay'}
            </button>

            <button
              onClick={() => {
                setSelectedProduct(null);
                setModalOpen(true);
              }}
              className="flex-1 sm:flex-none h-11 px-6 bg-figma-primary hover:opacity-90 text-figma-onPrimary rounded-full text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>

            <button
              onClick={fetchProducts}
              className="w-11 h-11 bg-white hover:bg-figma-surfaceSoft border border-black/15 text-figma-ink rounded-full flex items-center justify-center transition shrink-0 shadow-xs"
              title="Refresh catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Rule Summary Pills */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-figma-ink">
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 border border-black/10 font-bold uppercase">
            3-STAGE CONCESSION LADDER
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 border border-black/10 font-bold uppercase">
            100% PRIVATE FLOOR DEFENSE
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 border border-black/10 font-bold uppercase">
            ZERO MARGIN LEAKAGE
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-figma-pink border border-black/10 text-figma-ink text-xs sm:text-sm flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold">NOTICE:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="hover:opacity-70 font-bold text-sm px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {notification && (
        <div className="p-3.5 rounded-lg bg-figma-mint border border-black/10 text-figma-ink text-xs sm:text-sm flex items-center justify-between font-mono font-medium">
          <span>{notification}</span>
        </div>
      )}

      {/* Catalog Table & Mobile Cards */}
      <div className="rounded-lg bg-white border border-black/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-xs sm:text-sm font-mono">
            LOADING STORE PRODUCTS...
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs sm:text-sm">
            No products found in catalog. Click "Add Product" or import from Razorpay to get started!
          </div>
        ) : (
          <>
            {/* Mobile Product Cards (< 768px) */}
            <div className="md:hidden divide-y divide-black/5">
              {products.map((p) => (
                <div key={p.id} className="p-4 space-y-3 hover:bg-zinc-50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-figma-ink">
                        {p.name}
                      </div>
                      <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full bg-zinc-100 text-figma-ink text-[11px] uppercase font-mono tracking-wider border border-black/5">
                        {p.category || 'general'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-full bg-white border border-black/10 text-figma-ink hover:bg-zinc-50 transition"
                        title="Edit product details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2 rounded-full bg-white border border-black/10 text-figma-ink hover:bg-figma-pink transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {p.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-zinc-50 border border-black/5">
                    <div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Listing Price</div>
                      <div className="text-base font-extrabold text-figma-ink mt-0.5">₹{p.formatted_base_price}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-figma-ink font-mono uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Secret Floor
                      </div>
                      <div className="text-base font-extrabold text-figma-ink mt-0.5">₹{p.formatted_floor_price}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5 text-xs font-mono">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${p.stock > 10 ? 'bg-figma-mint/50 text-figma-ink border border-black/5' : 'bg-figma-coral/50 text-figma-ink border border-black/5'}`}>
                      {p.stock} IN STOCK
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                      {Array.isArray(p.tags) &&
                        p.tags.slice(0, 3).map((t: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white text-zinc-600 border border-black/5 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      {Array.isArray(p.tags) && p.tags.length > 3 && (
                        <span className="text-[10px] text-zinc-400 self-center font-mono">
                          +{p.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-figma-ink">
                <thead className="bg-zinc-50 text-zinc-500 uppercase font-mono text-[11px] tracking-wider border-b border-black/5">
                  <tr>
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Listing Price</th>
                    <th className="p-4">
                      Minimum Secret Price <span className="text-[10px] text-zinc-500 font-mono uppercase">(Private)</span>
                    </th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Discovery Tags</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition">
                      <td className="p-4 font-bold text-figma-ink max-w-xs text-xs sm:text-sm">
                        {p.name}
                        <span className="block text-xs text-zinc-500 truncate font-normal mt-0.5">
                          {p.description}
                        </span>
                      </td>
                      <td className="p-4 capitalize">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-figma-ink border border-black/5 text-xs font-mono uppercase tracking-wider">
                          {p.category || 'general'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-figma-ink text-sm sm:text-base">
                        ₹{p.formatted_base_price}
                      </td>
                      <td className="p-4 font-extrabold text-figma-ink text-sm sm:text-base">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-figma-pink/60 border border-black/5 text-xs font-mono">
                          <Lock className="w-3 h-3" />
                          ₹{p.formatted_floor_price}
                        </span>
                      </td>
                      <td className="p-4 text-xs sm:text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${p.stock > 10 ? 'bg-figma-mint/50 text-figma-ink border border-black/5' : 'bg-figma-coral/50 text-figma-ink border border-black/5'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(p.tags) &&
                            p.tags.map((t: string, i: number) => (
                              <span
                                key={i}
                                className="text-[11px] px-2.5 py-0.5 rounded-full bg-white text-zinc-700 border border-black/10 font-mono"
                              >
                                {t}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-full bg-white hover:bg-zinc-50 text-figma-ink transition border border-black/10"
                          title="Edit product details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-full bg-white hover:bg-figma-pink text-figma-ink transition border border-black/10"
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
          </>
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



