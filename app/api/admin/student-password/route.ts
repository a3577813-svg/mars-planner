import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {db} from "../../../lib/db";
import {getCurrentAdmin} from "../../../lib/admin-session";

export async function PUT(request:Request){
  try{
    const admin=await getCurrentAdmin();

    if(!admin){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация администратора"},
        {status:401}
      );
    }

    const {studentId,password}=await request.json();

    if(typeof studentId!=="string"||typeof password!=="string"){
      return NextResponse.json(
        {ok:false,error:"Неверный запрос"},
        {status:400}
      );
    }

    const studentIdClean=studentId.trim();

    if(password.length<8){
      return NextResponse.json(
        {ok:false,error:"Пароль должен содержать не менее 8 символов"},
        {status:400}
      );
    }

    const exists=await db.query(
      `SELECT id
       FROM users
       WHERE student_id=$1
       LIMIT 1`,
      [studentIdClean]
    );

    if(!exists.rows[0]){
      return NextResponse.json(
        {ok:false,error:"Ученик не найден"},
        {status:404}
      );
    }

    const passwordHash=await bcrypt.hash(password,12);

    await db.query(
      `UPDATE users
       SET password_hash=$1,
           updated_at=NOW()
       WHERE student_id=$2`,
      [passwordHash,studentIdClean]
    );

    return NextResponse.json({
      ok:true,
      studentId:studentIdClean
    });
  }catch(error){
    console.error("Admin student password PUT error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
