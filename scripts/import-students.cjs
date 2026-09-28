const fs = require("fs");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const file = process.argv[2] || "/opt/mars-planner/mars_students_import.csv";

function parseLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }

  out.push(cur);
  return out;
}

(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL не найден");
  }

  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").trim();
  const lines = text.split(/\r?\n/);
  const headers = parseLine(lines.shift());

  const required = ["student_id", "display_name", "planner_type", "password"];
  for (const key of required) {
    if (!headers.includes(key)) {
      throw new Error(`В CSV нет колонки ${key}`);
    }
  }

  const rows = lines
    .filter(Boolean)
    .map((line) => {
      const values = parseLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    });

  const seen = new Set();
  for (const row of rows) {
    if (!row.student_id || !row.display_name || !row.password) {
      throw new Error(`Неполная строка для ID ${row.student_id || "(пусто)"}`);
    }
    if (row.planner_type !== "middle" && row.planner_type !== "senior") {
      throw new Error(`Неверный planner_type у ${row.student_id}: ${row.planner_type}`);
    }
    if (row.password.length < 8) {
      throw new Error(`Слишком короткий пароль у ${row.student_id}`);
    }
    if (seen.has(row.student_id)) {
      throw new Error(`Повтор ID в CSV: ${row.student_id}`);
    }
    seen.add(row.student_id);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      const existing = await client.query(
        "SELECT id FROM users WHERE student_id=$1 LIMIT 1",
        [row.student_id]
      );

      const hash = await bcrypt.hash(row.password, 12);

      if (existing.rows.length) {
        await client.query(
          `UPDATE users
           SET display_name=$2,
               planner_type=$3,
               password_hash=$4,
               is_active=TRUE,
               updated_at=NOW()
           WHERE student_id=$1`,
          [row.student_id, row.display_name, row.planner_type, hash]
        );
        updated++;
      } else {
        await client.query(
          `INSERT INTO users
             (student_id, display_name, planner_type, password_hash, is_active)
           VALUES ($1,$2,$3,$4,TRUE)`,
          [row.student_id, row.display_name, row.planner_type, hash]
        );
        inserted++;
      }
    }

    await client.query("COMMIT");
    console.log(`OK: всего ${rows.length}, добавлено ${inserted}, обновлено ${updated}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
})().catch((error) => {
  console.error("IMPORT ERROR:", error);
  process.exit(1);
});
