import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ActivationComplete() {
  const nav = useNavigate();
  
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("device_id") || "";
    nav(`/activate?device_id=${encodeURIComponent(code)}`, { replace: true });
  }, [nav]);
  
  return null;
}