import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Package, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/shop/Header';
import ProductCard from '@/components/shop/ProductCard';

const categoryCards = [
  { 
    id: 'plants', 
    title: 'Растения', 
    description: 'Комнатные и садовые растения',
    icon: Leaf,
    gradient: 'from-emerald-400 to-green-500',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80'
  },
  { 
    id: 'china', 
    title: 'Из Китая', 
    description: 'Товары с доставкой из Китая',
    icon: Package,
    gradient: 'from-orange-400 to-rose-500',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
  },
  { 
    id: 'personal', 
    title: 'Личные вещи', 
    description: 'Б/у вещи в отличном состоянии',
    icon: Heart,
    gradient: 'from-violet-400 to-purple-500',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'
  }
];

export default function Home() {
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
    queryFn: () => base44.entities.Product.list('-created_date', 100),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30
  });

  const featuredProducts = useMemo(() => 
    products.filter(p => p.featured && p.in_stock).slice(0, 8),
    [products]
  );

  const newProducts = useMemo(() => 
    products.filter(p => p.in_stock).slice(0, 4),
    [products]
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545241047-6083a3684587?w=1200&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-16 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Новая коллекция</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Откройте мир <br />
              <span className="text-emerald-200">уникальных находок</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-emerald-100 mb-8 max-w-xl">
              Растения, товары из Китая и эксклюзивные личные вещи — всё в одном месте
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Catalog')}>
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 h-12 px-8 rounded-xl font-semibold">
                  Смотреть каталог
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Категории</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryCards.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl('Catalog') + `?category=${cat.id}`}>
                <div className="relative group h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden">
                  <img 
                    src={cat.image} 
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-80 group-hover:opacity-90 transition-opacity`} />
                  
                  <div className="relative h-full flex flex-col justify-end p-6 text-white">
                    <cat.icon className="w-10 h-10 mb-3" />
                    <h3 className="text-2xl font-bold mb-1">{cat.title}</h3>
                    <p className="text-white/80 text-sm">{cat.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Рекомендуем</h2>
            </div>
            <Link to={createPageUrl('Catalog')} className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              Все товары <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-violet-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Новинки</h2>
            </div>
            <Link to={createPageUrl('Catalog')} className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              Все товары <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl">GreenShop</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-6 text-slate-400">
              <Link to={createPageUrl('Catalog')} className="hover:text-white transition-colors">Каталог</Link>
              <Link to={createPageUrl('Admin')} className="hover:text-white transition-colors">Админ</Link>
            </nav>
            
            <p className="text-slate-500 text-sm">© 2024 GreenShop</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
