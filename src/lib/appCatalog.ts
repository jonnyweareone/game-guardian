import { supabase } from "@/integrations/supabase/client";

export interface AppCatalogItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon_url?: string;
  website?: string;
  publisher?: string;
  version?: string;
  platform?: string;
  pegi_rating?: number;
  pegi_descriptors?: string[];
  age_min: number;
  age_max: number;
  is_essential: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getAppCatalog = async (): Promise<AppCatalogItem[]> => {
  const { data, error } = await supabase
    .from('app_catalog')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data as AppCatalogItem[];
};

export const getAppsByCategory = async (category: string): Promise<AppCatalogItem[]> => {
  const { data, error } = await supabase
    .from('app_catalog')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data as AppCatalogItem[];
};

export const getAppsForAge = async (age: number): Promise<AppCatalogItem[]> => {
  const { data, error } = await supabase
    .from('app_catalog')
    .select('*')
    .eq('is_active', true)
    .lte('age_min', age)
    .gte('age_max', age)
    .order('name');
  
  if (error) throw error;
  return data as AppCatalogItem[];
};

export const getAppCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('app_catalog')
    .select('category')
    .eq('is_active', true)
    .order('category');
  
  if (error) throw error;
  
  const uniqueCategories = [...new Set(data.map(item => item.category))];
  return uniqueCategories;
};