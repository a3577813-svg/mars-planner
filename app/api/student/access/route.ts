import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStudent} from "../../../lib/session";

export async function GET(){
  try{
    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация"},
        {status:401}
      );
    }

    const result=await db.query(
      `SELECT spa.allowed_pages, u.display_name
       FROM users u
       LEFT JOIN student_planner_access spa ON spa.student_id=u.student_id
       WHERE u.student_id=$1
       LIMIT 1`,
      [student.student_id]
    );

    const row=result.rows[0];
    const maxPage=student.planner_type==="senior"?45:38;

    return NextResponse.json({
      ok:true,
      studentId:student.student_id,
      displayName:row?.display_name || null,
      plannerType:student.planner_type,
      allowedPages:row?.allowed_pages ?? Array.from(
        {length:maxPage},
        (_,i)=>i+1
      )
    });
  }catch(error){
    console.error("Student access GET error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
