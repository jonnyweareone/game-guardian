import { PolicyProfiles } from '@/components/network/PolicyProfiles';
import SEOHead from '@/components/SEOHead';

const NetworkProfiles = () => {
  return (
    <>
      <SEOHead 
        title="Network Policies | Guardian AI"
        description="Manage network security policy profiles"
      />
      <div className="container mx-auto px-4 py-8">
        <PolicyProfiles />
      </div>
    </>
  );
};

export default NetworkProfiles;