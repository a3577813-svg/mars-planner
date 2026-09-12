import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {db} from "../../../lib/db";

export async function POST(request:Request){
  try{
    const {login,password}=await request.json();

    if(typeof login!=="string"||typeof password!=="string"){
      return NextResponse.json(
        {ok:false,error:"Неверный запрос"},
        {status:400}
      );
    }

    const result=await db.query(
      `SELECT id,login,password_hash
       FROM admins
       WHERE login=$1 AND is_active=TRUE
       LIMIT 1`,
      [login.trim()]
    );

    const admin=result.rows[0];

    if(!admin||!(await bcrypt.compare(password,admin.password_hash))){
      return NextResponse.json(
        {ok:false,error:"Неверный логин или пароль"},
        {status:401}
      );
    }

    const token=crypto.randomBytes(32).toString("hex");
    const tokenHash=crypto.createHash("sha256").update(token).digest("hex");

    await db.query(
      `INSERT INTO admin_sessions (admin_id,token_hash,expires_at)
       VALUES ($1,$2,NOW()+INTERVAL '30 days')`,
      [admin.id,tokenHash]
    );

    const response=NextResponse.json({
      ok:true,
      login:admin.login
    });

    response.cookies.set("mars_admin_session",token,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"lax",
      path:"/",
      maxAge:60*60*24*30
    });

    return response;
  }catch(error){
    console.error("Admin login error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
