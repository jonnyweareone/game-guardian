import { useState } from "react";

type Rollout={id:string;name:string;version:string;status:"scheduled"|"running"|"paused"|"completed";startAt:string;channel:"stable"|"beta"|"canary";};

export default function OtaUpdateManager(){
  const [file,setFile]=useState<File|null>(null);
  const [version,setVersion]=useState("1.1.0");
  const [channel,setChannel]=useState<"stable"|"beta"|"canary">("canary");
  const [startAt,setStartAt]=useState<string>(new Date(Date.now()+3600_000).toISOString().slice(0,16));
  const [rollouts,setRollouts]=useState<Rollout[]>([{id:"r-001",name:"1.1.0 UK canary",version:"1.1.0",status:"running",startAt:"2025-08-11T09:00",channel:"canary"}]);

  function createRollout(){ if(!file) return alert("Choose a package file first");
    const r:Rollout={id:crypto.randomUUID(),name:`${version} ${channel}`,version,status:"scheduled",startAt,channel};
    setRollouts([r,...rollouts]); /* TODO wire to API */ }
  function action(id:string,next:Rollout["status"]){ setRollouts(rs=>rs.map(r=>r.id===id?{...r,status:next}:r)); /* TODO API */ }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border border-border rounded p-4">
          <h2 className="font-medium mb-3">Upload update package</h2>
          <input type="file" onChange={e=>setFile(e.target.files?.[0]??null)} />
          <div className="mt-3 grid gap-3">
            <label className="block">
              <span className="text-sm text-muted-foreground">Version</span>
              <input className="mt-1 input" value={version} onChange={e=>setVersion(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm text-muted-foreground">Channel</span>
              <select className="mt-1 select" value={channel} onChange={e=>setChannel(e.target.value as any)}>
                <option value="canary">canary</option>
                <option value="beta">beta</option>
                <option value="stable">stable</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-muted-foreground">Start time</span>
              <input type="datetime-local" className="mt-1 input" value={startAt} onChange={e=>setStartAt(e.target.value)} />
            </label>
            <button className="btn-primary mt-2" onClick={createRollout}>Create rollout</button>
          </div>
        </div>
        <div className="border border-border rounded p-4">
          <h2 className="font-medium mb-3">Strategy (demo)</h2>
          <ul className="text-sm list-disc ml-5 space-y-1 text-muted-foreground">
            <li>Progressive: 1% → 10% → 50% → 100%</li>
            <li>Filters: Country=GB, City ∈ {`{Gosport, Portsmouth}`}</li>
            <li>Block if failure rate ≥ 5%</li>
          </ul>
        </div>
      </section>
      <section className="border border-border rounded p-4">
        <h2 className="font-medium mb-3">Rollouts</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Start</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rollouts.map(r=> (
                <tr key={r.id} className="border-b border-border">
                  <td className="py-2 pr-4">{r.name}</td>
                  <td className="py-2 pr-4">{r.version}</td>
                  <td className="py-2 pr-4">{r.channel}</td>
                  <td className="py-2 pr-4">{r.startAt.replace("T"," ")}</td>
                  <td className="py-2 pr-4 capitalize">{r.status}</td>
                  <td className="py-2 pr-4 space-x-2">
                    <button className="btn" onClick={()=>action(r.id,"running")}>Start</button>
                    <button className="btn" onClick={()=>action(r.id,"paused")}>Pause</button>
                    <button className="btn" onClick={()=>action(r.id,"completed")}>Complete</button>
                    <button className="btn-danger" onClick={()=>alert("Rollback demo")}>Rollback</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
