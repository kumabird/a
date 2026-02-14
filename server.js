import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

const app = express();

app.use(cors());
app.use(express.json());

/*
 Neon PostgreSQL接続
*/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


/*
 初回テーブル作成
*/
await pool.query(`
CREATE TABLE IF NOT EXISTS usersettings (
  userid TEXT PRIMARY KEY,
  wallpaper TEXT,
  settings JSONB,
  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

console.log("DB ready");


/*
 保存API
*/
app.post("/api/save", async (req, res) => {

  const { userid, wallpaper, settings } = req.body;

  if (!userid) {
    return res.status(400).json({ error: "userid required" });
  }

  try {

    await pool.query(`
      INSERT INTO usersettings(userid, wallpaper, settings)
      VALUES($1,$2,$3)
      ON CONFLICT(userid)
      DO UPDATE SET
        wallpaper = $2,
        settings = $3,
        updated = CURRENT_TIMESTAMP
    `, [userid, wallpaper, settings]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }

});


/*
 読み込みAPI
*/
app.get("/api/load/:userid", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT * FROM usersettings WHERE userid=$1`,
      [req.params.userid]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "db error" });

  }

});


/*
 サーバー起動
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
