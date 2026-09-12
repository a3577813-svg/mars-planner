import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentAdmin} from "../../../lib/admin-session";

export async function GET(request:Request){
  try{
    const admin=await getCurrentAdmin();

    if(!admin){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация администратора"},
        {status:401}
      );
    }

    const {searchParams}=new URL(request.url);
    const studentId=searchParams.get("id")?.trim();

    if(!studentId){
      return NextResponse.json(
        {ok:false,error:"Не указан ID ученика"},
        {status:400}
      );
    }

    const userResult=await db.query(
      `SELECT student_id,planner_type,is_active,created_at
       FROM users
       WHERE student_id=$1
       LIMIT 1`,
      [studentId]
    );

    const student=userResult.rows[0];

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Ученик не найден"},
        {status:404}
      );
    }

    const entriesResult=await db.query(
      `SELECT field_key,value,updated_at
       FROM planner_entries
       WHERE student_id=$1 AND planner_type=$2
       ORDER BY field_key`,
      [student.student_id,student.planner_type]
    );

    return NextResponse.json({
      ok:true,
      student,
      entries:entriesResult.rows
    });
  }catch(error){
    console.error("Admin student GET error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
