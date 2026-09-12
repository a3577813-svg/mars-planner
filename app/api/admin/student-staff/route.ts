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

    const studentResult=await db.query(
      `SELECT student_id
       FROM users
       WHERE student_id=$1
       LIMIT 1`,
      [studentId]
    );

    if(!studentResult.rows[0]){
      return NextResponse.json(
        {ok:false,error:"Ученик не найден"},
        {status:404}
      );
    }

    const staffResult=await db.query(
      `SELECT
         su.id,
         su.login,
         su.role,
         EXISTS(
           SELECT 1
           FROM staff_student_assignments ssa
           WHERE ssa.staff_id=su.id
             AND ssa.student_id=$1
         ) AS assigned
       FROM staff_users su
       WHERE su.is_active=TRUE
       ORDER BY su.role,su.login`,
      [studentId]
    );

    return NextResponse.json({
      ok:true,
      staff:staffResult.rows
    });
  }catch(error){
    console.error("Admin student staff GET error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}

export async function PUT(request:Request){
  try{
    const admin=await getCurrentAdmin();

    if(!admin){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация администратора"},
        {status:401}
      );
    }

    const body=await request.json();
    const studentId=String(body?.studentId||"").trim();
    const staffIds=Array.isArray(body?.staffIds)
      ?body.staffIds.map(Number).filter((id:number)=>Number.isInteger(id)&&id>0)
      :[];

    if(!studentId){
      return NextResponse.json(
        {ok:false,error:"Не указан ID ученика"},
        {status:400}
      );
    }

    const studentResult=await db.query(
      `SELECT student_id
       FROM users
       WHERE student_id=$1
       LIMIT 1`,
      [studentId]
    );

    if(!studentResult.rows[0]){
      return NextResponse.json(
        {ok:false,error:"Ученик не найден"},
        {status:404}
      );
    }

    const client=await db.connect();

    try{
      await client.query("BEGIN");

      await client.query(
        "DELETE FROM staff_student_assignments WHERE student_id=$1",
        [studentId]
      );

      for(const staffId of staffIds){
        await client.query(
          `INSERT INTO staff_student_assignments (staff_id,student_id)
           SELECT id,$2
           FROM staff_users
           WHERE id=$1 AND is_active=TRUE
           ON CONFLICT DO NOTHING`,
          [staffId,studentId]
        );
      }

      await client.query("COMMIT");
    }catch(error){
      await client.query("ROLLBACK");
      throw error;
    }finally{
      client.release();
    }

    return NextResponse.json({
      ok:true,
      studentId,
      staffIds
    });
  }catch(error){
    console.error("Admin student staff PUT error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
