// @ts-ignore
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { X, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const categories = [
  { value: 'plants', label: '🌿 Растения' },
  { value: 'china', label: '🇨🇳 Товары из Китая' },
  { value: 'personal', label: '👜 Личные вещи' }
];

const conditions = [
  { value: 'new', label: 'Новый' },
  { value: 'like_new', label: 'Как новый' },
  { value: 'good', label: 'Хорошее состояние' },
  { value: 'fair', label: 'Удовлетворительное' }
];

const subcategories = {
  plants: ['Комнатные', 'Садовые', 'Суккуленты', 'Кактусы', 'Семена', 'Удобрения'],
  china: ['Электроника', 'Одежда', 'Аксессуары', 'Для дома', 'Гаджеты', 'Инструменты'],
  personal: ['Одежда', 'Обувь', 'Техника', 'Книги', 'Мебель', 'Прочее']
};

function FilterContent({ filters, setFilters, maxPrice, onReset }) {
  const handleCategoryChange = (category) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories, subcategories: [] };
    });
  };

  const handleSubcategoryChange = (subcategory) => {
    setFilters(prev => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategory)
        ? prev.subcategories.filter(s => s !== subcategory)
        : [...prev.subcategories, subcategory]
    }));
  };

  const handleConditionChange = (condition) => {
    setFilters(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const availableSubcategories = filters.categories.length > 0
    ? [...new Set(filters.categories.flatMap(cat => subcategories[cat] || []))]
    : [];

  return (
    <div className="space-y-6">
      {/* Категории */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Категория</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox 
                // @ts-ignore
                checked={filters.categories.includes(cat.value)}
                onCheckedChange={() => handleCategoryChange(cat.value)}
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Подкатегории */}
      {availableSubcategories.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">Подкатегория</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableSubcategories.map(sub => (
              <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox 
                  // @ts-ignore
                  checked={filters.subcategories.includes(sub)}
                  onCheckedChange={() => handleSubcategoryChange(sub)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  {sub}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Цена */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Цена</h3>
        <div className="px-2">
          <Slider
            // @ts-ignore
            value={[filters.priceRange[0], filters.priceRange[1]]}
            max={maxPrice}
            step={100}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-slate-500">
            <span>{filters.priceRange[0].toLocaleString()} ₽</span>
            <span>{filters.priceRange[1].toLocaleString()} ₽</span>
          </div>
        </div>
      </div>

      {/* Состояние */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Состояние</h3>
        <div className="space-y-2">
          {conditions.map(cond => (
            <label key={cond.value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox 
                // @ts-ignore
                checked={filters.conditions.includes(cond.value)}
                onCheckedChange={() => handleConditionChange(cond.value)}
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                {cond.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Наличие */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox 
            // @ts-ignore
            checked={filters.inStockOnly}
            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStockOnly: checked }))}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            Только в наличии
          </span>
        </label>
      </div>

      <Button 
        variant="outline" 
        onClick={onReset}
        className="w-full"
      >
        <X className="w-4 h-4 mr-2" />
        Сбросить фильтры
      </Button>
    </div>
  );
}

export default function FilterSidebar({ filters, setFilters, maxPrice, onReset }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Фильтры
          </h2>
          <FilterContent 
            filters={filters} 
            setFilters={setFilters} 
            maxPrice={maxPrice} 
            onReset={onReset} 
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader className={undefined}>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Фильтры
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent 
                filters={filters} 
                setFilters={setFilters} 
                maxPrice={maxPrice} 
                onReset={onReset} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}