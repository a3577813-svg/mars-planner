import {NextResponse} from "next/server";
import {db} from "../../lib/db";
import {getCurrentAdmin} from "../../lib/admin-session";

type CalendarEventInput={
  title:string;
  start:string;
  end?:string;
  icon?:string;
};

export async function GET(){
  try{
    const result=await db.query(
      `SELECT id,title,start_date::text AS start_date,end_date::text AS end_date,icon,sort_order
       FROM calendar_events
       WHERE is_active=TRUE
       ORDER BY start_date,sort_order,id`
    );

    return NextResponse.json({
      ok:true,
      events:result.rows.map(row=>({
        id:String(row.id),
        title:row.title,
        start:row.start_date,
        end:row.end_date||undefined,
        icon:row.icon||"📅"
      }))
    });
  }catch(error){
    console.error("Calendar GET error:",error);
    return NextResponse.json({ok:false,error:"Ошибка сервера"},{status:500});
  }
}

export async function PUT(request:Request){
  const admin=await getCurrentAdmin();

  if(!admin){
    return NextResponse.json(
      {ok:false,error:"Необходима авторизация администратора"},
      {status:401}
    );
  }

  try{
    const body=await request.json();
    const events:Array<CalendarEventInput>=Array.isArray(body?.events)?body.events:[];

    for(const item of events){
      if(
        typeof item?.title!=="string"||
        !item.title.trim()||
        typeof item?.start!=="string"||
        !/^\d{4}-\d{2}-\d{2}$/.test(item.start)||
        (item.end!==undefined&&item.end!==""&&!/^\d{4}-\d{2}-\d{2}$/.test(item.end))
      ){
        return NextResponse.json(
          {ok:false,error:"Некорректные данные календаря"},
          {status:400}
        );
      }
    }

    const client=await db.connect();
    try{
      await client.query("BEGIN");
      await client.query("DELETE FROM calendar_events");

      for(let i=0;i<events.length;i++){
        const item=events[i];
        await client.query(
          `INSERT INTO calendar_events
           (title,start_date,end_date,icon,sort_order,is_active,updated_at)
           VALUES ($1,$2,$3,$4,$5,TRUE,NOW())`,
          [
            item.title.trim(),
            item.start,
            item.end||null,
            (item.icon||"📅").trim()||"📅",
            i
          ]
        );
      }

      await client.query("COMMIT");
    }catch(error){
      await client.query("ROLLBACK");
      throw error;
    }finally{
      client.release();
    }

    return NextResponse.json({ok:true,count:events.length});
  }catch(error){
    console.error("Calendar PUT error:",error);
    return NextResponse.json({ok:false,error:"Ошибка сервера"},{status:500});
  }
}
