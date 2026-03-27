import { User, Operation, Assignment, Notification } from "@/types";

const SEED_USERS: User[] = [
  { id: "m1", name: "Ahmet Yılmaz", role: "manager" },
  { id: "w1", name: "Mehmet Kaya", role: "worker" },
  { id: "w2", name: "Ayşe Demir", role: "worker" },
  { id: "w3", name: "Fatma Çelik", role: "worker" },
];

interface Store {
  users: User[];
  operations: Operation[];
  assignments: Assignment[];
  notifications: Notification[];
}

const store: Store = {
  users: [...SEED_USERS],
  operations: [],
  assignments: [],
  notifications: [],
};

export function getUsers(): User[] {
  return store.users;
}

export function getUserById(id: string): User | undefined {
  return store.users.find((u) => u.id === id);
}

export function getOperations(): Operation[] {
  return store.operations;
}

export function getOperationById(id: string): Operation | undefined {
  return store.operations.find((o) => o.id === id);
}

export function addOperation(op: Operation): void {
  store.operations.push(op);
}

export function deleteOperation(id: string): boolean {
  const index = store.operations.findIndex((o) => o.id === id);
  if (index === -1) return false;
  store.operations.splice(index, 1);
  store.assignments = store.assignments.filter((a) => a.operationId !== id);
  return true;
}

export function getAssignments(): Assignment[] {
  return store.assignments;
}

export function getAssignmentById(id: string): Assignment | undefined {
  return store.assignments.find((a) => a.id === id);
}

export function addAssignment(assignment: Assignment): void {
  store.assignments.push(assignment);
}

export function findAssignment(
  operationId: string,
  workerId: string
): Assignment | undefined {
  return store.assignments.find(
    (a) => a.operationId === operationId && a.workerId === workerId
  );
}

export function updateAssignment(
  id: string,
  updater: (a: Assignment) => Assignment
): Assignment | undefined {
  const index = store.assignments.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  store.assignments[index] = updater(store.assignments[index]);
  return store.assignments[index];
}

export function updateOperation(
  id: string,
  updater: (o: Operation) => Operation
): Operation | undefined {
  const index = store.operations.findIndex((o) => o.id === id);
  if (index === -1) return undefined;
  store.operations[index] = updater(store.operations[index]);
  return store.operations[index];
}

export function getNotificationsByUser(userId: string): Notification[] {
  return store.notifications.filter((n) => n.userId === userId);
}

export function addNotification(notification: Notification): void {
  store.notifications.push(notification);
}

export function markNotificationRead(id: string): Notification | undefined {
  const index = store.notifications.findIndex((n) => n.id === id);
  if (index === -1) return undefined;
  store.notifications[index] = { ...store.notifications[index], read: true };
  return store.notifications[index];
}
