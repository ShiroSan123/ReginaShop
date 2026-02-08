import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShoppingBag, Package, DollarSign, Users, LogOut, Loader2 } from 'lucide-react';
import ProductManager from '@/components/admin/ProductManager';
import OrderManager from '@/components/admin/OrderManager';
import { listOrders } from '@/lib/supabase/orders';
import { listProducts } from '@/lib/supabase/products';
import { createSettings, getSettings, updateSettings } from '@/lib/supabase/settings';

export default function Admin() {
  const adminLogin = import.meta.env.VITE_ADMIN_LOGIN || 'admin';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
  const isDefaultAdmin = !import.meta.env.VITE_ADMIN_LOGIN || !import.meta.env.VITE_ADMIN_PASSWORD;
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => listProducts('-created_date'),
    enabled: isAuthenticated
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => listOrders('-created_date'),
    enabled: isAuthenticated
  });

  useEffect(() => {
    const saved = sessionStorage.getItem('adminAuth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (login === adminLogin && password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setLogin('');
    setPassword('');
    navigate(createPageUrl('Home'));
  };

  // Stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Админ-панель</h1>
            <p className="text-slate-500 mt-2">Введите пароль для входа</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="mt-1"
                placeholder="admin"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="••••••••"
              />
              {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
              Войти
            </Button>
          </form>

          {isDefaultAdmin && (
            <p className="text-center text-slate-400 text-sm mt-6">
              Логин/пароль по умолчанию: admin
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Админ-панель</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-slate-600">
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Товаров</p>
                  <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Заказов</p>
                  <p className="text-2xl font-bold text-slate-800">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ожидают</p>
                  <p className="text-2xl font-bold text-slate-800">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Выручка</p>
                  <p className="text-2xl font-bold text-slate-800">{totalRevenue.toLocaleString()} ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Товары
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Заказы
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManager products={products} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManager orders={orders} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManager settings={settings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SettingsManager({ settings }) {
  const queryClient = useQueryClient();
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
  const [form, setForm] = useState({
    shop_name: settings?.shop_name || '',
    contact_phone: settings?.contact_phone || '',
    contact_email: settings?.contact_email || '',
    telegram: settings?.telegram || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = { ...form };

    if (settings?.id) {
      await updateSettings(settings.id, data);
    } else {
      await createSettings({ ...data, admin_password: adminPassword });
    }

    queryClient.invalidateQueries({ queryKey: ['settings'] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки магазина</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6 max-w-xl">
          <div>
            <Label>Название магазина</Label>
            <Input
              value={form.shop_name}
              onChange={(e) => setForm(f => ({ ...f, shop_name: e.target.value }))}
              className="mt-1"
              placeholder="GreenShop"
            />
          </div>

          <div>
            <Label>Контактный телефон</Label>
            <Input
              value={form.contact_phone}
              onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
              className="mt-1"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))}
              className="mt-1"
              placeholder="shop@example.com"
            />
          </div>

          <div>
            <Label>Telegram</Label>
            <Input
              value={form.telegram}
              onChange={(e) => setForm(f => ({ ...f, telegram: e.target.value }))}
              className="mt-1"
              placeholder="@username"
            />
          </div>

          <Button type="submit" disabled={saving} className="bg-emerald-500 hover:bg-emerald-600">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saved ? 'Сохранено!' : 'Сохранить'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
