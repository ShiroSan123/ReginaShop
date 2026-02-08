import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryLabels = {
  plants: 'Растения',
  china: 'Из Китая',
  personal: 'Личные вещи'
};

const conditionLabels = {
  new: 'Новый',
  like_new: 'Как новый',
  good: 'Хорошее',
  fair: 'Удовл.'
};

export default function ProductCard({ product, onAddToCart, onToggleFavorite, isFavorite }) {
  const discount = product.old_price 
    ? Math.round((1 - product.price / product.old_price) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
    >
      <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          {product.images?.[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300" />
            </div>
          )}
          
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-rose-500 text-white border-0 px-2.5 py-1 text-xs font-semibold">
              -{discount}%
            </Badge>
          )}
          
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium bg-black/70 px-4 py-2 rounded-full text-sm">
                Нет в наличии
              </span>
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(product.id);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 ${
              isFavorite 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/90 text-slate-600 hover:bg-rose-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>
      
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-medium">
            {categoryLabels[product.category]}
          </Badge>
          {product.condition !== 'new' && (
            <Badge variant="outline" className="text-[10px] font-medium">
              {conditionLabels[product.condition]}
            </Badge>
          )}
        </div>
        
        <Link to={createPageUrl('ProductDetail') + `?id=${product.id}`}>
          <h3 className="font-medium text-sm sm:text-base text-slate-800 mb-2 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] hover:text-emerald-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-end justify-between">
          <div>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {product.price.toLocaleString()} ₽
            </span>
            {product.old_price && (
              <span className="ml-2 text-xs sm:text-sm text-slate-400 line-through">
                {product.old_price.toLocaleString()} ₽
              </span>
            )}
          </div>
          
          <button
            onClick={() => onAddToCart?.(product)}
            disabled={!product.in_stock}
            className="p-2 sm:p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
