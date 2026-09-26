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
        su.id,
        su.login,
        su.role,
        su.is_active,
        su.created_at,
        COUNT(ssa.student_id)::int AS students_count
      FROM staff_users su
      LEFT JOIN staff_student_assignments ssa
        ON ssa.staff_id=su.id
      GROUP BY
        su.id,
        su.login,
        su.role,
        su.is_active,
        su.created_at
      ORDER BY
        su.role,
        su.login
    `);

    return NextResponse.json({
      ok:true,
      staff:result.rows
    });
  }catch(error){
    console.error("Admin staff GET error:",error);
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

    const {login,password,role}=await request.json();

    if(
      typeof login!=="string"||
      typeof password!=="string"||
      (role!=="teacher"&&role!=="methodist")
    ){
      return NextResponse.json(
        {ok:false,error:"Неверный запрос"},
        {status:400}
      );
    }

    const loginClean=login.trim();

    if(loginClean.length<3||loginClean.length>100){
      return NextResponse.json(
        {ok:false,error:"Логин должен содержать от 3 до 100 символов"},
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
      `SELECT id FROM staff_users WHERE login=$1 LIMIT 1`,
      [loginClean]
    );

    if(exists.rows[0]){
      return NextResponse.json(
        {ok:false,error:"Такой логин уже существует"},
        {status:409}
      );
    }

    const passwordHash=await bcrypt.hash(password,12);

    const result=await db.query(
      `INSERT INTO staff_users (login,password_hash,role,is_active)
       VALUES ($1,$2,$3,TRUE)
       RETURNING id,login,role,is_active,created_at`,
      [loginClean,passwordHash,role]
    );

    return NextResponse.json(
      {
        ok:true,
        staff:{
          ...result.rows[0],
          students_count:0
        }
      },
      {status:201}
    );
  }catch(error){
    console.error("Admin staff POST error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}

export async function PATCH(request:Request){
  try{
    const admin=await getCurrentAdmin();

    if(!admin){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация администратора"},
        {status:401}
      );
    }

    const body=await request.json();
    const id=Number(body?.id);
    const isActive=body?.isActive;

    if(!Number.isInteger(id)||id<=0||typeof isActive!=="boolean"){
      return NextResponse.json(
        {ok:false,error:"Неверный запрос"},
        {status:400}
      );
    }

    const result=await db.query(
      `UPDATE staff_users
       SET is_active=$2
       WHERE id=$1
       RETURNING id,login,role,is_active,created_at`,
      [id,isActive]
    );

    if(!result.rows[0]){
      return NextResponse.json(
        {ok:false,error:"Сотрудник не найден"},
        {status:404}
      );
    }

    return NextResponse.json({
      ok:true,
      staff:result.rows[0]
    });
  }catch(error){
    console.error("Admin staff PATCH error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
