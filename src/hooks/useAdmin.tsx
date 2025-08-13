import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isAdmin = profile?.is_admin || false;
  const loading = authLoading || profileLoading;

  return {
    isAdmin,
    loading,
    user,
  };
};