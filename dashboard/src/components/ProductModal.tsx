'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Lock, Info } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: any;
  merchantId: string;
}

export const PRODUCT_CATEGORIES = [
  {
    group: 'Electronics & Gadgets',
    categories: [
      { id: 'audio', label: 'Audio, Headphones & Speakers' },
      { id: 'wearables', label: 'Smartwatches & Fitness Bands' },
      { id: 'computing', label: 'Computers, Laptops & Accessories' },
      { id: 'smart_home', label: 'Smart Home & IoT Devices' },
      { id: 'mobile_accessories', label: 'Mobile Accessories & Fast Chargers' },
      { id: 'cameras_optics', label: 'Cameras, Drones & Optics' },
    ],
  },
  {
    group: 'Food, Beverages & Gourmet',
    categories: [
      { id: 'packaged_food', label: 'Packaged Snacks, Sweets & Breakfast' },
      { id: 'beverages', label: 'Coffee, Tea & Cold Beverages' },
      { id: 'dairy_fresh', label: 'Dairy, Plant Milk & Yogurts' },
      { id: 'meat_seafood', label: 'Fresh Meat, Seafood & Poultry' },
      { id: 'organic_staples', label: 'Organic Grains, Oils & Spices' },
    ],
  },
  {
    group: 'Health, Beauty & Personal Care',
    categories: [
      { id: 'beauty_skincare', label: 'Skincare, Haircare & Cosmetics' },
      { id: 'personal_care', label: "Bath, Body & Men's Grooming" },
      { id: 'health_nutrition', label: 'Supplements, Protein & Superfoods' },
      { id: 'pharmacy_wellness', label: 'OTC Wellness, First Aid & Monitors' },
    ],
  },
  {
    group: 'Fashion, Apparel & Lifestyle',
    categories: [
      { id: 'mens_apparel', label: "Men's Apparel & Footwear" },
      { id: 'womens_apparel', label: "Women's Apparel & Ethnic Wear" },
      { id: 'luggage_bags', label: 'Luggage, Backpacks & Travel Bags' },
      { id: 'eyewear_jewellery', label: 'Eyewear, Watches & Jewellery' },
    ],
  },
  {
    group: 'Home, Kitchen & Sports',
    categories: [
      { id: 'home_kitchen', label: 'Kitchen Appliances, Cookware & Dining' },
      { id: 'home_decor', label: 'Home Decor, Bedding & Lighting' },
      { id: 'fitness_sports', label: 'Gym Equipment, Yoga & Sports Gear' },
      { id: 'books_stationery', label: 'Books, Notebooks & Office Supplies' },
    ],
  },
  {
    group: 'Other',
    categories: [
      { id: 'general', label: 'General Merchandise' },
    ],
  },
];

export function ProductModal({ isOpen, onClose, onSaved, product, merchantId }: ProductModalProps) {
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
      setBasePriceRupees(Math.round(product.base_price / 100).toString());
      setFloorPriceRupees(Math.round(product.floor_price / 100).toString());
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
      setError('Please enter a product title first to auto-generate keywords');
      return;
    }
    setTaggingLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tagger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, merchant_id: merchantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'AI helper encountered an error');
      }
      if (data.category) setCategory(data.category);
      if (data.suggested_tags && Array.isArray(data.suggested_tags)) {
        setTagsInput(data.suggested_tags.join(', '));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to auto-suggest tags');
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
      setError('Minimum secret price (₹' + floorPriceRupees + ') cannot be higher than store listing price (₹' + basePriceRupees + ')');
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
          merchant_id: merchantId,
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
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to save product');

      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white border border-black/10 rounded-lg shadow-2xl overflow-hidden text-figma-ink">
        <div className="p-6 border-b border-black/10 flex items-center justify-between bg-figma-lilac">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono tracking-wider uppercase mb-1">
              STORE CATALOG ITEM
            </div>
            <h3 className="font-sans text-lg sm:text-xl font-bold text-figma-ink">
              {product ? 'Edit Store Product' : 'Add New Store Product'}
            </h3>
            <p className="text-xs text-figma-ink/80 font-medium">
              Configure product details and your secret minimum bargaining price
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 border border-black/10 text-figma-ink flex items-center justify-center transition shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-md bg-figma-pink border border-black/10 text-figma-ink text-xs sm:text-sm flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-figma-ink shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-figma-ink mb-1.5 uppercase font-mono tracking-wider">Product Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AirBass X2 Pro Wireless Earbuds"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-black/15 rounded-md text-xs sm:text-sm text-figma-ink placeholder-zinc-400 focus:outline-none focus:border-black transition font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-figma-ink uppercase font-mono tracking-wider">Description</label>
              <button
                type="button"
                onClick={handleAiTagging}
                disabled={taggingLoading}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase bg-figma-lime hover:opacity-90 border border-black/10 px-3 py-1 rounded-full text-figma-ink transition font-bold"
              >
                <Sparkles className={`w-3.5 h-3.5 ${taggingLoading ? 'animate-spin' : ''}`} />
                {taggingLoading ? 'Analyzing...' : 'AI Auto-Fill'}
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe features, battery life, color, compatibility..."
              className="w-full px-4 py-2.5 bg-zinc-50 border border-black/15 rounded-md text-xs sm:text-sm text-figma-ink placeholder-zinc-400 focus:outline-none focus:border-black transition font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-figma-ink mb-1.5 uppercase font-mono tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-black/15 rounded-md text-xs sm:text-sm text-figma-ink focus:outline-none focus:border-black transition font-medium"
              >
                {PRODUCT_CATEGORIES.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-figma-ink mb-1.5 uppercase font-mono tracking-wider">Available Stock (Units)</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-black/15 rounded-md text-xs sm:text-sm text-figma-ink focus:outline-none focus:border-black font-mono transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-black/10">
              <label className="block text-xs font-bold text-figma-ink mb-1.5 uppercase font-mono tracking-wider">
                Listing Price (₹)
              </label>
              <input
                type="number"
                step="1"
                required
                value={basePriceRupees}
                onChange={(e) => setBasePriceRupees(e.target.value)}
                placeholder="1799"
                className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-md text-xs sm:text-sm text-figma-ink focus:outline-none focus:border-black font-mono transition font-bold"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase">Public price shown to shoppers</p>
            </div>
            <div className="p-3.5 rounded-lg bg-figma-pink text-figma-ink border border-black/10">
              <label className="block text-xs font-bold text-figma-ink mb-1.5 flex items-center gap-1 uppercase font-mono tracking-wider">
                <Lock className="w-3.5 h-3.5" /> Secret Floor (₹)
              </label>
              <input
                type="number"
                step="1"
                required
                value={floorPriceRupees}
                onChange={(e) => setFloorPriceRupees(e.target.value)}
                placeholder="1499"
                className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-md text-xs sm:text-sm text-figma-ink focus:outline-none focus:border-black font-mono transition font-bold"
              />
              <p className="text-[10px] text-figma-ink/80 mt-1 font-mono font-bold uppercase">100% private. Never sold below.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-figma-ink mb-1.5 uppercase font-mono tracking-wider">
              Search Keywords & Discovery Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. wireless, anc, bluetooth, earbuds, audio, noise cancellation"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-black/15 rounded-md text-xs sm:text-sm text-figma-ink focus:outline-none focus:border-black transition font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Helps AI match shopper questions (comma-separated)</p>
          </div>

          <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-6 bg-white hover:bg-zinc-100 text-figma-ink rounded-full text-xs sm:text-sm font-medium transition border border-black order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto h-11 px-7 bg-figma-primary hover:opacity-90 text-figma-onPrimary rounded-full text-xs sm:text-sm font-medium transition shadow-xs order-1 sm:order-2"
            >
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



