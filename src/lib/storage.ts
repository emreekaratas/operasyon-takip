import { User, Operation, Assignment } from "@/types";

const KEYS = {
  USERS: "op_tracker_users",
  OPERATIONS: "op_tracker_operations",
  ASSIGNMENTS: "op_tracker_assignments",
  CURRENT_USER: "op_tracker_current_user",
};

const SEED_USERS: User[] = [
  { id: "m1", name: "Ahmet Yılmaz", email: "ahmet@example.com", role: "manager" },
  { id: "w1", name: "Mehmet Kaya", email: "mehmet@example.com", role: "worker" },
  { id: "w2", name: "Ayşe Demir", email: "ayse@example.com", role: "worker" },
  { id: "w3", name: "Fatma Çelik", email: "fatma@example.com", role: "worker" },
];

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): User[] {
  const users = get<User[]>(KEYS.USERS, []);
  if (users.length === 0) {
    set(KEYS.USERS, SEED_USERS);
    return SEED_USERS;
  }
  return users;
}

export function saveUsers(users: User[]) {
  set(KEYS.USERS, users);
}

export function getCurrentUser(): User | null {
  return get<User | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null) {
  set(KEYS.CURRENT_USER, user);
}

export function getOperations(): Operation[] {
  return get<Operation[]>(KEYS.OPERATIONS, []);
}

export function saveOperations(operations: Operation[]) {
  set(KEYS.OPERATIONS, operations);
}

export function getAssignments(): Assignment[] {
  return get<Assignment[]>(KEYS.ASSIGNMENTS, []);
}

export function saveAssignments(assignments: Assignment[]) {
  set(KEYS.ASSIGNMENTS, assignments);
}
