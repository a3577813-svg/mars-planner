import {NextResponse} from "next/server";
import crypto from "crypto";
import {cookies} from "next/headers";
import {db} from "../../../lib/db";

export async function POST(){
  try{
    const token=cookies().get("mars_session")?.value;

    if(token){
      const tokenHash=crypto.createHash("sha256").update(token).digest("hex");
      await db.query("DELETE FROM sessions WHERE token_hash=$1",[tokenHash]);
    }

    const response=NextResponse.json({ok:true});

    response.cookies.set("mars_session","",{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"lax",
      path:"/",
      maxAge:0
    });

    return response;
  }catch(error){
    console.error("Student logout error:",error);
    return NextResponse.json({ok:false,error:"Ошибка сервера"},{status:500});
  }
}
