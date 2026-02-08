import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Checkout() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    notes: ''
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      ...form,
      items: cart.map(item => ({
        product_id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      total,
      status: 'pending'
    };

    await base44.entities.Order.create(orderData);
    
    localStorage.removeItem('cart');
    setCart([]);
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-md w-full shadow-lg"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Заказ оформлен!</h1>
          <p className="text-slate-600 mb-8">
            Спасибо за заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              На главную
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Корзина пуста</h1>
          <p className="text-slate-600 mb-6">Добавьте товары для оформления заказа</p>
          <Link to={createPageUrl('Catalog')}>
            <Button>Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          to={createPageUrl('Catalog')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Продолжить покупки
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">Оформление заказа</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Контактные данные</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    required
                    value={form.customer_name}
                    onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    className="mt-1"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    value={form.customer_phone}
                    onChange={(e) => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                    className="mt-1"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm(f => ({ ...f, customer_email: e.target.value }))}
                  className="mt-1"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Адрес доставки *</Label>
                <Textarea
                  id="address"
                  required
                  value={form.delivery_address}
                  onChange={(e) => setForm(f => ({ ...f, delivery_address: e.target.value }))}
                  className="mt-1"
                  placeholder="Город, улица, дом, квартира"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Комментарий к заказу</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="mt-1"
                  placeholder="Дополнительная информация"
                  rows={2}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Оформляем...
                  </>
                ) : (
                  <>Подтвердить заказ • {total.toLocaleString()} ₽</>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Ваш заказ</h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.quantity} × {item.price.toLocaleString()} ₽</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Товары ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span className="font-medium">{total.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Доставка</span>
                  <span className="text-emerald-600 font-medium">Обсуждается</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">Итого</span>
                  <span className="text-xl font-bold text-slate-900">{total.toLocaleString()} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
