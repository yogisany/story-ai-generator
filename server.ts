import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("storybook.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    credits INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT,
    theme TEXT,
    targetAge TEXT,
    moral TEXT,
    coverUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    bookId TEXT,
    pageNumber INTEGER,
    content TEXT,
    illustrationUrl TEXT,
    narrationUrl TEXT,
    FOREIGN KEY(bookId) REFERENCES books(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User Routes
  app.post("/api/users", (req, res) => {
    const { id, email, name } = req.body;
    try {
      const stmt = db.prepare("INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)");
      stmt.run(id, email, name);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Book Routes
  app.post("/api/books", (req, res) => {
    const { id, userId, title, theme, targetAge, moral, coverUrl } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO books (id, userId, title, theme, targetAge, moral, coverUrl) VALUES (?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, userId, title, theme, targetAge, moral, coverUrl);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/books/:userId", (req, res) => {
    try {
      const books = db.prepare("SELECT * FROM books WHERE userId = ? ORDER BY createdAt DESC").all(req.params.userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/pages", (req, res) => {
    const { id, bookId, pageNumber, content, illustrationUrl } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO pages (id, bookId, pageNumber, content, illustrationUrl) VALUES (?, ?, ?, ?, ?)");
      stmt.run(id, bookId, pageNumber, content, illustrationUrl);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/books/:bookId/pages", (req, res) => {
    try {
      const pages = db.prepare("SELECT * FROM pages WHERE bookId = ? ORDER BY pageNumber ASC").all(req.params.bookId);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
