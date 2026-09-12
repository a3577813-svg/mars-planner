import fs from "fs";
import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentAdmin} from "../../../lib/admin-session";

export const runtime="nodejs";

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
    const studentId=searchParams.get("studentId")?.trim();

    if(!studentId){
      return NextResponse.json(
        {ok:false,error:"Не указан ID ученика"},
        {status:400}
      );
    }

    const result=await db.query(
      `SELECT planner_type,status,pdf_path
       FROM planner_submissions
       WHERE student_id=$1
       LIMIT 1`,
      [studentId]
    );

    const submission=result.rows[0];

    if(!submission){
      return NextResponse.json(
        {ok:false,error:"Сдача ученика не найдена"},
        {status:404}
      );
    }

    if(submission.status!=="submitted"){
      return NextResponse.json(
        {ok:false,error:"PDF ещё не готов"},
        {status:409}
      );
    }

    const filePath=String(submission.pdf_path||"");

    if(!filePath||!fs.existsSync(filePath)){
      return NextResponse.json(
        {ok:false,error:"Файл PDF не найден"},
        {status:404}
      );
    }

    const pdf=fs.readFileSync(filePath);

    const fileName=
      `${studentId}-${submission.planner_type}-final.pdf`;

    return new NextResponse(pdf,{
      status:200,
      headers:{
        "Content-Type":"application/pdf",
        "Content-Disposition":`inline; filename="${fileName}"`,
        "Cache-Control":"no-store"
      }
    });
  }catch(error){
    console.error("Admin planner PDF GET error:",error);

    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
