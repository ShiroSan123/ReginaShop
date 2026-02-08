import { supabase } from '@/lib/supabaseClient';

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.'
    );
  }
  return supabase;
};

const parseOrder = (orderBy) => {
  if (typeof orderBy !== 'string') {
    return null;
  }
  const trimmed = orderBy.trim();
  if (!trimmed) {
    return null;
  }
  const isDesc = trimmed.startsWith('-');
  return { column: isDesc ? trimmed.slice(1) : trimmed, ascending: !isDesc };
};

const createEntityClient = (tableName) => ({
  list: async (orderBy, limit) => {
    const client = ensureSupabase();
    let query = client.from(tableName).select('*');
    const order = parseOrder(orderBy);
    if (order) {
      query = query.order(order.column, { ascending: order.ascending });
    }
    if (typeof limit === 'number') {
      query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
  filter: async (filters = {}) => {
    const client = ensureSupabase();
    let query = client.from(tableName).select('*');
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload) => {
    const client = ensureSupabase();
    const { data, error } = await client
      .from(tableName)
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const client = ensureSupabase();
    const { data, error } = await client
      .from(tableName)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const client = ensureSupabase();
    const { error } = await client.from(tableName).delete().eq('id', id);
    if (error) throw error;
  },
});

export const base44 = {
  entities: {
    Product: createEntityClient('products'),
    Order: createEntityClient('orders'),
    Settings: createEntityClient('settings'),
  },
  auth: {
    me: async () => {
      throw new Error('Base44 auth is disabled. Use Supabase auth if needed.');
    },
    logout: () => {},
    redirectToLogin: () => {},
  },
  appLogs: {
    logUserInApp: async () => {},
  },
};
