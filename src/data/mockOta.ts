function xmur3(str: string) { let h=1779033703^str.length; for (let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19;} return ()=>{h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return (h^h>>>16)>>>0;};}
function mulberry32(a: number) { return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,1|t); t^=t+Math.imul(t^t>>>7,61|t); return ((t^t>>>14)>>>0)/4294967296; }; }
export type Category="bullying"|"grooming"|"profanity"|"hate_speech"|"self_harm"|"suspicious_contact";
export const CATEGORY_COLORS: Record<Category,string> = { bullying:"#ef4444", grooming:"#a855f7", profanity:"#f59e0b", hate_speech:"#3b82f6", self_harm:"#10b981", suspicious_contact:"#e11d48" };
export const UK_PLACES=[{city:"London",country:"GB",lat:51.5074,lon:-0.1278},{city:"Birmingham",country:"GB",lat:52.4862,lon:-1.8904},{city:"Manchester",country:"GB",lat:53.4808,lon:-2.2426},{city:"Leeds",country:"GB",lat:53.8008,lon:-1.5491},{city:"Liverpool",country:"GB",lat:53.4084,lon:-2.9916},{city:"Newcastle",country:"GB",lat:54.9783,lon:-1.6174},{city:"Sheffield",country:"GB",lat:53.3811,lon:-1.4701},{city:"Bristol",country:"GB",lat:51.4545,lon:-2.5879},{city:"Nottingham",country:"GB",lat:52.9548,lon:-1.1581},{city:"Leicester",country:"GB",lat:52.6369,lon:-1.1398},{city:"Portsmouth",country:"GB",lat:50.8198,lon:-1.0880},{city:"Southampton",country:"GB",lat:50.9097,lon:-1.4044},{city:"Brighton",country:"GB",lat:50.8225,lon:-0.1372},{city:"Plymouth",country:"GB",lat:50.3755,lon:-4.1427},{city:"Exeter",country:"GB",lat:50.7184,lon:-3.5339},{city:"Cardiff",country:"GB",lat:51.4816,lon:-3.1791},{city:"Swansea",country:"GB",lat:51.6214,lon:-3.9436},{city:"Edinburgh",country:"GB",lat:55.9533,lon:-3.1883},{city:"Glasgow",country:"GB",lat:55.8642,lon:-4.2518},{city:"Aberdeen",country:"GB",lat:57.1497,lon:-2.0943},{city:"Dundee",country:"GB",lat:56.4620,lon:-2.9707},{city:"Belfast",country:"GB",lat:54.5973,lon:-5.9301},{city:"Derry",country:"GB",lat:54.9970,lon:-7.3090},{city:"York",country:"GB",lat:53.9590,lon:-1.0815},{city:"Cambridge",country:"GB",lat:52.2053,lon:0.1218},{city:"Oxford",country:"GB",lat:51.7520,lon:-1.2577},{city:"Norwich",country:"GB",lat:52.6309,lon:1.2974},{city:"Gosport",country:"GB",lat:50.7945,lon:-1.1290}];
export type Device={device_id:string;country:string;city:string;lat:number;lon:number;version:string;lastSeenISO:string;};
export type Alert={device_id:string;category:Category;severity:"low"|"medium"|"high";tsISO:string;country:string;city:string;lat:number;lon:number;};
export function generateMockData(seed="OTA-DEMO", nDevices=420, nAlerts=1600){
  const rng=mulberry32(xmur3(seed)()); const versions=["1.0.3","1.0.8","1.1.0"]; const devices:Device[]=[];
  for(let i=0;i<nDevices;i++){ const p=UK_PLACES[Math.floor(rng()*UK_PLACES.length)];
    const jLat=p.lat+(rng()-0.5)*0.04, jLon=p.lon+(rng()-0.5)*0.06;
    const version=versions[Math.floor(Math.pow(rng(),0.7)*versions.length)];
    const lastSeen=new Date(Date.now()-Math.floor(rng()*30)*60_000).toISOString();
    devices.push({device_id:`GG-${(i+1).toString().padStart(4,"0")}-${Math.floor(rng()*9000+1000)}`,country:p.country,city:p.city,lat:jLat,lon:jLon,version,lastSeenISO:lastSeen});
  }
  const cats:Category[]=["bullying","grooming","profanity","hate_speech","self_harm","suspicious_contact"]; const alerts:Alert[]=[];
  for(let i=0;i<nAlerts;i++){ const d=devices[Math.floor(rng()*devices.length)];
    const cat=cats[Math.floor(rng()*cats.length)]; const sev=rng()<0.15?"high":rng()<0.5?"medium":"low";
    const t=new Date(Date.now()-Math.floor(rng()*72)*60*60*1000).toISOString();
    alerts.push({device_id:d.device_id,category:cat,severity:sev,tsISO:t,country:d.country,city:d.city,lat:d.lat,lon:d.lon});
  }
  const features=alerts.map(a=>({type:"Feature" as const,properties:{device_id:a.device_id,category:a.category,severity:a.severity,city:a.city},geometry:{type:"Point" as const,coordinates:[a.lon,a.lat]}}));
  return { devices, alerts, geojson:{type:"FeatureCollection" as const, features} };
}
