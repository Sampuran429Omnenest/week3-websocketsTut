import { useEffect, useState } from "react";

const STALE_AFTER_MS = 5000;  // 5 seconds without update = stale
const CHECK_MS       = 1000;  // re-check staleness every 1 second

export function useStaleness(receivedAt:number):boolean{
    const [isStale,setIsStale]=useState(false);
    useEffect(()=>{
        const check=()=>setIsStale(Date.now()-receivedAt>STALE_AFTER_MS);
        check();
        const timer=setInterval(check,CHECK_MS);
        return ()=>clearInterval(timer);
    },[receivedAt]);
    return isStale;
}