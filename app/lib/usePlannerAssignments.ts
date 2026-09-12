"use client";

import {useCallback,useEffect,useState} from "react";
import {
  SpreadAssignment,
  SpreadAssignmentStore,
  assignmentFor,
  assignmentKey,
  emptySpreadAssignment
} from "./plannerAssignments";
import type {PlannerAudience} from "./plannerAssignments";

type AssignmentUpdater=
  |SpreadAssignmentStore
  |((current:SpreadAssignmentStore)=>SpreadAssignmentStore);

export function usePlannerAssignments(enabled=true){
  const[assignments,setAssignmentsState]=useState<SpreadAssignmentStore>({});
  const[ready,setReady]=useState(false);

  const loadAssignments=useCallback(async()=>{if(!enabled)return;
    try{
      const audiences:PlannerAudience[]=["middle","senior"];

      const responses=await Promise.all(
        audiences.map(async audience=>{
          const response=await fetch(
            `/api/spread-assignments?audience=${audience}`,
            {cache:"no-store"}
          );

          const data=await response.json();

          if(!response.ok||!data?.ok||!Array.isArray(data.assignments)){
            return[];
          }

          return data.assignments.map((item:any)=>({
            key:assignmentKey(audience,Number(item.page)),
            assignment:{
              week:item.week||"",
              start:item.start||"",
              end:item.end||"",
              visible:item.visible!==false
            } as SpreadAssignment
          }));
        })
      );

      const next:SpreadAssignmentStore={};

      for(const group of responses){
        for(const item of group){
          next[item.key]=item.assignment;
        }
      }

      setAssignmentsState(next);
    }catch(error){
      console.error("Failed to load spread assignments",error);
    }finally{
      setReady(true);
    }
  },[enabled]);

  useEffect(()=>{
    loadAssignments();
  },[loadAssignments]);

  const setAssignments=useCallback((updater:AssignmentUpdater)=>{
    setAssignmentsState(current=>
      typeof updater==="function"?updater(current):updater
    );
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

  const resetAssignment=useCallback((
    audience:PlannerAudience,
    page:number
  )=>{
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
