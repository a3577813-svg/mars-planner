import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {db} from "../../../lib/db";

export async function POST(request:Request){
try{
const {login,password}=await request.json();
 if(typeof login!=="string"||typeof password!=="string"){return NextResponse.json({ok:false,error:"Неверный запрос"},{status:400});}
 const result=await db.query("SELECT id,login,password_hash,role FROM staff_users WHERE login=$1 AND is_active=TRUE LIMIT 1",[login.trim()]);
 const staff=result.rows[0];
 if(!staff||!(await bcrypt.compare(password,staff.password_hash))){return NextResponse.json({ok:false,error:"Неверный логин или пароль"},{status:401});}
 const token=crypto.randomBytes(32).toString("hex");
 const tokenHash=crypto.createHash("sha256").update(token).digest("hex");
 await db.query("INSERT INTO staff_sessions (staff_id,token_hash,expires_at) VALUES ($1,$2,NOW()+INTERVAL '30 days')",[staff.id,tokenHash]);
 const response=NextResponse.json({ok:true,login:staff.login,role:staff.role});
 response.cookies.set("mars_staff_session",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:2592000});
 return response;

}catch(error){
console.error("Staff login error:",error);
return NextResponse.json(
{ok:false,error:"Ошибка сервера"},
{status:500}
);
}
}
