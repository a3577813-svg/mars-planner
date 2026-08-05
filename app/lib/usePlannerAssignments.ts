"use client";

import {useCallback,useEffect,useState} from "react";
import {
  ASSIGNMENTS_STORAGE_KEY,
  SpreadAssignmentStore,
  readAssignments,
  saveAssignments
} from "./plannerAssignments";

export function usePlannerAssignments(){
  const[assignments,setAssignmentsState]=useState<SpreadAssignmentStore>({});

  useEffect(()=>{
    setAssignmentsState(readAssignments());
    const sync=(event:StorageEvent)=>{
      if(event.key===ASSIGNMENTS_STORAGE_KEY)setAssignmentsState(readAssignments());
    };
    window.addEventListener("storage",sync);
    return()=>window.removeEventListener("storage",sync);
  },[]);

  const setAssignments=useCallback((next:SpreadAssignmentStore)=>{
    setAssignmentsState(next);
    saveAssignments(next);
    window.dispatchEvent(new CustomEvent("mars-assignments-changed"));
  },[]);

  useEffect(()=>{
    const sync=()=>setAssignmentsState(readAssignments());
    window.addEventListener("mars-assignments-changed",sync);
    return()=>window.removeEventListener("mars-assignments-changed",sync);
  },[]);

  return{assignments,setAssignments};
}
