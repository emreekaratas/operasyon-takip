import {
  getOperations,
  getAssignments,
  getUsers,
} from "@/lib/store";

export function GET() {
  const operations = getOperations();
  const assignments = getAssignments();
  const users = getUsers();
  const workers = users.filter((u) => u.role === "worker");

  const totalOperations = operations.length;
  const activeOperations = operations.filter((o) => o.status === "active").length;
  const completedOperations = operations.filter((o) => o.status === "completed").length;
  const draftOperations = operations.filter((o) => o.status === "draft").length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyCompleted = assignments.filter(
    (a) =>
      a.status === "completed" &&
      a.completedAt &&
      new Date(a.completedAt) >= sevenDaysAgo
  ).length;

  const workerStats = workers.map((worker) => {
    const workerAssignments = assignments.filter(
      (a) => a.workerId === worker.id
    );
    const activeCount = workerAssignments.filter(
      (a) => a.status === "active"
    ).length;
    const completedCount = workerAssignments.filter(
      (a) => a.status === "completed"
    ).length;

    let totalProgress = 0;
    let assignmentCount = 0;
    for (const assignment of workerAssignments) {
      const op = operations.find((o) => o.id === assignment.operationId);
      if (!op || op.steps.length === 0) continue;
      assignmentCount++;
      const completed =
        assignment.status === "completed"
          ? op.steps.length
          : assignment.currentStepIndex;
      totalProgress += Math.round((completed / op.steps.length) * 100);
    }

    const averageProgress =
      assignmentCount > 0 ? Math.round(totalProgress / assignmentCount) : 0;

    return {
      workerId: worker.id,
      workerName: worker.name,
      activeAssignments: activeCount,
      completedAssignments: completedCount,
      averageProgress,
    };
  });

  return Response.json({
    totalOperations,
    activeOperations,
    completedOperations,
    draftOperations,
    recentlyCompletedAssignments: recentlyCompleted,
    workerStats,
  });
}
