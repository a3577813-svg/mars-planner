import fs from "fs";
import {NextResponse} from "next/server";
import {getCurrentAdmin} from "../../../lib/admin-session";

export const runtime="nodejs";

export async function GET(){
  try{
    const admin=await getCurrentAdmin();

    if(!admin){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация администратора"},
        {status:401}
      );
    }

    const filePath=
      "/opt/mars-planner/storage/submissions/all-submissions.pdf";

    if(!fs.existsSync(filePath)){
      return NextResponse.json(
        {ok:false,error:"Общий PDF пока не сформирован"},
        {status:404}
      );
    }

    const pdf=fs.readFileSync(filePath);

    return new NextResponse(pdf,{
      status:200,
      headers:{
        "Content-Type":"application/pdf",
        "Content-Disposition":
          'attachment; filename="mars-all-submissions.pdf"',
        "Cache-Control":"no-store"
      }
    });
  }catch(error){
    console.error("Admin all submissions PDF GET error:",error);

    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
