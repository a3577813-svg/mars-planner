import fs from "fs";
import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStudent} from "../../../lib/session";

export const runtime="nodejs";

export async function GET(){
  try{
    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация"},
        {status:401}
      );
    }

    const result=await db.query(
      `SELECT status,pdf_path
       FROM planner_submissions
       WHERE student_id=$1
         AND planner_type=$2
       LIMIT 1`,
      [student.student_id,student.planner_type]
    );

    const submission=result.rows[0];

    if(!submission){
      return NextResponse.json(
        {ok:false,error:"Планёрка ещё не сдана"},
        {status:404}
      );
    }

    if(submission.status==="generating"){
      return NextResponse.json(
        {ok:false,error:"PDF ещё формируется"},
        {status:409}
      );
    }

    if(submission.status==="error"){
      return NextResponse.json(
        {ok:false,error:"Не удалось сформировать PDF"},
        {status:500}
      );
    }

    const filePath=String(submission.pdf_path||"");

    if(!filePath||!fs.existsSync(filePath)){
      return NextResponse.json(
        {ok:false,error:"PDF пока не сформирован"},
        {status:404}
      );
    }

    const pdf=fs.readFileSync(filePath);
    const fileName=
      `${student.student_id}-${student.planner_type}-final.pdf`;

    return new NextResponse(pdf,{
      status:200,
      headers:{
        "Content-Type":"application/pdf",
        "Content-Disposition":`inline; filename="${fileName}"`,
        "Cache-Control":"no-store"
      }
    });
  }catch(error){
    console.error("Planner PDF GET error:",error);

    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
