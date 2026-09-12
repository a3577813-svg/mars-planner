import crypto from "crypto";
import {cookies} from "next/headers";
import {db} from "./db";

export async function getCurrentAdmin(){
  const token=cookies().get("mars_admin_session")?.value;
  if(!token)return null;

  const tokenHash=crypto.createHash("sha256").update(token).digest("hex");

  const result=await db.query(
    `SELECT a.id,a.login
     FROM admin_sessions s
     JOIN admins a ON a.id=s.admin_id
     WHERE s.token_hash=$1
       AND s.expires_at>NOW()
       AND a.is_active=TRUE
     LIMIT 1`,
    [tokenHash]
  );

  return result.rows[0]||null;
}
