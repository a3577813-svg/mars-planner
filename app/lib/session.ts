import crypto from "crypto";
import {cookies} from "next/headers";
import {db} from "./db";

export async function getCurrentStudent(){
  const token=cookies().get("mars_session")?.value;
  if(!token)return null;

  const tokenHash=crypto.createHash("sha256").update(token).digest("hex");

  const result=await db.query(
    `SELECT u.id,u.student_id,u.planner_type
     FROM sessions s
     JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=$1
       AND s.expires_at>NOW()
       AND u.is_active=TRUE
     LIMIT 1`,
    [tokenHash]
  );

  return result.rows[0]||null;
}
