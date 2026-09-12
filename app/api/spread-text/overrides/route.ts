import {NextRequest, NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentAdmin} from "../../../lib/admin-session";

function validAudience(value:string){
  return value==="middle"||value==="senior";
}

export async function GET(request:NextRequest){
  const {searchParams}=new URL(request.url);
  const audience=searchParams.get("audience")||"";
  const pageNumber=Number(searchParams.get("page")||0);

  if(!validAudience(audience)||!Number.isInteger(pageNumber)||pageNumber<1){
    return NextResponse.json({ok:false,error:"invalid_request"},{status:400});
  }

  const result=await db.query(
    `SELECT selector,text_value
     FROM spread_text_overrides
     WHERE audience=$1 AND page_number=$2
     ORDER BY id`,
    [audience,pageNumber]
  );

  return NextResponse.json({
    ok:true,
    overrides:result.rows.map(row=>({
      selector:row.selector,
      text:row.text_value
    }))
  });
}

export async function PUT(request:NextRequest){
  const admin=await getCurrentAdmin();
  if(!admin){
    return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  }

  const body=await request.json().catch(()=>null);
  const audience=body?.audience;
  const pageNumber=Number(body?.page);
  const overrides=body?.overrides;

  if(
    !validAudience(audience)||
    !Number.isInteger(pageNumber)||
    pageNumber<1||
    !Array.isArray(overrides)
  ){
    return NextResponse.json({ok:false,error:"invalid_request"},{status:400});
  }

  const client=await db.connect();
  try{
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM spread_text_overrides
       WHERE audience=$1 AND page_number=$2`,
      [audience,pageNumber]
    );

    for(const item of overrides){
      if(
        !item||
        typeof item.selector!=="string"||
        typeof item.text!=="string"
      ) continue;

      await client.query(
        `INSERT INTO spread_text_overrides
         (audience,page_number,selector,text_value,updated_at)
         VALUES($1,$2,$3,$4,NOW())`,
        [audience,pageNumber,item.selector,item.text]
      );
    }

    await client.query("COMMIT");
  }catch(error){
    await client.query("ROLLBACK");
    throw error;
  }finally{
    client.release();
  }

  return NextResponse.json({ok:true});
}

export async function DELETE(request:NextRequest){
  const admin=await getCurrentAdmin();
  if(!admin){
    return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  }

  const body=await request.json().catch(()=>null);
  const audience=body?.audience;
  const pageNumber=Number(body?.page);

  if(!validAudience(audience)||!Number.isInteger(pageNumber)||pageNumber<1){
    return NextResponse.json({ok:false,error:"invalid_request"},{status:400});
  }

  await db.query(
    `DELETE FROM spread_text_overrides
     WHERE audience=$1 AND page_number=$2`,
    [audience,pageNumber]
  );

  return NextResponse.json({ok:true});
}



