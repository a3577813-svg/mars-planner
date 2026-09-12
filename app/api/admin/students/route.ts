import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {db} from "../../../lib/db";
import {getCurrentAdmin} from "../../../lib/admin-session";

export async function GET(){
  try{
    const admin=await getCurrentAdmin();
    if(!admin){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация администратора"},
        {status:401}
      );
    }

    const result=await db.query(`
      SELECT
        u.student_id,
        u.planner_type,
        u.is_active,
        u.created_at,
        MAX(p.updated_at) AS last_activity,
        COUNT(p.id)::int AS entries_count,
        s.status AS submission_status,
        s.submitted_at,
        s.pdf_path
      FROM users u
      LEFT JOIN planner_entries p
        ON p.student_id=u.student_id
       AND p.planner_type=u.planner_type
      LEFT JOIN planner_submissions s
        ON s.student_id=u.student_id
       AND s.planner_type=u.planner_type
      GROUP BY
        u.student_id,
        u.planner_type,
        u.is_active,
        u.created_at,
        s.status,
        s.submitted_at,
        s.pdf_path
      ORDER BY
        u.created_at DESC
    `);

    return NextResponse.json({
      ok:true,
      students:result.rows
    });
  }catch(error){
    console.error("Admin students GET error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}

export async function POST(request:Request){
  try{
    const admin=await getCurrentAdmin();

    if(!admin){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация администратора"},
        {status:401}
      );
    }

    const {studentId,password,plannerType}=await request.json();

    if(
      typeof studentId!=="string"||
      typeof password!=="string"||
      (plannerType!=="middle"&&plannerType!=="senior")
    ){
      return NextResponse.json(
        {ok:false,error:"Неверный запрос"},
        {status:400}
      );
    }

    const studentIdClean=studentId.trim();

    if(studentIdClean.length<3||studentIdClean.length>50){
      return NextResponse.json(
        {ok:false,error:"ID должен содержать от 3 до 50 символов"},
        {status:400}
      );
    }

    if(password.length<8){
      return NextResponse.json(
        {ok:false,error:"Пароль должен содержать не менее 8 символов"},
        {status:400}
      );
    }

    const exists=await db.query(
      `SELECT id FROM users WHERE student_id=$1 LIMIT 1`,
      [studentIdClean]
    );

    if(exists.rows[0]){
      return NextResponse.json(
        {ok:false,error:"Такой ID уже существует"},
        {status:409}
      );
    }

    const passwordHash=await bcrypt.hash(password,12);

    const result=await db.query(
      `INSERT INTO users (student_id,password_hash,planner_type,is_active)
       VALUES ($1,$2,$3,TRUE)
       RETURNING student_id,planner_type,is_active,created_at`,
      [studentIdClean,passwordHash,plannerType]
    );

    return NextResponse.json(
      {ok:true,student:result.rows[0]},
      {status:201}
    );
  }catch(error){
    console.error("Admin students POST error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}

