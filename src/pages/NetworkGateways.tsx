import { GatewaysList } from '@/components/network/GatewaysList';
import SEOHead from '@/components/SEOHead';

const NetworkGateways = () => {
  return (
    <>
      <SEOHead 
        title="Network Gateways | Guardian AI"
        description="Manage your network gateways and monitor connection status"
      />
      <div className="container mx-auto px-4 py-8">
        <GatewaysList />
      </div>
    </>
  );
};

export default NetworkGateways;