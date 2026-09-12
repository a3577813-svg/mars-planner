import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStaff} from "../../../lib/staff-session";

export async function GET(request:Request){
 try{
 const staff=await getCurrentStaff();
 if(!staff)return NextResponse.json({ok:false,error:"Не авторизован"},{status:401});
 const studentId=new URL(request.url).searchParams.get("student")?.trim();
 if(!studentId)return NextResponse.json({ok:false,error:"Не указан ID ученика"},{status:400});
 const assignmentResult=await db.query(
  "SELECT 1 FROM staff_student_assignments WHERE staff_id=$1 AND student_id=$2 LIMIT 1",
  [staff.id,studentId]
 );
 if(!assignmentResult.rows[0])return NextResponse.json({ok:false,error:"Ученик не назначен этому сотруднику"},{status:403});
 const userResult=await db.query("SELECT student_id,planner_type FROM users WHERE student_id=$1 AND is_active=TRUE LIMIT 1",[studentId]);
 const student=userResult.rows[0];
 if(!student)return NextResponse.json({ok:false,error:"Ученик не найден"},{status:404});
 const entriesResult=await db.query("SELECT field_key,value FROM planner_entries WHERE student_id=$1 AND planner_type=$2",[student.student_id,student.planner_type]);
 const attachmentsResult=await db.query("SELECT attachment_key FROM planner_attachments WHERE student_id=$1 AND planner_type=$2 AND image_data IS NOT NULL",[student.student_id,student.planner_type]);
 const commentResult=staff.role==="methodist"
 ?await db.query(
   "SELECT tc.comment,tc.updated_at,su.login FROM tutor_comments tc LEFT JOIN staff_users su ON su.id=tc.staff_id WHERE tc.student_id=$1 AND su.role='teacher' ORDER BY tc.updated_at DESC",
   [student.student_id]
  )
 :await db.query(
   "SELECT comment,updated_at FROM tutor_comments WHERE student_id=$1 AND staff_id=$2 LIMIT 1",
   [student.student_id,staff.id]
  );
 const total=student.planner_type==="middle"?38:45;
 const perPage=new Map<number,{count:number;substantial:number}>();
 for(const row of entriesResult.rows){
 const value=(row.value||"").trim();
 if(!value)continue;
 const match=student.planner_type==="middle"?row.field_key.match(/^mars-book-p([0-9]+)-/):row.field_key.match(/^mars-senior-(?:shared-)?p([0-9]+)-/);
 const page=Number(match?.[1]||0);
 if(!page||page>total)continue;
 const item=perPage.get(page)||{count:0,substantial:0};
 item.count++;if(value.length>=18)item.substantial++;perPage.set(page,item);
 }
 const statuses=Array.from({length:total},(_,i)=>{const item=perPage.get(i+1);return !item?"empty":item.count>=3||item.substantial>=2?"done":"progress";});
 const comments=staff.role==="methodist"
 ?commentResult.rows.map(row=>({
   comment:row.comment||"",
   author:row.login||"Тьютор",
   updatedAt:row.updated_at||null
  }))
 :[];

 return NextResponse.json({
  ok:true,
  student:{
   id:student.student_id,
   plannerType:student.planner_type,
   total,
   statuses,
   attachments:attachmentsResult.rows.map(r=>r.attachment_key),
   comment:staff.role==="teacher"?(commentResult.rows[0]?.comment||""):"",
   comments
  }
 });
 }catch(error){
 console.error("Staff student error:",error);
 return NextResponse.json({ok:false,error:"Ошибка сервера"},{status:500});
 }
}

export async function PUT(request:Request){
try{
const staff=await getCurrentStaff();
if(!staff)return NextResponse.json({ok:false,error:"Не авторизован"},{status:401});
if(staff.role!=="teacher")return NextResponse.json({ok:false,error:"Недостаточно прав"},{status:403});

const body=await request.json();
const studentId=String(body.student||"").trim();
const comment=String(body.comment||"");

if(!studentId)return NextResponse.json({ok:false,error:"Не указан ID ученика"},{status:400});

const assignmentResult=await db.query(
"SELECT 1 FROM staff_student_assignments WHERE staff_id=$1 AND student_id=$2 LIMIT 1",
[staff.id,studentId]
);

if(!assignmentResult.rows[0])return NextResponse.json({ok:false,error:"Ученик не назначен этому сотруднику"},{status:403});

const userResult=await db.query(
"SELECT student_id FROM users WHERE student_id=$1 AND is_active=TRUE LIMIT 1",
[studentId]
);

if(!userResult.rows[0])return NextResponse.json({ok:false,error:"Ученик не найден"},{status:404});

await db.query(
"INSERT INTO tutor_comments(student_id,staff_id,comment,updated_at) VALUES($1,$2,$3,NOW()) ON CONFLICT(student_id,staff_id) DO UPDATE SET comment=EXCLUDED.comment,updated_at=NOW()",
[studentId,staff.id,comment]
);

return NextResponse.json({ok:true});
}catch(error){
console.error("Staff student comment save error:",error);
return NextResponse.json({ok:false,error:"Ошибка сервера"},{status:500});
}
}
