import { getSupabaseClient, getSupabaseClientOrNull, isSupabaseConfigured } from './client';

const parseOrderBy = (orderBy) => {
  if (!orderBy) {
    return { column: 'created_date', ascending: false };
  }

  const isDesc = orderBy.startsWith('-');
  const rawField = orderBy.replace(/^-/, '');

  return { column: rawField, ascending: !isDesc };
};

const mapDbOrder = (row) => ({
  ...row,
  total: row.total !== null && row.total !== undefined ? Number(row.total) : 0,
  items: Array.isArray(row.items) ? row.items : [],
});

const getClientOrNull = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return getSupabaseClientOrNull();
};

export const listOrders = async (orderBy, limit) => {
  const supabase = getClientOrNull();
  if (!supabase) return [];

  let query = supabase.from('orders').select('*');
  const { column, ascending } = parseOrderBy(orderBy);
  query = query.order(column, { ascending });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapDbOrder);
};

export const createOrder = async (payload) => {
  const supabase = getSupabaseClient();
  const insertPayload = {
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    customer_email: payload.customer_email || null,
    delivery_address: payload.delivery_address,
    notes: payload.notes || '',
    items: Array.isArray(payload.items) ? payload.items : [],
    total: payload.total ?? 0,
    status: payload.status || 'pending',
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbOrder(data);
};

export const updateOrder = async (id, payload) => {
  const supabase = getSupabaseClient();
  const updatePayload = {
    ...(payload.customer_name !== undefined
      ? { customer_name: payload.customer_name }
      : {}),
    ...(payload.customer_phone !== undefined
      ? { customer_phone: payload.customer_phone }
      : {}),
    ...(payload.customer_email !== undefined
      ? { customer_email: payload.customer_email }
      : {}),
    ...(payload.delivery_address !== undefined
      ? { delivery_address: payload.delivery_address }
      : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    ...(payload.items !== undefined ? { items: payload.items } : {}),
    ...(payload.total !== undefined ? { total: payload.total } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
  };

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapDbOrder(data) : null;
};

export const deleteOrder = async (id) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }

  return true;
};
