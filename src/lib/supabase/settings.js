import { getSupabaseClient, getSupabaseClientOrNull, isSupabaseConfigured } from './client';

const getClientOrNull = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return getSupabaseClientOrNull();
};

export const getSettings = async () => {
  const supabase = getClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase.from('settings').select('*').limit(1);
  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] || null;
};

export const createSettings = async (payload) => {
  const supabase = getSupabaseClient();
  const insertPayload = {
    admin_password: payload.admin_password,
    shop_name: payload.shop_name || '',
    contact_phone: payload.contact_phone || '',
    contact_email: payload.contact_email || '',
    telegram: payload.telegram || '',
  };

  const { data, error } = await supabase
    .from('settings')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateSettings = async (id, payload) => {
  const supabase = getSupabaseClient();
  const updatePayload = {
    ...(payload.shop_name !== undefined ? { shop_name: payload.shop_name } : {}),
    ...(payload.contact_phone !== undefined
      ? { contact_phone: payload.contact_phone }
      : {}),
    ...(payload.contact_email !== undefined
      ? { contact_email: payload.contact_email }
      : {}),
    ...(payload.telegram !== undefined ? { telegram: payload.telegram } : {}),
    ...(payload.admin_password !== undefined
      ? { admin_password: payload.admin_password }
      : {}),
  };

  const { data, error } = await supabase
    .from('settings')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
