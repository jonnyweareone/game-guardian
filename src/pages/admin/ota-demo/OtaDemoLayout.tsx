import { NavLink, Outlet } from "react-router-dom";

export default function OtaDemoLayout(){
  const tabs=[{to:"/admin/ota-demo",label:"Update Manager"},{to:"/admin/ota-demo/reports",label:"Reports"}];
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">OTA Demo</h1>
      <p className="text-sm text-muted-foreground mb-4">Zero‑touch updates + anonymous telemetry</p>
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex gap-6">
          {tabs.map(t=> (
            <NavLink key={t.to} to={t.to} end className={({isActive})=>`py-3 border-b-2 ${isActive?"border-primary text-foreground":"border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet/>
    </main>
  );
}
