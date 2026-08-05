"use client";

import {useCallback,useEffect,useState} from "react";
import {
  ASSIGNMENTS_STORAGE_KEY,
  SpreadAssignment,
  SpreadAssignmentStore,
  assignmentFor,
  assignmentKey,
  emptySpreadAssignment,
  readAssignments,
  saveAssignments
} from "./plannerAssignments";
import type {PlannerAudience} from "./plannerAssignments";

type AssignmentUpdater=
  |SpreadAssignmentStore
  |((current:SpreadAssignmentStore)=>SpreadAssignmentStore);

function publishAssignments(store:SpreadAssignmentStore){
  saveAssignments(store);
  window.dispatchEvent(new CustomEvent("mars-assignments-changed"));
}

export function usePlannerAssignments(){
  const[assignments,setAssignmentsState]=useState<SpreadAssignmentStore>({});
  const[ready,setReady]=useState(false);

  const syncFromStorage=useCallback(()=>{
    setAssignmentsState(readAssignments());
    setReady(true);
  },[]);

  useEffect(()=>{
    syncFromStorage();
    const onStorage=(event:StorageEvent)=>{
      if(event.key===ASSIGNMENTS_STORAGE_KEY)syncFromStorage();
    };
    window.addEventListener("storage",onStorage);
    window.addEventListener("mars-assignments-changed",syncFromStorage);
    return()=>{
      window.removeEventListener("storage",onStorage);
      window.removeEventListener("mars-assignments-changed",syncFromStorage);
    };
  },[syncFromStorage]);

  const setAssignments=useCallback((updater:AssignmentUpdater)=>{
    setAssignmentsState(current=>{
      const next=typeof updater==="function"?updater(current):updater;
      publishAssignments(next);
      return next;
    });
  },[]);

  const updateAssignment=useCallback((
    audience:PlannerAudience,
    page:number,
    patch:Partial<SpreadAssignment>
  )=>{
    setAssignments(current=>{
      const key=assignmentKey(audience,page);
      const previous=assignmentFor(current,audience,page);
      return{
        ...current,
        [key]:{
          ...emptySpreadAssignment(),
          ...previous,
          ...patch
        }
      };
    });
  },[setAssignments]);

  const resetAssignment=useCallback((audience:PlannerAudience,page:number)=>{
    setAssignments(current=>{
      const next={...current};
      delete next[assignmentKey(audience,page)];
      return next;
    });
  },[setAssignments]);

  return{
    assignments,
    ready,
    setAssignments,
    updateAssignment,
    resetAssignment
  };
}
