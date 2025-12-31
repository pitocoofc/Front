
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* rota teste */
app.get("/", (req, res) => {
  res.send("API online");
});

/* cadastro */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "dados inválidos" });
  }

  const exists = await pool.query(
    "SELECT id FROM users WHERE username = $1",
    [username]
  );

  if (exists.rows.length > 0) {
    return res.status(409).json({ error: "usuário existe" });
  }

  await pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2)",
    [username, password]
  );

  res.json({ success: true });
});

/* login */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await pool.query(
    "SELECT username FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (user.rows.length === 0) {
    return res.status(401).json({ error: "login inválido" });
  }

  res.json({ success: true, username });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API rodando");
});
