import { getSupabaseClient, getSupabaseClientOrNull, isSupabaseConfigured } from './client';

const ORDER_FIELD_MAP = {
  created_date: 'created_date',
  price: 'price',
  old_price: 'old_price',
};

const parseOrderBy = (orderBy) => {
  if (!orderBy) {
    return { column: 'created_date', ascending: false };
  }

  const isDesc = orderBy.startsWith('-');
  const rawField = orderBy.replace(/^-/, '');
  const column = ORDER_FIELD_MAP[rawField] || rawField;

  return { column, ascending: !isDesc };
};

const mapDbProduct = (row) => ({
  ...row,
  price: row.price !== null && row.price !== undefined ? Number(row.price) : 0,
  old_price:
    row.old_price !== null && row.old_price !== undefined
      ? Number(row.old_price)
      : null,
  images: Array.isArray(row.images) ? row.images : [],
  tags: Array.isArray(row.tags) ? row.tags : [],
});

const getClientOrNull = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return getSupabaseClientOrNull();
};

export const listProducts = async (orderBy, limit) => {
  const supabase = getClientOrNull();
  if (!supabase) return [];

  let query = supabase.from('products').select('*');
  const { column, ascending } = parseOrderBy(orderBy);
  query = query.order(column, { ascending });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapDbProduct);
};

export const filterProducts = async (filters = {}, orderBy, limit) => {
  const supabase = getClientOrNull();
  if (!supabase) return [];

  let query = supabase.from('products').select('*');

  if (filters.id) {
    query = query.eq('id', filters.id);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  if (filters.in_stock !== undefined) {
    query = query.eq('in_stock', filters.in_stock);
  }

  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
    );
  }

  if (orderBy) {
    const { column, ascending } = parseOrderBy(orderBy);
    query = query.order(column, { ascending });
  }

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapDbProduct);
};

export const createProduct = async (payload) => {
  const supabase = getSupabaseClient();
  const insertPayload = {
    title: payload.title,
    description: payload.description || '',
    price: payload.price ?? 0,
    old_price: payload.old_price ?? null,
    category: payload.category,
    subcategory: payload.subcategory || '',
    images: Array.isArray(payload.images) ? payload.images : [],
    in_stock: Boolean(payload.in_stock),
    featured: Boolean(payload.featured),
    condition: payload.condition || 'new',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
  };

  const { data, error } = await supabase
    .from('products')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbProduct(data);
};

export const updateProduct = async (id, payload) => {
  const supabase = getSupabaseClient();
  const updatePayload = {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
    ...(payload.price !== undefined ? { price: payload.price } : {}),
    ...(payload.old_price !== undefined ? { old_price: payload.old_price } : {}),
    ...(payload.category !== undefined ? { category: payload.category } : {}),
    ...(payload.subcategory !== undefined
      ? { subcategory: payload.subcategory }
      : {}),
    ...(payload.images !== undefined ? { images: payload.images } : {}),
    ...(payload.in_stock !== undefined ? { in_stock: payload.in_stock } : {}),
    ...(payload.featured !== undefined ? { featured: payload.featured } : {}),
    ...(payload.condition !== undefined ? { condition: payload.condition } : {}),
    ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
  };

  const { data, error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapDbProduct(data) : null;
};

export const deleteProduct = async (id) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }

  return true;
};
