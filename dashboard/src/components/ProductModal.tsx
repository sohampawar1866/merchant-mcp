'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: any;
}

export function ProductModal({ isOpen, onClose, onSaved, product }: ProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('audio');
  const [basePriceRupees, setBasePriceRupees] = useState('');
  const [floorPriceRupees, setFloorPriceRupees] = useState('');
  const [stock, setStock] = useState('50');
  const [tagsInput, setTagsInput] = useState('');
  const [taggingLoading, setTaggingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setCategory(product.category || 'audio');
      setBasePriceRupees((product.base_price / 100).toString());
      setFloorPriceRupees((product.floor_price / 100).toString());
      setStock(product.stock?.toString() || '0');
      setTagsInput(Array.isArray(product.tags) ? product.tags.join(', ') : '');
    } else {
      setName('');
      setDescription('');
      setCategory('audio');
      setBasePriceRupees('');
      setFloorPriceRupees('');
      setStock('50');
      setTagsInput('');
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAiTagging = async () => {
    if (!name) {
      setError('Please enter a product name first to suggest tags');
      return;
    }
    setTaggingLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tagger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI Tagging service returned an error');
      }
      if (data.category) setCategory(data.category);
      if (data.suggested_tags && Array.isArray(data.suggested_tags)) {
        setTagsInput(data.suggested_tags.join(', '));
      }
    } catch (e: any) {
      setError(e.message || 'AI Tagging failed');
    } finally {
      setTaggingLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const basePrice = Math.round(parseFloat(basePriceRupees) * 100);
    const floorPrice = Math.round(parseFloat(floorPriceRupees) * 100);

    if (isNaN(basePrice) || isNaN(floorPrice)) {
      setError('Please enter valid numeric prices in ₹');
      return;
    }

    if (floorPrice > basePrice) {
      setError('Floor price (₹' + floorPriceRupees + ') cannot be higher than base price (₹' + basePriceRupees + ')');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    setSaving(true);
    try {
      const url = product ? `/api/catalog/${product.id}` : '/api/catalog';
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          tags,
          base_price: basePrice,
          floor_price: floorPrice,
          stock: parseInt(stock, 10) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-[#0c2340] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {product ? 'Edit Product' : 'Add New Store Product'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AirBass X2 Pro Wireless Earbuds"
              className="w-full px-3.5 py-2 bg-[#071324] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Description</label>
              <button
                type="button"
                onClick={handleAiTagging}
                disabled={taggingLoading}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition"
              >
                <Sparkles className={`w-3.5 h-3.5 ${taggingLoading ? 'animate-spin' : ''}`} />
                {taggingLoading ? 'Analyzing...' : '✨ AI Suggest Category & Tags'}
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product features and specifications..."
              className="w-full px-3.5 py-2 bg-[#071324] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#071324] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 capitalize"
              >
                <option value="audio">Audio</option>
                <option value="wearables">Wearables</option>
                <option value="computing">Computing</option>
                <option value="smart_home">Smart Home</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inventory Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#071324] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Base Price (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                required
                value={basePriceRupees}
                onChange={(e) => setBasePriceRupees(e.target.value)}
                placeholder="1799.00"
                className="w-full px-3.5 py-2 bg-[#071324] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Floor Price (₹ INR) <span className="text-[10px] text-slate-400">(Private)</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={floorPriceRupees}
                onChange={(e) => setFloorPriceRupees(e.target.value)}
                placeholder="1499.00"
                className="w-full px-3.5 py-2 bg-[#071324] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Search Tags <span className="text-[10px] text-slate-400">(Comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. wireless, anc, bluetooth, earbuds, audio"
              className="w-full px-3.5 py-2 bg-[#071324] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
