import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {getCurrentStaff} from "../../../lib/staff-session";

type PlannerType="middle"|"senior";

function emptyGroup(plannerType:PlannerType){
  return{
    plannerType,
    level:plannerType==="middle"?"5–7 уровни":"8–11 уровни",
    students:0,
    total:0,
    started:0,
    done:0,
    attachments:0,
    progress:0
  };
}

export async function GET(){
  try{
    const staff=await getCurrentStaff();

    if(!staff){
      return NextResponse.json(
        {ok:false,error:"Не авторизован"},
        {status:401}
      );
    }

    if(staff.role!=="methodist"){
      return NextResponse.json(
        {ok:false,error:"Недостаточно прав"},
        {status:403}
      );
    }

    const result=await db.query(`
      SELECT
        u.student_id,
        u.planner_type,
        pe.field_key,
        pe.value,
        pa.attachment_key,
        pa.image_data
      FROM staff_student_assignments ssa
      JOIN users u
        ON u.student_id=ssa.student_id
      LEFT JOIN planner_entries pe
        ON pe.student_id=u.student_id
       AND pe.planner_type=u.planner_type
      LEFT JOIN planner_attachments pa
        ON pa.student_id=u.student_id
       AND pa.planner_type=u.planner_type
      WHERE ssa.staff_id=$1
        AND u.is_active=TRUE
      ORDER BY u.student_id ASC
    `,[staff.id]);

    const students=new Map<
      string,
      {
        plannerType:PlannerType;
        entries:Map<string,string>;
        attachments:Set<string>;
      }
    >();

    for(const row of result.rows){
      if(!students.has(row.student_id)){
        students.set(row.student_id,{
          plannerType:row.planner_type,
          entries:new Map(),
          attachments:new Set()
        });
      }

      const student=students.get(row.student_id);
      if(!student)continue;

      if(row.field_key&&row.value){
        student.entries.set(row.field_key,row.value);
      }

      if(row.attachment_key&&row.image_data){
        student.attachments.add(row.attachment_key);
      }
    }

    const groups={
      middle:emptyGroup("middle"),
      senior:emptyGroup("senior")
    };

    const studentSummaries:any[]=[];

    for(const [studentId,student] of Array.from(students.entries())){
      const total=student.plannerType==="middle"?38:45;
      const perPage=new Map<number,{count:number;substantial:number}>();

      for(const [key,valueRaw] of Array.from(student.entries)){
        const value=(valueRaw||"").trim();
        if(!value)continue;

        const match=
          student.plannerType==="middle"
            ?key.match(/^mars-book-p([0-9]+)-/)
            :key.match(/^mars-senior-(?:shared-)?p([0-9]+)-/);

        const page=Number(match?.[1]||0);
        if(!page||page>total)continue;

        const item=perPage.get(page)||{count:0,substantial:0};
        item.count++;
        if(value.length>=18)item.substantial++;
        perPage.set(page,item);
      }

      let started=0;
      let done=0;

      perPage.forEach(item=>{
        started++;
        if(item.count>=3||item.substantial>=2)done++;
      });

      const progress=total
        ?Math.round(done/total*100)
        :0;

      studentSummaries.push({
        id:studentId,
        plannerType:student.plannerType,
        level:student.plannerType==="middle"?"5–7 уровни":"8–11 уровни",
        total,
        started,
        done,
        attachments:student.attachments.size,
        progress
      });

      const group=groups[student.plannerType];
      group.students++;
      group.total+=total;
      group.started+=started;
      group.done+=done;
      group.attachments+=student.attachments.size;
    }

    for(const group of Object.values(groups)){
      group.progress=group.total
        ?Math.round(group.done/group.total*100)
        :0;
    }

    return NextResponse.json({
      ok:true,
      groups:[groups.middle,groups.senior],
      students:studentSummaries
    });

  }catch(error){
    console.error("Methodist overview error:",error);
    return NextResponse.json(
      {ok:false,error:"Ошибка сервера"},
      {status:500}
    );
  }
}
