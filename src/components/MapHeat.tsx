import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_COLORS, Category } from "../data/mockOta";

type Props = { geojson: GeoJSON.FeatureCollection; initialBounds?: [number,number,number,number]; };

export default function MapHeat({ geojson, initialBounds }: Props) {
  const mapRef = useRef<Map|null>(null);
  const containerRef = useRef<HTMLDivElement|null>(null);
  const [ready, setReady] = useState(false);
  const [enabledCats, setEnabledCats] = useState<Record<Category,boolean>>({bullying:true,grooming:true,profanity:true,hate_speech:true,self_harm:true,suspicious_contact:true});

  const filtered = useMemo<GeoJSON.FeatureCollection>(()=>({
    type:"FeatureCollection",
    features:geojson.features.filter(f=>enabledCats[(f.properties as any).category as Category])
  }),[geojson,enabledCats]);

  useEffect(()=>{
    if(!containerRef.current || mapRef.current) return;
    const map=new maplibregl.Map({
      container:containerRef.current,
      style:"https://demotiles.maplibre.org/style.json",
      center:[-3.5,54.5],
      zoom:5.1
    });
    mapRef.current=map;

    map.on("load",()=>{
      map.addSource("alerts",{type:"geojson",data:filtered});
      map.addLayer({id:"alerts-heat",type:"heatmap",source:"alerts",maxzoom:12,paint:{
        "heatmap-weight":["interpolate",["linear"],["get","severity_idx"],0,0.4,2,1],
        "heatmap-intensity":["interpolate",["linear"],["zoom"],5,0.6,12,2],
        "heatmap-radius":["interpolate",["linear"],["zoom"],5,10,12,35],
        "heatmap-opacity":["interpolate",["linear"],["zoom"],5,0.85,12,0.4],
        "heatmap-color":["interpolate",["linear"],["heatmap-density"],0,"rgba(0,0,0,0)",0.2,"rgba(33,102,172,0.3)",0.4,"rgba(103,169,207,0.5)",0.6,"rgba(209,229,240,0.7)",0.8,"rgba(253,219,199,0.8)",1,"rgba(239,138,98,0.9)"]
      }});
      map.addLayer({id:"alerts-points",type:"circle",source:"alerts",minzoom:4,paint:{
        "circle-radius":["interpolate",["linear"],["zoom"],4,2,7,5,10,9,13,14],
        "circle-opacity":0.8,
        "circle-color":["match",["get","category"],
          "bullying",CATEGORY_COLORS.bullying,
          "grooming",CATEGORY_COLORS.grooming,
          "profanity",CATEGORY_COLORS.profanity,
          "hate_speech",CATEGORY_COLORS.hate_speech,
          "self_harm",CATEGORY_COLORS.self_harm,
          "suspicious_contact",CATEGORY_COLORS.suspicious_contact,
          "hsl(220 13% 18%)"
        ],
        "circle-stroke-color":"hsl(0 0% 100%)","circle-stroke-width":0.5
      }});
      setReady(true);
      if(initialBounds) map.fitBounds(initialBounds,{padding:40,duration:0});
    });

    return ()=>{ map.remove(); mapRef.current=null; };
  },[]);

  useEffect(()=>{
    const map=mapRef.current; if(!map||!ready) return;
    const annotated: GeoJSON.FeatureCollection = {type:"FeatureCollection",features:filtered.features.map(f=>({
      ...f,
      properties:{...f.properties,severity_idx:(f.properties as any).severity==="high"?2:(f.properties as any).severity==="medium"?1:0}
    }))};
    (map.getSource("alerts") as any).setData(annotated);
  },[filtered,ready]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[540px] w-full rounded border border-border" />
      <div className="absolute top-3 left-3 bg-card/90 backdrop-blur rounded shadow p-3 text-sm border border-border">
        <div className="font-medium mb-2">Categories</div>
        <div className="grid grid-cols-2 gap-2">
          {(["bullying","grooming","profanity","hate_speech","self_harm","suspicious_contact"] as Category[]).map(cat=> (
            <label key={cat} className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enabledCats[cat]} onChange={e=>setEnabledCats(s=>({...s,[cat]:e.target.checked}))}/>
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded" style={{background:(CATEGORY_COLORS as any)[cat]}}/>
                {cat.replace("_"," ")}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Heat = density; points = category colour</div>
      </div>
    </div>
  );
}
