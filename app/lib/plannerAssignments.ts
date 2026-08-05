import {readJson,writeJson} from "./plannerStorage";

export type PlannerAudience="middle"|"senior";

export type SpreadAssignment={
  week:string;
  start:string;
  end:string;
  visible:boolean;
};

export type SpreadAssignmentStore=Record<string,SpreadAssignment>;

export const ASSIGNMENTS_STORAGE_KEY="mars-spread-assignments";

export function emptySpreadAssignment():SpreadAssignment{
  return{week:"",start:"",end:"",visible:true};
}

export function assignmentKey(audience:PlannerAudience,page:number):string{
  return`${audience}:${page}`;
}

export function readAssignments():SpreadAssignmentStore{
  const parsed=readJson<SpreadAssignmentStore>(ASSIGNMENTS_STORAGE_KEY,{});
  return parsed&&typeof parsed==="object"?parsed:{};
}

export function saveAssignments(store:SpreadAssignmentStore):void{
  writeJson(ASSIGNMENTS_STORAGE_KEY,store);
}

export function assignmentFor(store:SpreadAssignmentStore,audience:PlannerAudience,page:number):SpreadAssignment{
  return{...emptySpreadAssignment(),...(store[assignmentKey(audience,page)]||{})};
}

function parseAssignmentDate(value:string,end=false):Date|null{
  if(!value)return null;
  const date=new Date(`${value}T${end?"23:59:59":"00:00:00"}`);
  return Number.isNaN(date.getTime())?null:date;
}

export function assignmentState(assignment:SpreadAssignment,today=new Date()):"hidden"|"future"|"current"|"past"|"open"{
  if(!assignment.visible)return"hidden";
  const start=parseAssignmentDate(assignment.start);
  const end=parseAssignmentDate(assignment.end,true);
  if(start&&today<start)return"future";
  if(start&&end&&today>=start&&today<=end)return"current";
  if(end&&today>end)return"past";
  return"open";
}

export function assignmentLabel(assignment:SpreadAssignment,today=new Date()):string{
  const state=assignmentState(assignment,today);
  const week=assignment.week.trim();
  if(state==="hidden")return"Скрыт";
  if(state==="future")return week?`${week} · откроется позже`:"Откроется позже";
  if(state==="current")return week?`${week} · на этой неделе`:"На этой неделе";
  if(state==="past")return week?`${week} · уже доступен`:"Уже доступен";
  return week||"Доступен";
}
