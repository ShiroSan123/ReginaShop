import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, LayoutGrid, List } from 'lucide-react';
import Header from '@/components/shop/Header';
import ProductCard from '@/components/shop/ProductCard';
import FilterSidebar from '@/components/shop/FilterSidebar';

const sortOptions = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'popular', label: 'Популярные' }
];

export default function Catalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    categories: categoryParam ? [categoryParam] : [],
    subcategories: [],
    conditions: [],
    priceRange: [0, 100000],
    inStockOnly: false
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (categoryParam && !filters.categories.includes(categoryParam)) {
      setFilters(prev => ({ ...prev, categories: [categoryParam] }));
    }
  }, [categoryParam]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30
  });

  const maxPrice = useMemo(() => 
    Math.max(...products.map(p => p.price || 0), 100000),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    // Category
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }

    // Subcategory
    if (filters.subcategories.length > 0) {
      result = result.filter(p => filters.subcategories.includes(p.subcategory));
    }

    // Condition
    if (filters.conditions.length > 0) {
      result = result.filter(p => filters.conditions.includes(p.condition));
    }

    // Price
    result = result.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // In stock
    if (filters.inStockOnly) {
      result = result.filter(p => p.in_stock);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, filters, sortBy]);

  const resetFilters = () => {
    setFilters({
      categories: [],
      subcategories: [],
      conditions: [],
      priceRange: [0, maxPrice],
      inStockOnly: false
    });
    setSearchQuery('');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const categoryLabels = {
    plants: 'Растения',
    china: 'Товары из Китая',
    personal: 'Личные вещи'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        cart={cart} 
        setCart={setCart} 
        favorites={favorites}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {filters.categories.length === 1 
              ? categoryLabels[filters.categories[0]] 
              : 'Каталог'
            }
          </h1>
          <p className="text-slate-500 mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 'товаров'}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar 
            filters={filters}
            setFilters={setFilters}
            maxPrice={maxPrice}
            onReset={resetFilters}
          />

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 lg:hidden">
                <FilterSidebar 
                  filters={filters}
                  setFilters={setFilters}
                  maxPrice={maxPrice}
                  onReset={resetFilters}
                />
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-slate-50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <p className="text-slate-500 text-lg mb-4">Товары не найдены</p>
                <button 
                  onClick={resetFilters}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.includes(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}