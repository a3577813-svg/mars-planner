import {NextRequest,NextResponse} from "next/server";
import {db} from "../../lib/db";
import {getCurrentAdmin} from "../../lib/admin-session";

function validAudience(value:string){
  return value==="middle"||value==="senior";
}

export async function GET(request:NextRequest){
  const {searchParams}=new URL(request.url);
  const audience=searchParams.get("audience")||"";

  if(!validAudience(audience)){
    return NextResponse.json(
      {ok:false,error:"invalid_request"},
      {status:400}
    );
  }

  const result=await db.query(
    `SELECT page_number,week,start_date,end_date,visible
     FROM spread_assignments
     WHERE audience=$1
     ORDER BY page_number`,
    [audience]
  );

  return NextResponse.json({
    ok:true,
    assignments:result.rows.map(row=>({
      page:Number(row.page_number),
      week:row.week||"",
      start:row.start_date
        ? new Date(row.start_date).toISOString().slice(0,10)
        : "",
      end:row.end_date
        ? new Date(row.end_date).toISOString().slice(0,10)
        : "",
      visible:row.visible
    }))
  });
}

export async function PUT(request:NextRequest){
  const admin=await getCurrentAdmin();

  if(!admin){
    return NextResponse.json(
      {ok:false,error:"unauthorized"},
      {status:401}
    );
  }

  const body=await request.json().catch(()=>null);
  const audience=body?.audience;
  const assignments=body?.assignments;

  if(!validAudience(audience)||!Array.isArray(assignments)){
    return NextResponse.json(
      {ok:false,error:"invalid_request"},
      {status:400}
    );
  }

  const client=await db.connect();

  try{
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM spread_assignments
       WHERE audience=$1`,
      [audience]
    );

    for(const item of assignments){
      const page=Number(item?.page);

      if(!Number.isInteger(page)||page<1){
        continue;
      }

      await client.query(
        `INSERT INTO spread_assignments
         (audience,page_number,week,start_date,end_date,visible,updated_at)
         VALUES($1,$2,$3,$4,$5,$6,NOW())`,
        [
          audience,
          page,
          typeof item.week==="string" ? item.week : "",
          item.start||null,
          item.end||null,
          item.visible!==false
        ]
      );
    }

    await client.query("COMMIT");
  }catch(error){
    await client.query("ROLLBACK");
    console.error("spread-assignments PUT failed",error);

    return NextResponse.json(
      {ok:false,error:"save_failed"},
      {status:500}
    );
  }finally{
    client.release();
  }

  return NextResponse.json({ok:true});
}

