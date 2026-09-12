import crypto from "crypto";
import {cookies} from "next/headers";
import {db} from "./db";

export async function getCurrentStaff(){
const token=cookies().get("mars_staff_session")?.value;
if(!token)return null;

const tokenHash=crypto.createHash("sha256").update(token).digest("hex");

const result=await db.query(
 "SELECT suser.id,suser.login,suser.role FROM staff_sessions ss JOIN staff_users suser ON suser.id=ss.staff_id WHERE ss.token_hash=$1 AND ss.expires_at>NOW() AND suser.is_active=TRUE LIMIT 1",
[tokenHash]
);

return result.rows[0]||null;
}
