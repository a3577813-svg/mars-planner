export const PLANNER_STORAGE_EVENT="mars-planner-storage-changed";

export type PlannerStorageChange={
  key:string;
};

export function readJson<T>(key:string,fallback:T):T{
  if(typeof window==="undefined")return fallback;
  try{
    const raw=localStorage.getItem(key);
    if(!raw)return fallback;
    const parsed=JSON.parse(raw) as T;
    return parsed??fallback;
  }catch{return fallback}
}

export function writeJson<T>(key:string,value:T):void{
  if(typeof window==="undefined")return;
  localStorage.setItem(key,JSON.stringify(value));
  window.dispatchEvent(new CustomEvent<PlannerStorageChange>(PLANNER_STORAGE_EVENT,{detail:{key}}));
}

export function removeStoredValue(key:string):void{
  if(typeof window==="undefined")return;
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent<PlannerStorageChange>(PLANNER_STORAGE_EVENT,{detail:{key}}));
}

export function subscribeToStoredKey(key:string,listener:()=>void):()=>void{
  if(typeof window==="undefined")return()=>{};
  const onStorage=(event:StorageEvent)=>{if(event.key===key)listener()};
  const onCustom=(event:Event)=>{
    const detail=(event as CustomEvent<PlannerStorageChange>).detail;
    if(detail?.key===key)listener();
  };
  window.addEventListener("storage",onStorage);
  window.addEventListener(PLANNER_STORAGE_EVENT,onCustom);
  return()=>{
    window.removeEventListener("storage",onStorage);
    window.removeEventListener(PLANNER_STORAGE_EVENT,onCustom);
  };
}
