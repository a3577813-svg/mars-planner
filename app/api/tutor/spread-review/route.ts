import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStaff} from "../../../lib/staff-session";
import {getCurrentStudent} from "../../../lib/session";

function validPage(value:number,plannerType:string){
 const total=plannerType==="middle"?38:45;
 return Number.isInteger(value)&&value>=1&&value<=total;
}

export async function GET(request:Request){
 try{
  const url=new URL(request.url);
  const page=Number(url.searchParams.get("page")||"0");
  const requestedStudent=String(url.searchParams.get("student")||"").trim();

  const staff=await getCurrentStaff();
  if(staff){
   if(staff.role!=="teacher"&&staff.role!=="methodist"){
    return NextResponse.json({ok:false,error:"Недостаточно прав"},{status:403});
   }
   if(!requestedStudent){
    return NextResponse.json({ok:false,error:"Не указан ID ученика"},{status:400});
   }

   const assignmentResult=await db.query(
    "SELECT 1 FROM staff_student_assignments WHERE staff_id=$1 AND student_id=$2 LIMIT 1",
    [staff.id,requestedStudent]
   );
   if(!assignmentResult.rows[0]){
    return NextResponse.json({ok:false,error:"Ученик не назначен этому сотруднику"},{status:403});
   }

   const userResult=await db.query(
    "SELECT student_id,planner_type FROM users WHERE student_id=$1 AND is_active=TRUE LIMIT 1",
    [requestedStudent]
   );
   const student=userResult.rows[0];
   if(!student)return NextResponse.json({ok:false,error:"Ученик не найден"},{status:404});
   if(!validPage(page,student.planner_type)){
    return NextResponse.json({ok:false,error:"Некорректный номер разворота"},{status:400});
   }

   const result=staff.role==="methodist"
    ?await db.query(
      `SELECT r.status,r.comment,r.updated_at,su.login AS author
       FROM tutor_spread_reviews r
       JOIN staff_users su ON su.id=r.staff_id
       WHERE r.student_id=$1 AND r.planner_type=$2 AND r.page=$3
       ORDER BY r.updated_at DESC`,
      [student.student_id,student.planner_type,page]
     )
    :await db.query(
      `SELECT status,comment,updated_at
       FROM tutor_spread_reviews
       WHERE student_id=$1 AND staff_id=$2 AND planner_type=$3 AND page=$4
       LIMIT 1`,
      [student.student_id,staff.id,student.planner_type,page]
     );

   return NextResponse.json({
    ok:true,
    plannerType:student.planner_type,
    page,
    review:staff.role==="teacher"?(result.rows[0]||null):null,
    reviews:staff.role==="methodist"?result.rows.map(row=>({
     status:row.status||"",
     comment:row.comment||"",
     updatedAt:row.updated_at||null,
     author:row.author||"Тьютор"
    })):[]
   });
  }

  const student=await getCurrentStudent();
  if(!student)return NextResponse.json({ok:false,error:"Не авторизован"},{status:401});
  if(!validPage(page,student.planner_type)){
   return NextResponse.json({ok:false,error:"Некорректный номер разворота"},{status:400});
  }

  const result=await db.query(
   `SELECT r.status,r.comment,r.updated_at,su.login AS author
    FROM tutor_spread_reviews r
    JOIN staff_users su ON su.id=r.staff_id
    WHERE r.student_id=$1 AND r.planner_type=$2 AND r.page=$3
    ORDER BY r.updated_at DESC`,
   [student.student_id,student.planner_type,page]
  );

  return NextResponse.json({
   ok:true,
   plannerType:student.planner_type,
   page,
   reviews:result.rows.map(row=>({
    status:row.status||"",
    comment:row.comment||"",
    updatedAt:row.updated_at||null,
    author:row.author||"Тьютор"
   }))
  });
 }catch(error){
  console.error("Tutor spread review load error:",error);
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
  const page=Number(body.page||0);
  const status=String(body.status||"").trim();
  const comment=String(body.comment||"").trim();

  if(!studentId)return NextResponse.json({ok:false,error:"Не указан ID ученика"},{status:400});
  if(status&&!["great","revise","talk"].includes(status)){
   return NextResponse.json({ok:false,error:"Некорректный статус"},{status:400});
  }

  const assignmentResult=await db.query(
   "SELECT 1 FROM staff_student_assignments WHERE staff_id=$1 AND student_id=$2 LIMIT 1",
   [staff.id,studentId]
  );
  if(!assignmentResult.rows[0]){
   return NextResponse.json({ok:false,error:"Ученик не назначен этому сотруднику"},{status:403});
  }

  const userResult=await db.query(
   "SELECT student_id,planner_type FROM users WHERE student_id=$1 AND is_active=TRUE LIMIT 1",
   [studentId]
  );
  const student=userResult.rows[0];
  if(!student)return NextResponse.json({ok:false,error:"Ученик не найден"},{status:404});
  if(!validPage(page,student.planner_type)){
   return NextResponse.json({ok:false,error:"Некорректный номер разворота"},{status:400});
  }

  if(!status&&!comment){
   await db.query(
    "DELETE FROM tutor_spread_reviews WHERE student_id=$1 AND staff_id=$2 AND planner_type=$3 AND page=$4",
    [student.student_id,staff.id,student.planner_type,page]
   );
  }else{
   await db.query(
    `INSERT INTO tutor_spread_reviews(student_id,staff_id,planner_type,page,status,comment,updated_at)
     VALUES($1,$2,$3,$4,$5,$6,NOW())
     ON CONFLICT(student_id,staff_id,planner_type,page)
     DO UPDATE SET status=EXCLUDED.status,comment=EXCLUDED.comment,updated_at=NOW()`,
    [student.student_id,staff.id,student.planner_type,page,status,comment]
   );
  }

  return NextResponse.json({ok:true});
 }catch(error){
  console.error("Tutor spread review save error:",error);
  return NextResponse.json({ok:false,error:"Ошибка сервера"},{status:500});
 }
}
