import { ClientsList } from '@/components/network/ClientsList';
import SEOHead from '@/components/SEOHead';

const NetworkClients = () => {
  return (
    <>
      <SEOHead 
        title="Network Clients | Guardian AI"
        description="Manage network clients and device assignments"
      />
      <div className="container mx-auto px-4 py-8">
        <ClientsList />
      </div>
    </>
  );
};

export default NetworkClients;