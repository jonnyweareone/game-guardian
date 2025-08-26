
import ActivationWizard from "@/components/ActivationWizard";

export default function DeviceActivation() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("device_id") || "";
  
  if (!/^GG-[0-9A-F]{4}-[0-9A-F]{4}$/i.test(code)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="container max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Device Code</h1>
          <p className="text-muted-foreground">Please check your device code and try again.</p>
        </div>
      </div>
    );
  }
  
  return <ActivationWizard deviceCode={code} />;
}
