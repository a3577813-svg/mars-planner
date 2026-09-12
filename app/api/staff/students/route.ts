import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStaff} from "../../../lib/staff-session";

export async function GET(){
try{
const staff=await getCurrentStaff();
 if(!staff){return NextResponse.json({ok:false,error:"Не авторизован"},{status:401});}
 const result=await db.query("SELECT u.student_id,u.planner_type,pe.field_key,pe.value,pa.attachment_key,pa.image_data FROM staff_student_assignments ssa JOIN users u ON u.student_id=ssa.student_id LEFT JOIN planner_entries pe ON pe.student_id=u.student_id AND pe.planner_type=u.planner_type LEFT JOIN planner_attachments pa ON pa.student_id=u.student_id AND pa.planner_type=u.planner_type WHERE ssa.staff_id=$1 AND u.is_active=TRUE ORDER BY u.student_id ASC",[staff.id]);
 const students=new Map<string,{id:string;plannerType:string;entries:Map<string,string>;attachments:Set<string>}>();
 for(const row of result.rows){if(!students.has(row.student_id))students.set(row.student_id,{id:row.student_id,plannerType:row.planner_type,entries:new Map(),attachments:new Set()});}
 for(const row of result.rows){const s=students.get(row.student_id);if(s&&row.field_key&&row.value)s.entries.set(row.field_key,row.value);}
 for(const row of result.rows){const s=students.get(row.student_id);if(s&&row.attachment_key&&row.image_data)s.attachments.add(row.attachment_key);}
 const output=Array.from(students.values()).map(s=>{const total=s.plannerType==="middle"?38:45;const perPage=new Map<number,{count:number;substantial:number}>();for(const [key,valueRaw] of Array.from(s.entries)){const value=(valueRaw||"").trim();if(!value)continue;const match=s.plannerType==="middle"?key.match(/^mars-book-p([0-9]+)-/):key.match(/^mars-senior-(?:shared-)?p([0-9]+)-/);const page=Number(match?.[1]||0);if(!page||page>total)continue;const item=perPage.get(page)||{count:0,substantial:0};item.count++;if(value.length>=18)item.substantial++;perPage.set(page,item);}let started=0,done=0;perPage.forEach(item=>{started++;if(item.count>=3||item.substantial>=2)done++;});return{id:s.id,plannerType:s.plannerType,level:s.plannerType==="middle"?"5–7 уровни":"8–11 уровни",total,started,done,progress:Math.round(done/total*100),attachments:s.attachments.size};});
 return NextResponse.json({ok:true,students:output});

}catch(error){
console.error("Staff students error:",error);
return NextResponse.json({ok:false,error:"Ошибка сервера"},{status:500});
}
}
