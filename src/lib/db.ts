import Database from "better-sqlite3";
import path from "path";
import { hashPassword } from "@/lib/hash";

const DB_PATH = path.join(process.cwd(), "data.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
    seedData(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('manager', 'worker')),
      passwordHash TEXT NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS operations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      operationId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      FOREIGN KEY (operationId) REFERENCES operations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      operationId TEXT NOT NULL,
      workerId TEXT NOT NULL,
      currentStepIndex INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('active', 'completed')) DEFAULT 'active',
      startedAt TEXT NOT NULL,
      completedAt TEXT,
      FOREIGN KEY (operationId) REFERENCES operations(id) ON DELETE CASCADE,
      FOREIGN KEY (workerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
}

function seedData(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (count.c > 0) return;

  const defaultHash = hashPassword("1234");
  const insert = db.prepare(
    "INSERT INTO users (id, name, email, role, passwordHash) VALUES (?, ?, ?, ?, ?)"
  );

  const seedTx = db.transaction(() => {
    insert.run("m1", "Ahmet Yılmaz", "ahmet@example.com", "manager", defaultHash);
    insert.run("w1", "Mehmet Kaya", "mehmet@example.com", "worker", defaultHash);
    insert.run("w2", "Ayşe Demir", "ayse@example.com", "worker", defaultHash);
    insert.run("w3", "Fatma Çelik", "fatma@example.com", "worker", defaultHash);
  });

  seedTx();
}
