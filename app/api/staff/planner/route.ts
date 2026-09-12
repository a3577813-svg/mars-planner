import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStaff} from "../../../lib/staff-session";

export async function GET(request:Request){
try{
const staff=await getCurrentStaff();

if(!staff){
return NextResponse.json(
{ok:false,error:"Не авторизован"},
{status:401}
);
}

if(staff.role!=="teacher"&&staff.role!=="methodist"){
return NextResponse.json(
{ok:false,error:"Недостаточно прав"},
{status:403}
);
}

const studentId=new URL(request.url).searchParams.get("student")?.trim();

if(!studentId){
return NextResponse.json(
{ok:false,error:"Не указан ID ученика"},
{status:400}
);
}

const assignmentResult=await db.query(
"SELECT 1 FROM staff_student_assignments WHERE staff_id=$1 AND student_id=$2 LIMIT 1",
[staff.id,studentId]
);

if(!assignmentResult.rows[0]){
return NextResponse.json(
{ok:false,error:"Ученик не назначен этому сотруднику"},
{status:403}
);
}

const userResult=await db.query(
"SELECT student_id,planner_type FROM users WHERE student_id=$1 AND is_active=TRUE LIMIT 1",
[studentId]
);

const student=userResult.rows[0];

if(!student){
return NextResponse.json(
{ok:false,error:"Ученик не найден"},
{status:404}
);
}

const result=await db.query(
"SELECT field_key,value,updated_at FROM planner_entries WHERE student_id=$1 AND planner_type=$2 ORDER BY field_key",
[student.student_id,student.planner_type]
);

return NextResponse.json({
ok:true,
studentId:student.student_id,
plannerType:student.planner_type,
entries:result.rows
});
}catch(error){
console.error("Staff planner GET error:",error);

return NextResponse.json(
{ok:false,error:"Ошибка сервера"},
{status:500}
);
}
}
