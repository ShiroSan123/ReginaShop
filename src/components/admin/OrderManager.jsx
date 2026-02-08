import React, { useState } from 'react';
import { deleteOrder, updateOrder } from '@/lib/supabase/orders';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, Phone, Mail, MapPin, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusLabels = {
  pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Подтверждён', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Отправлен', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Доставлен', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменён', color: 'bg-slate-100 text-slate-600' }
};

const statusOptions = [
  { value: 'pending', label: 'Ожидает' },
  { value: 'confirmed', label: 'Подтверждён' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' }
];

export default function OrderManager({ orders }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrder(orderId, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить заказ?')) {
      await deleteOrder(id);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заказы ({orders.length})</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени или телефону..."
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {statusOptions.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Дата</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(order.created_date), 'dd MMM yyyy, HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-slate-500">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.total?.toLocaleString()} ₽
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.status} 
                      onValueChange={(v) => handleStatusChange(order.id, v)}
                    >
                      <SelectTrigger className={`w-36 h-8 text-xs ${statusLabels[order.status]?.color}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(order.id)} className="text-rose-500 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="">
              <DialogTitle>Детали заказа</DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {format(new Date(selectedOrder.created_date), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                  </span>
                  <Badge className={statusLabels[selectedOrder.status]?.color}>
                    {statusLabels[selectedOrder.status]?.label}
                  </Badge>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-slate-800">Покупатель</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${selectedOrder.customer_phone}`} className="hover:text-emerald-600">
                        {selectedOrder.customer_phone}
                      </a>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${selectedOrder.customer_email}`} className="hover:text-emerald-600">
                          {selectedOrder.customer_email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{selectedOrder.delivery_address}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Товары</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.quantity} × {item.price?.toLocaleString()} ₽</p>
                          </div>
                        </div>
                        <span className="font-semibold">
                          {(item.quantity * item.price).toLocaleString()} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Комментарий</h3>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-semibold text-slate-800">Итого</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {selectedOrder.total?.toLocaleString()} ₽
                  </span>
                </div>

                {/* Status Change */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Изменить статус</h3>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(v) => handleStatusChange(selectedOrder.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
