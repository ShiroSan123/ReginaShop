import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ cart, setCart, isOpen, setIsOpen }) {
  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const removeItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 transition-colors">
          <ShoppingBag className="w-5 h-5 text-slate-700" />
          {itemsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {itemsCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className={undefined}>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Корзина ({itemsCount})
          </SheetTitle>
        </SheetHeader>
        
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Корзина пуста</h3>
            <p className="text-slate-500 text-sm mb-6">Добавьте товары для оформления заказа</p>
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Продолжить покупки
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {item.images?.[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-slate-200" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 text-sm line-clamp-2 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-emerald-600 font-semibold">
                        {item.price.toLocaleString()} ₽
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Итого:</span>
                <span className="text-2xl font-bold text-slate-900">
                  {total.toLocaleString()} ₽
                </span>
              </div>
              
              <Link 
                to={createPageUrl('Checkout')} 
                onClick={() => setIsOpen(false)}
                className="block"
              >
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-base font-medium">
                  Оформить заказ
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
