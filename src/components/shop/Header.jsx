import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Heart, Menu, Leaf } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartDrawer from './CartDrawer';

const navLinks = [
  { label: 'Главная', page: 'Home' },
  { label: 'Каталог', page: 'Catalog' },
  { label: 'Растения', page: 'Catalog', params: '?category=plants' },
  { label: 'Из Китая', page: 'Catalog', params: '?category=china' },
  { label: 'Личные вещи', page: 'Catalog', params: '?category=personal' }
];

export default function Header({ cart, setCart, favorites, searchQuery, setSearchQuery }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 hidden sm:block">GreenShop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx}
                to={createPageUrl(link.page) + (link.params || '')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 border-0 h-11 rounded-xl focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 transition-colors">
                  <Search className="w-5 h-5 text-slate-700" />
                </button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <div className="py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-50 border-0 h-12 rounded-xl"
                      autoFocus
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Favorites */}
            <Link 
              to={createPageUrl('Favorites')}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 transition-colors"
            >
              <Heart className="w-5 h-5 text-slate-700" />
              {favorites?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <CartDrawer 
              cart={cart} 
              setCart={setCart} 
              isOpen={cartOpen}
              setIsOpen={setCartOpen}
            />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 transition-colors">
                  <Menu className="w-5 h-5 text-slate-700" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link, idx) => (
                    <Link 
                      key={idx}
                      to={createPageUrl(link.page) + (link.params || '')}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-4" />
                  <Link 
                    to={createPageUrl('Admin')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors font-medium"
                  >
                    Админ-панель
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
