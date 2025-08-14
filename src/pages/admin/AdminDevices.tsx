
import DeviceList from '@/components/DeviceList';

const AdminDevices = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Device Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all registered Game Guardian devices
        </p>
      </div>
      <DeviceList />
    </div>
  );
};

export default AdminDevices;
