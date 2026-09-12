
import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStudent} from "../../../lib/session";

export async function GET(request:Request){
  try{
    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация"},
        {status:401}
      );
    }

    const {searchParams}=new URL(request.url);
    const attachmentKey=searchParams.get("key")?.trim();

    if(!attachmentKey){
      return NextResponse.json(
        {ok:false,error:"Не указан ключ вложения"},
        {status:400}
      );
    }

    const result=await db.query(
      `SELECT attachment_key,image_data,caption,updated_at
       FROM planner_attachments
       WHERE student_id=$1
         AND planner_type=$2
         AND attachment_key=$3
       LIMIT 1`,
      [student.student_id,student.planner_type,attachmentKey]
    );

    return NextResponse.json({
      ok:true,
      attachment:result.rows[0]||null
    });
  }catch(error){
    console.error("Planner attachment GET error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}

export async function PUT(request:Request){
  try{
    const student=await getCurrentStudent();

    if(!student){
      return NextResponse.json(
        {ok:false,error:"Необходима авторизация"},
        {status:401}
      );
    }

    const {attachmentKey,imageData,caption}=await request.json();

    if(
      typeof attachmentKey!=="string"||
      typeof imageData!=="string"||
      typeof caption!=="string"||
      !attachmentKey.trim()
    ){
      return NextResponse.json(
        {ok:false,error:"Некорректные данные"},
        {status:400}
      );
    }

    if(
      imageData &&
      !/^data:image\/(jpeg|png|webp);base64,/i.test(imageData)
    ){
      return NextResponse.json(
        {ok:false,error:"Недопустимый формат изображения"},
        {status:400}
      );
    }

 const MAX_IMAGE_DATA_LENGTH=8000000;
 if(imageData.length>MAX_IMAGE_DATA_LENGTH){
 return NextResponse.json(
 {ok:false,error:"Изображение слишком большое"},
 {status:413}
 );
 }

    await db.query(
      `INSERT INTO planner_attachments
       (student_id,planner_type,attachment_key,image_data,caption,updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (student_id,planner_type,attachment_key)
       DO UPDATE SET
         image_data=EXCLUDED.image_data,
         caption=EXCLUDED.caption,
         updated_at=NOW()`,
      [
        student.student_id,
        student.planner_type,
        attachmentKey.trim(),
        imageData,
        caption
      ]
    );

    return NextResponse.json({ok:true});
  }catch(error){
    console.error("Planner attachment PUT error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
