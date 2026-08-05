"use client";

const PATCH_FLAG="__marsSeniorStoragePatched__";

type PatchedWindow=Window&{[PATCH_FLAG]?:boolean};

function shouldUseSeniorNamespace(){
  if(typeof window==="undefined")return false;
  const params=new URLSearchParams(window.location.search);
  return params.get("senior")==="1"&&window.location.pathname.startsWith("/book");
}

function mapKey(key:string){
  if(!shouldUseSeniorNamespace())return key;
  if(key==="mars-book-current-page")return key;
  if(key.startsWith("mars-book-"))return key.replace(/^mars-book-/,"mars-senior-shared-");
  return key;
}

if(typeof window!=="undefined"){
  const patchedWindow=window as PatchedWindow;
  if(!patchedWindow[PATCH_FLAG]){
    patchedWindow[PATCH_FLAG]=true;
    const proto=Storage.prototype;
    const originalGet=proto.getItem;
    const originalSet=proto.setItem;
    const originalRemove=proto.removeItem;

    proto.getItem=function(key:string){return originalGet.call(this,mapKey(String(key)))};
    proto.setItem=function(key:string,value:string){return originalSet.call(this,mapKey(String(key)),String(value))};
    proto.removeItem=function(key:string){return originalRemove.call(this,mapKey(String(key)))};
  }
}

export default function SeniorStorageNamespace(){return null;}
