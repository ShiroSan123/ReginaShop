import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart, ChevronLeft, Loader2 } from 'lucide-react';
import Header from '@/components/shop/Header';
import ProductCard from '@/components/shop/ProductCard';

export default function Favorites() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    staleTime: 1000 * 60 * 5
  });

  const favoriteProducts = useMemo(() => 
    products.filter(p => favorites.includes(p.id)),
    [products, favorites]
  );

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
        <Link 
          to={createPageUrl('Catalog')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          В каталог
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Избранное</h1>
          <span className="text-slate-500">({favoriteProducts.length})</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Список пуст</h2>
            <p className="text-slate-500 mb-6">Добавляйте понравившиеся товары в избранное</p>
            <Link to={createPageUrl('Catalog')}>
              <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                Перейти в каталог
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {favoriteProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleFavorite={toggleFavorite}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}