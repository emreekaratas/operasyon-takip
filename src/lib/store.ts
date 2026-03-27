import { User, StoredUser, Operation, Step, Assignment, Notification } from "@/types";
import { getDb } from "@/lib/db";

// --- Helpers ---

function buildOperation(row: Record<string, unknown>): Operation {
  const db = getDb();
  const steps = db
    .prepare('SELECT * FROM steps WHERE operationId = ? ORDER BY "order" ASC')
    .all(row.id as string) as Array<Record<string, unknown>>;

  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as Operation["status"],
    createdBy: row.createdBy as string,
    createdAt: row.createdAt as string,
    steps: steps.map((s) => ({
      id: s.id as string,
      title: s.title as string,
      description: s.description as string,
      order: s.order as number,
      status: s.status as Step["status"],
    })),
  };
}

function rowToStoredUser(row: Record<string, unknown>): StoredUser {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as StoredUser["role"],
    passwordHash: row.passwordHash as string,
    avatar: (row.avatar as string) || undefined,
  };
}

function rowToAssignment(row: Record<string, unknown>): Assignment {
  return {
    id: row.id as string,
    operationId: row.operationId as string,
    workerId: row.workerId as string,
    currentStepIndex: row.currentStepIndex as number,
    status: row.status as Assignment["status"],
    startedAt: row.startedAt as string,
    completedAt: (row.completedAt as string) || undefined,
  };
}

function rowToNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: row.userId as string,
    message: row.message as string,
    read: !!(row.read as number),
    createdAt: row.createdAt as string,
  };
}

// --- Users ---

export function stripPasswordHash(user: StoredUser): User {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export function getUsers(): User[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM users").all() as Array<Record<string, unknown>>;
  return rows.map((r) => stripPasswordHash(rowToStoredUser(r)));
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? stripPasswordHash(rowToStoredUser(row)) : undefined;
}

export function getStoredUserByEmail(email: string): StoredUser | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)")
    .get(email) as Record<string, unknown> | undefined;
  return row ? rowToStoredUser(row) : undefined;
}

export function getStoredUserById(id: string): StoredUser | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToStoredUser(row) : undefined;
}

export function addUser(user: StoredUser): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO users (id, name, email, role, passwordHash, avatar) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(user.id, user.name, user.email, user.role, user.passwordHash, user.avatar ?? null);
}

export function emailExists(email: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT 1 FROM users WHERE LOWER(email) = LOWER(?)")
    .get(email);
  return !!row;
}

// --- Operations ---

export function getOperations(): Operation[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM operations ORDER BY createdAt DESC").all() as Array<Record<string, unknown>>;
  return rows.map(buildOperation);
}

export function getOperationById(id: string): Operation | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM operations WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? buildOperation(row) : undefined;
}

export function addOperation(op: Operation): void {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO operations (id, title, description, status, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(op.id, op.title, op.description, op.status, op.createdBy, op.createdAt);

    const insertStep = db.prepare(
      'INSERT INTO steps (id, operationId, title, description, "order", status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const step of op.steps) {
      insertStep.run(step.id, op.id, step.title, step.description, step.order, step.status);
    }
  });
  tx();
}

export function deleteOperation(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM operations WHERE id = ?").run(id);
  return result.changes > 0;
}

export function updateOperation(
  id: string,
  updater: (o: Operation) => Operation
): Operation | undefined {
  const current = getOperationById(id);
  if (!current) return undefined;

  const updated = updater(current);
  const db = getDb();

  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE operations SET title = ?, description = ?, status = ? WHERE id = ?"
    ).run(updated.title, updated.description, updated.status, id);

    db.prepare("DELETE FROM steps WHERE operationId = ?").run(id);

    const insertStep = db.prepare(
      'INSERT INTO steps (id, operationId, title, description, "order", status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const step of updated.steps) {
      insertStep.run(step.id, id, step.title, step.description, step.order, step.status);
    }
  });
  tx();

  return getOperationById(id);
}

// --- Assignments ---

export function getAssignments(): Assignment[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM assignments").all() as Array<Record<string, unknown>>;
  return rows.map(rowToAssignment);
}

export function getAssignmentById(id: string): Assignment | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM assignments WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToAssignment(row) : undefined;
}

export function addAssignment(assignment: Assignment): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO assignments (id, operationId, workerId, currentStepIndex, status, startedAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    assignment.id,
    assignment.operationId,
    assignment.workerId,
    assignment.currentStepIndex,
    assignment.status,
    assignment.startedAt,
    assignment.completedAt ?? null
  );
}

export function findAssignment(
  operationId: string,
  workerId: string
): Assignment | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM assignments WHERE operationId = ? AND workerId = ?")
    .get(operationId, workerId) as Record<string, unknown> | undefined;
  return row ? rowToAssignment(row) : undefined;
}

export function updateAssignment(
  id: string,
  updater: (a: Assignment) => Assignment
): Assignment | undefined {
  const current = getAssignmentById(id);
  if (!current) return undefined;

  const updated = updater(current);
  const db = getDb();
  db.prepare(
    "UPDATE assignments SET currentStepIndex = ?, status = ?, completedAt = ? WHERE id = ?"
  ).run(updated.currentStepIndex, updated.status, updated.completedAt ?? null, id);

  return updated;
}

// --- Notifications ---

export function getNotificationsByUser(userId: string): Notification[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC")
    .all(userId) as Array<Record<string, unknown>>;
  return rows.map(rowToNotification);
}

export function addNotification(notification: Notification): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO notifications (id, userId, message, read, createdAt) VALUES (?, ?, ?, ?, ?)"
  ).run(notification.id, notification.userId, notification.message, notification.read ? 1 : 0, notification.createdAt);
}

export function markNotificationRead(id: string): Notification | undefined {
  const db = getDb();
  const result = db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(id);
  if (result.changes === 0) return undefined;

  const row = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToNotification(row) : undefined;
}
