import {NextResponse} from "next/server";
import {db} from "../../lib/db";
import {getCurrentStudent} from "../../lib/session";

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
      `SELECT field_key,value,updated_at
       FROM planner_entries
       WHERE student_id=$1 AND planner_type=$2
       ORDER BY field_key`,
      [student.student_id,student.planner_type]
    );

    return NextResponse.json({
      ok:true,
      studentId:student.student_id,
      plannerType:student.planner_type,
      entries:result.rows
    });
  }catch(error){
    console.error("Planner GET error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}

export async function PUT(request:Request){
  try{
    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация"},
        {status:401}
      );
    }

    const {fieldKey,value}=await request.json();

    if(typeof fieldKey!=="string"||typeof value!=="string"||!fieldKey){
      return NextResponse.json(
        {ok:false,error:"Некорректные данные"},
        {status:400}
      );
    }

    await db.query(
      `INSERT INTO planner_entries
       (student_id,planner_type,field_key,value,updated_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (student_id,planner_type,field_key)
       DO UPDATE SET
         value=EXCLUDED.value,
         updated_at=NOW()`,
      [student.student_id,student.planner_type,fieldKey,value]
    );

    return NextResponse.json({ok:true});
  }catch(error){
    console.error("Planner PUT error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
