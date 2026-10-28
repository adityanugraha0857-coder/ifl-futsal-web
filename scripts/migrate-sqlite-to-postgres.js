require("dotenv").config();

const path = require("path");
const Database = require("better-sqlite3");
const { closeDatabase, db, initDatabase } = require("../lib/database");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL wajib diisi untuk migrasi ke Supabase.");
  }

  const dataDir = process.env.DATA_DIR || path.join(__dirname, "..", "data");
  const sourcePath =
    process.env.SQLITE_DB_PATH || path.join(dataDir, "ifl-events.sqlite");
  const source = new Database(sourcePath, {
    readonly: true,
    fileMustExist: true,
  });

  try {
    await initDatabase();

    const tables = ["admins", "events", "matches", "settings"];
    for (const table of tables) {
      const row = await db.get(`SELECT COUNT(*) AS count FROM ${table}`);
      if (Number(row.count) > 0) {
        throw new Error(
          `Tabel Supabase "${table}" tidak kosong. Migrasi dibatalkan agar data tidak tertimpa.`,
        );
      }
    }

    const rows = Object.fromEntries(
      tables.map((table) => [
        table,
        source.prepare(`SELECT * FROM ${table}`).all(),
      ]),
    );

    await db.transaction(async (tx) => {
      for (const admin of rows.admins) {
        await tx.run(
          "INSERT INTO admins(id,username,password_hash,created_at) VALUES(?,?,?,?)",
          [admin.id, admin.username, admin.password_hash, admin.created_at],
        );
      }
      for (const event of rows.events) {
        await tx.run(
          `INSERT INTO events(id,title,category,location,start_date,end_date,status,description,created_at)
           VALUES(?,?,?,?,?,?,?,?,?)`,
          [
            event.id,
            event.title,
            event.category,
            event.location,
            event.start_date,
            event.end_date,
            event.status,
            event.description,
            event.created_at,
          ],
        );
      }
      for (const match of rows.matches) {
        await tx.run(
          `INSERT INTO matches(id,event_id,match_date,match_time,home_team,away_team,home_score,away_score,venue,status,round_name,created_at)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            match.id,
            match.event_id,
            match.match_date,
            match.match_time,
            match.home_team,
            match.away_team,
            match.home_score,
            match.away_score,
            match.venue,
            match.status,
            match.round_name,
            match.created_at,
          ],
        );
      }
      for (const setting of rows.settings) {
        await tx.run("INSERT INTO settings(key,value) VALUES(?,?)", [
          setting.key,
          setting.value,
        ]);
      }
    });

    for (const table of ["admins", "events", "matches"]) {
      await db.get(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM ${table}`,
      );
    }

    console.log(
      `Migrasi selesai: ${rows.admins.length} admin, ${rows.events.length} event, ${rows.matches.length} pertandingan, ${rows.settings.length} pengaturan.`,
    );
  } finally {
    source.close();
  }
}

main()
  .catch((error) => {
    console.error("Migrasi database gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closeDatabase();
    } catch (error) {
      console.error("Gagal menutup koneksi database:", error);
      process.exitCode = 1;
    }
  });
