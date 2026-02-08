// @ts-ignore
import React, { useState } from 'react';
import { createProduct, deleteProduct, updateProduct } from '@/lib/supabase/products';
import { uploadProductImage } from '@/lib/supabase/storage';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Loader2, Upload, X, Image } from 'lucide-react';

const categories = [
  { value: 'plants', label: 'Растения' },
  { value: 'china', label: 'Товары из Китая' },
  { value: 'personal', label: 'Личные вещи' }
];

const conditions = [
  { value: 'new', label: 'Новый' },
  { value: 'like_new', label: 'Как новый' },
  { value: 'good', label: 'Хорошее' },
  { value: 'fair', label: 'Удовлетворительное' }
];

const emptyProduct = {
  title: '',
  description: '',
  price: '',
  old_price: '',
  category: 'plants',
  subcategory: '',
  images: [],
  in_stock: true,
  featured: false,
  condition: 'new',
  tags: []
};

export default function ProductManager({ products }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      ...product,
      price: product.price?.toString() || '',
      old_price: product.old_price?.toString() || '',
      tags: product.tags || []
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditProduct(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const input = e.target;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newImages = [];

    try {
      for (const file of files) {
        try {
          const publicUrl = await uploadProductImage(file);
          newImages.push(publicUrl);
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
    } finally {
      setUploading(false);
      input.value = '';
    }

    setForm(f => ({ ...f, images: [...(f.images || []), ...newImages] }));
  };

  const removeImage = (index) => {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const handleSave = async () => {
    setSaving(true);

    const data = {
      ...form,
      price: parseFloat(form.price) || 0,
      old_price: form.old_price ? parseFloat(form.old_price) : null
    };

    if (editProduct) {
      await updateProduct(editProduct.id, data);
    } else {
      await createProduct(data);
    }

    queryClient.invalidateQueries({ queryKey: ['products'] });
    setDialogOpen(false);
    setForm(emptyProduct);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить товар?')) {
      await deleteProduct(id);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Товары ({products.length})</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </DialogTrigger>
          <
// @ts-ignore
          DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <
// @ts-ignore
            DialogHeader>
              <
// @ts-ignore
              DialogTitle>{editProduct ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Название *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Цена *</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Старая цена (для скидки)</Label>
                  <Input
                    type="number"
                    value={form.old_price}
                    onChange={(e) => setForm(f => ({ ...f, old_price: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Категория</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Подкатегория</Label>
                  <Input
                    value={form.subcategory}
                    onChange={(e) => setForm(f => ({ ...f, subcategory: e.target.value }))}
                    className="mt-1"
                    placeholder="Например: Комнатные"
                  />
                </div>
              </div>

              <div>
                <Label>Состояние</Label>
                <Select value={form.condition} onValueChange={(v) => setForm(f => ({ ...f, condition: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Images */}
              <div>
                <Label>Фотографии</Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {form.images?.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Теги</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Добавить тег"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    // @ts-ignore
                    checked={form.in_stock}
                    onCheckedChange={(v) => setForm(f => ({ ...f, in_stock: v }))}
                  />
                  <Label>В наличии</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    // @ts-ignore
                    checked={form.featured}
                    onCheckedChange={(v) => setForm(f => ({ ...f, featured: v }))}
                  />
                  <Label>Рекомендуемый</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !form.title || !form.price}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск товаров..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16">Фото</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">
                    {product.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories.find(c => c.value === product.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {product.price?.toLocaleString()} ₽
                  </TableCell>
                  <TableCell>
                    <Badge className={product.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                      {product.in_stock ? 'В наличии' : 'Нет'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(product)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)} className="text-rose-500 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
