import { useMemo } from "react";
import MapHeat from "../../../components/MapHeat";
import { generateMockData } from "../../../data/mockOta";

export default function OtaReports(){
  const { devices, alerts, geojson } = useMemo(()=>generateMockData("GB-DEMO-SEED-001", 420, 1600),[]);
  const byCountry = useMemo(()=>{ const m:Record<string,number>={}; devices.forEach(d=>{m[d.country]=(m[d.country]||0)+1}); return Object.entries(m); },[devices]);
  const byCity = useMemo(()=>{ const m:Record<string,number>={}; devices.forEach(d=>{m[d.city]=(m[d.city]||0)+1}); return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10); },[devices]);
  const versionDist = useMemo(()=>{ const m:Record<string,number>={}; devices.forEach(d=>{m[d.version]=(m[d.version]||0)+1}); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[devices]);
  const alerts24h = useMemo(()=>{ const since=Date.now()-24*60*60*1000; return alerts.filter(a=>new Date(a.tsISO).getTime()>=since).length; },[alerts]);

  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-3 gap-4">
        <Kpi title="Total devices" value={devices.length}/>
        <Kpi title="Active now (10m)" value={approxActive(devices)}/>
        <Kpi title="Alerts (24h)" value={alerts24h}/>
      </section>
      <section className="grid lg:grid-cols-3 gap-6">
        <Card title="Devices by country"><SimpleList rows={byCountry} suffix="devices"/></Card>
        <Card title="Top towns/cities"><SimpleList rows={byCity} suffix="devices"/></Card>
        <Card title="Version distribution"><SimpleList rows={versionDist} suffix="devices"/></Card>
      </section>
      <section className="space-y-3">
        <h2 className="font-medium text-lg">Alert heat & categories map</h2>
        <MapHeat geojson={geojson}/>
        <p className="text-xs text-muted-foreground">Demo uses coarse UK city jitter; all data is anonymous and synthetic.</p>
      </section>
    </div>
  );
}

function Kpi({title,value}:{title:string;value:number|string}){ return (
  <div className="border border-border rounded p-4"><div className="text-sm text-muted-foreground">{title}</div><div className="text-2xl font-semibold">{value}</div></div>
); }
function Card({title,children}:{title:string;children:React.ReactNode}){ return (
  <div className="border border-border rounded p-4"><h2 className="font-medium mb-3">{title}</h2>{children}</div>
); }
function SimpleList({rows,suffix}:{rows:[string,number][],suffix?:string}){ return (
  <ul className="text-sm space-y-2">{rows.map(([k,v])=> (<li key={k} className="flex justify-between"><span>{k}</span><span>{v}{suffix?" "+suffix:""}</span></li>))}</ul>
); }

type D={lastSeenISO:string}; function approxActive(devs:D[]){ const ten=Date.now()-10*60*1000; return devs.filter(d=>new Date(d.lastSeenISO).getTime()>=ten).length; }
