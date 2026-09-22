export type PlannerEntry={field_key:string;value:string;updated_at?:string};
export type PageStatus="empty"|"progress"|"done";

export function getSeniorPageStatuses(entries:PlannerEntry[]):Record<number,PageStatus>{
 const perPage=new Map<number,{count:number;substantial:number}>();
 for(const entry of entries){
  const value=(entry.value||"").trim();
  if(!value)continue;
  let page=0;
  const seniorMatch=entry.field_key.match(/^mars-senior-(?:shared-)?p([0-9]+)-/);
  const sharedMatch=entry.field_key.match(/^mars-book-p([0-9]+)-/);
  if(seniorMatch){page=Number(seniorMatch[1]);}
  else if(sharedMatch){
   const physicalPage=Number(sharedMatch[1]);
   page=physicalPage===37?44:physicalPage===38?45:physicalPage;
  }
  if(!page||page>45)continue;
  const item=perPage.get(page)||{count:0,substantial:0};
  item.count++;
  if(value.length>=18)item.substantial++;
  perPage.set(page,item);
 }
 const result:Record<number,PageStatus>={};
 for(let page=1;page<=45;page++){
  const item=perPage.get(page);
  result[page]=!item?"empty":item.count>=3||item.substantial>=2?"done":"progress";
 }
 return result;
}
