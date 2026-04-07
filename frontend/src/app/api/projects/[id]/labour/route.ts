import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

/**
 * GET /api/projects/[id]/labour
 * Returns labour summary for a project:
 * - All workers ever assigned (active + past)
 * - Per-worker attendance days marked on THIS project
 * - Per-worker cost (days × dailyRate)
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  const store = readStore();

  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // All assignments for this project
  const assignments = store.assignments.filter((a) => a.projectId === projectId);

  // Build per-worker summary
  const workerIds = Array.from(new Set(assignments.map((a) => a.workerId)));

  const summary = workerIds.map((wid) => {
    const worker = store.workers.find((w) => w.id === wid);
    const assignment = assignments.find((a) => a.workerId === wid);

    // Attendance records linked to THIS specific project
    const projectAttendance = store.attendance.filter(
      (a) => a.workerId === wid && a.projectId === projectId && a.present
    );

    // Also include attendance marked generally (projectId === 0) for dates
    // when the worker was assigned here and had no other project attendance
    // that day — treated as "worked here if no other project"
    const generalAttendance = store.attendance.filter((a) => {
      if (a.workerId !== wid || !a.present || a.projectId !== 0) return false;
      // Worker was actively assigned to this project on that date
      const asgn = assignments.find(
        (as) => as.workerId === wid &&
        as.projectId === projectId &&
        as.startDate <= a.date &&
        (!as.endDate || as.endDate >= a.date)
      );
      return !!asgn;
    });

    const allDays = Array.from(new Set([
      ...projectAttendance.map((a) => a.date),
      ...generalAttendance.map((a) => a.date),
    ])).sort();

    const daysWorked = allDays.length;
    const dailyRate = worker?.dailyRate ?? 0;
    const totalCost = daysWorked * dailyRate;

    return {
      workerId: wid,
      workerName: worker?.name ?? assignment?.workerName ?? "Unknown",
      workerTrade: worker?.trade ?? assignment?.workerTrade ?? "",
      phone: worker?.phone ?? "",
      dailyRate,
      isActive: !assignment?.endDate,
      startDate: assignment?.startDate ?? "",
      endDate: assignment?.endDate ?? "",
      daysWorked,
      totalCost,
      attendanceDates: allDays,
    };
  });

  return NextResponse.json({
    projectId,
    projectName: project.name,
    workers: summary,
    totalDays: summary.reduce((s, w) => s + w.daysWorked, 0),
    totalCost: summary.reduce((s, w) => s + w.totalCost, 0),
  });
}
