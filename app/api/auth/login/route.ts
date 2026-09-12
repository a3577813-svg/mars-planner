import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {db} from "../../../lib/db";

export async function POST(request:Request){
  try{
    const {studentId,password}=await request.json();

    if(typeof studentId!=="string"||typeof password!=="string"){
      return NextResponse.json({ok:false,error:"Неверный запрос"},{status:400});
    }

    const studentIdClean=studentId.trim();

    const result=await db.query(
      `SELECT id,student_id,password_hash,planner_type
       FROM users
       WHERE student_id=$1 AND is_active=TRUE
       LIMIT 1`,
      [studentIdClean]
    );

    const user=result.rows[0];

    if(!user||!(await bcrypt.compare(password,user.password_hash))){
      return NextResponse.json(
        {ok:false,error:"Неверный ID или пароль"},
        {status:401}
      );
    }

    const token=crypto.randomBytes(32).toString("hex");
    const tokenHash=crypto.createHash("sha256").update(token).digest("hex");

    await db.query(
      `INSERT INTO sessions (user_id,token_hash,expires_at)
       VALUES ($1,$2,NOW()+INTERVAL '30 days')`,
      [user.id,tokenHash]
    );

    const response=NextResponse.json({
      ok:true,
      studentId:user.student_id,
      plannerType:user.planner_type
    });

    response.cookies.set("mars_session",token,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"lax",
      path:"/",
      maxAge:60*60*24*30
    });

    return response;
  }catch(error){
    console.error("Login error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
