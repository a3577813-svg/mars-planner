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
      `SELECT student_id,planner_type
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

    const accessResult=await db.query(
      `SELECT allowed_pages,updated_at
       FROM student_planner_access
       WHERE student_id=$1
       LIMIT 1`,
      [studentId]
    );

    const row=accessResult.rows[0];

    return NextResponse.json({
      ok:true,
      studentId:student.student_id,
      plannerType:student.planner_type,
      allowedPages:row?.allowed_pages ?? null,
      inheritedAll:!row
    });
  }catch(error){
    console.error("Admin student access GET error:",error);
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

    const {studentId,allowedPages}=await request.json();

    if(typeof studentId!=="string"||!Array.isArray(allowedPages)){
      return NextResponse.json(
        {ok:false,error:"Неверный запрос"},
        {status:400}
      );
    }

    const studentIdClean=studentId.trim();

    const userResult=await db.query(
      `SELECT student_id,planner_type
       FROM users
       WHERE student_id=$1
       LIMIT 1`,
      [studentIdClean]
    );

    const student=userResult.rows[0];

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Ученик не найден"},
        {status:404}
      );
    }

    const maxPage=student.planner_type==="senior"?45:38;

    const pages=Array.from(new Set(
      allowedPages
        .map((value:any)=>Number(value))
        .filter((value:number)=>Number.isInteger(value)&&value>=1&&value<=maxPage)
    )).sort((a,b)=>a-b);

    await db.query(
      `INSERT INTO student_planner_access (student_id,allowed_pages,updated_at)
       VALUES ($1,$2,NOW())
       ON CONFLICT (student_id)
       DO UPDATE SET
         allowed_pages=EXCLUDED.allowed_pages,
         updated_at=NOW()`,
      [studentIdClean,pages]
    );

    return NextResponse.json({
      ok:true,
      studentId:studentIdClean,
      allowedPages:pages
    });
  }catch(error){
    console.error("Admin student access PUT error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
