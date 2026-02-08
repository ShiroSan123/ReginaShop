import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, Heart, ChevronLeft, Minus, Plus,
  Truck, Shield, ArrowRight, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/shop/Header';
import ProductCard from '@/components/shop/ProductCard';

const categoryLabels = {
  plants: 'Растения',
  china: 'Товары из Китая',
  personal: 'Личные вещи'
};

const conditionLabels = {
  new: 'Новый',
  like_new: 'Как новый',
  good: 'Хорошее состояние',
  fair: 'Удовлетворительное'
};

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const products = await base44.entities.Product.filter({ category: product.category });
      return products.filter(p => p.id !== productId).slice(0, 4);
    },
    enabled: !!product?.category,
    staleTime: 1000 * 60 * 5
  });

  const addToCart = (prod, qty = 1) => {
    const targetProduct = prod || product;
    setCart(prev => {
      const existing = prev.find(item => item.id === targetProduct.id);
      if (existing) {
        return prev.map(item => 
          item.id === targetProduct.id 
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...targetProduct, quantity: qty }];
    });
  };

  const toggleFavorite = (id) => {
    const targetId = id || productId;
    setFavorites(prev => 
      prev.includes(targetId)
        ? prev.filter(fid => fid !== targetId)
        : [...prev, targetId]
    );
  };

  const isFavorite = favorites.includes(productId);
  const discount = product?.old_price 
    ? Math.round((1 - product.price / product.old_price) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header cart={cart} setCart={setCart} favorites={favorites} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header cart={cart} setCart={setCart} favorites={favorites} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Товар не найден</h2>
          <Link to={createPageUrl('Catalog')}>
            <Button>Вернуться в каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header cart={cart} setCart={setCart} favorites={favorites} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link 
          to={createPageUrl('Catalog') + `?category=${product.category}`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {categoryLabels[product.category]}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div 
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              {product.images?.[selectedImage] ? (
                <img 
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <ShoppingBag className="w-20 h-20 text-slate-300" />
                </div>
              )}
            </motion.div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-emerald-500' 
                        : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  {categoryLabels[product.category]}
                </Badge>
                {product.condition !== 'new' && (
                  <Badge variant="outline">
                    {conditionLabels[product.condition]}
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge className="bg-rose-500 text-white border-0">
                    -{discount}%
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {product.price?.toLocaleString()} ₽
                </span>
                {product.old_price && (
                  <span className="text-lg sm:text-xl text-slate-400 line-through">
                    {product.old_price.toLocaleString()} ₽
                  </span>
                )}
              </div>
            </div>

            {/* Stock status */}
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
              product.in_stock 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                product.in_stock ? 'bg-emerald-500' : 'bg-slate-400'
              }`} />
              {product.in_stock ? 'В наличии' : 'Нет в наличии'}
            </div>

            {/* Quantity & Add to cart */}
            {product.in_stock && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-2 w-fit">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button 
                  onClick={() => addToCart(null, quantity)}
                  className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-base font-semibold rounded-xl"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  В корзину
                </Button>

                <Button
                  variant="outline"
                  onClick={() => toggleFavorite()}
                  className={`h-14 w-14 rounded-xl ${
                    isFavorite ? 'bg-rose-50 border-rose-200 text-rose-500' : ''
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                <Truck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Доставка</p>
                  <p className="text-slate-500 text-xs">По всей России</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Гарантия</p>
                  <p className="text-slate-500 text-xs">Качества товара</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t">
                <h3 className="font-semibold text-slate-800 mb-3">Описание</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Похожие товары</h2>
              <Link 
                to={createPageUrl('Catalog') + `?category=${product.category}`}
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                Все товары <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(prod => (
                <ProductCard 
                  key={prod.id}
                  product={prod}
                  onAddToCart={addToCart}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(prod.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
