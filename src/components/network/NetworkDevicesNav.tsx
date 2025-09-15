import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavLink } from 'react-router-dom';
import { Router, Wifi, Shield, Activity } from 'lucide-react';

export const NetworkDevicesNav = () => {
  const [hasEntitlement, setHasEntitlement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEntitlement = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: entitlements } = await supabase
          .from('entitlements')
          .select('*')
          .eq('parent_id', user.id)
          .limit(1);

        setHasEntitlement(entitlements && entitlements.length > 0);
      } catch (error) {
        console.error('Error checking entitlements:', error);
      } finally {
        setLoading(false);
      }
    };

    checkEntitlement();
  }, []);

  // Don't render if no entitlement or still loading
  if (loading || !hasEntitlement) {
    return null;
  }

  const navItems = [
    {
      to: '/network/gateways',
      icon: Router,
      label: 'Gateways',
      description: 'Manage network gateways'
    },
    {
      to: '/network/clients', 
      icon: Wifi,
      label: 'Clients',
      description: 'Connected devices'
    },
    {
      to: '/network/profiles',
      icon: Shield,
      label: 'Policies',
      description: 'Network security profiles'
    },
    {
      to: '/network/activity',
      icon: Activity,
      label: 'Activity',
      description: 'Network activity and logs'
    }
  ];

  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Network & Devices
        </h2>
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`
          }
        >
          <item.icon className="mr-3 h-4 w-4" />
          <div>
            <div>{item.label}</div>
            <div className="text-xs opacity-70">{item.description}</div>
          </div>
        </NavLink>
      ))}
    </div>
  );
};