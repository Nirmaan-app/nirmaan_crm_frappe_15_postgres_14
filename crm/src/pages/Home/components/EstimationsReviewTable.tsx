import React, { useEffect, useMemo, useState } from "react";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronDown, ChevronRight, Link2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDateWithOrdinal } from "@/utils/FormatDate";

type StatusTab = "ALL" | "WIP" | "PENDING" | "COMPLETED";

interface CRMProjectEstimation {
  name: string;
  parent_project: string;
  title?: string;
  package_name?: string;
  document_type?: string;
  value?: number;
  link?: string;
  status?: string;
  sub_status?: string;
  deadline?: string;
  remarks?: string;
  assigned_to?: string;
  creation?: string;
}

interface CRMProject {
  name: string;
  boq_name?: string;
  boq_status?: string;
  boq_value?: number;
  boq_submission_date?: string;
  boq_link?: string;
  remarks?: string;
  assigned_estimations?: string;
  creation?: string;
}

interface CRMUser {
  name: string;
  full_name?: string;
  nirmaan_role_name?: string;
}

interface SummaryRow {
  key: string;
  label: string;
  assignee: string | null;
  activeProjects: number;
  totalTasks: number;
  overdue: number;
  isTeam?: boolean;
  isUnassigned?: boolean;
}

interface ProjectSummary {
  projectId: string;
  projectName: string;
  status: string;
  totalValue: number;
  tasks: number;
  overdue: number;
}

const TEAM_KEY = "__TEAM__";
const UNASSIGNED_KEY = "__UNASSIGNED__";
const ESTIMATION_REVIEW_PROJECT_STATUSES = new Set(["new", "in progress", "negotiation"]);

const STATUS_TABS: Array<{ label: string; value: StatusTab }> = [
  { label: "ALL", value: "ALL" },
  { label: "WIP", value: "WIP" },
  { label: "PENDING", value: "PENDING" },
  { label: "COMPLETED", value: "COMPLETED" },
];

const COMPLETED_STATUSES = new Set([
  "done",
  "boq submitted",
  "revision submitted",
]);

const WIP_STATUSES = new Set([
  "in progress",
  "in-progress",
  "partial boq submitted",
]);

const PENDING_STATUSES = new Set([
  "revision pending",
  "hold",
]);

const normalizeStatus = (status?: string) =>
  (status || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isCompletedStatus = (status?: string) => {
  const normalized = normalizeStatus(status);
  return COMPLETED_STATUSES.has(normalized);
};

const matchesStatusTab = (status: string | undefined, tab: StatusTab) => {
  const normalized = normalizeStatus(status);

  if (tab === "ALL") {
    return normalized !== "not applicable";
  }

  if (tab === "COMPLETED") {
    return COMPLETED_STATUSES.has(normalized);
  }

  if (tab === "WIP") {
    return WIP_STATUSES.has(normalized);
  }

  if (tab === "PENDING") {
    return PENDING_STATUSES.has(normalized);
  }

  return true;
};

const formatCount = (count: number) => String(count).padStart(2, "0");

const formatValue = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "--";
  return `INR ${Number(value).toFixed(2)} L`;
};

const isOverdue = (deadline?: string, status?: string) => {
  if (!deadline || isCompletedStatus(status)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(deadline);
  if (Number.isNaN(dueDate.getTime())) return false;

  dueDate.setHours(0, 0, 0, 0);
  return dueDate.getTime() < today.getTime();
};

const getStatusPillClass = (status?: string) => {
  const normalized = normalizeStatus(status);

  if (COMPLETED_STATUSES.has(normalized)) {
    return "bg-green-50 text-green-700 border border-green-100";
  }

  if (WIP_STATUSES.has(normalized)) {
    return "bg-blue-50 text-blue-700 border border-blue-100";
  }

  if (PENDING_STATUSES.has(normalized)) {
    return "bg-yellow-50 text-yellow-700 border border-yellow-100";
  }

  return "bg-gray-100 text-gray-700 border border-gray-200";
};

const CountButton = ({
  count,
  tone,
  onClick,
  isActive,
  disabled = false,
}: {
  count: number;
  tone: "active" | "tasks" | "overdue";
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
}) => {
  const toneClass =
    tone === "active"
      ? "text-amber-700 border-amber-300 bg-amber-50"
      : tone === "tasks"
        ? "text-blue-700 border-blue-300 bg-blue-50"
        : "text-gray-700 border-gray-300 bg-gray-50";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-7 min-w-[38px] rounded-md border px-2 text-xs font-semibold transition",
        toneClass,
        isActive && "ring-2 ring-offset-1 ring-destructive/40",
        disabled && "cursor-default opacity-80"
      )}
      title={tone === "active" ? "View active projects" : tone === "tasks" ? "View BOQ/BCS tasks" : "Overdue tasks"}
    >
      {formatCount(count)}
    </button>
  );
};

export const EstimationsReviewTable = () => {
  const [statusTab, setStatusTab] = useState<StatusTab>("ALL");
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);
  const [expandedMode, setExpandedMode] = useState<"projects" | "tasks" | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Role-based access
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userId") || "";
  const isEstimationLead =
    role === "Nirmaan Estimations lead Profile" ||
    role === "Nirmaan Estimations Lead Profile" ||
    role === "Nirmaan Admin User Profile";

  const { data: estimations, isLoading: estimationsLoading } = useFrappeGetDocList<CRMProjectEstimation>(
    "CRM Project Estimation",
    {
      fields: [
        "name",
        "parent_project",
        "title",
        "package_name",
        "document_type",
        "value",
        "link",
        "status",
        "sub_status",
        "deadline",
        "remarks",
        "assigned_to",
        "creation",
      ],
      limit: 0,
    },
    "home-estimation-review-estimations"
  );

  const { data: projects, isLoading: projectsLoading } = useFrappeGetDocList<CRMProject>(
    "CRM BOQ",
    {
      fields: ["name", "boq_name", "boq_status", "boq_value", "boq_submission_date", "boq_link", "remarks", "assigned_estimations", "creation"],
      limit: 0,
    },
    "home-estimation-review-projects"
  );

  const { data: teamUsers, isLoading: usersLoading } = useFrappeGetDocList<CRMUser>(
    "CRM Users",
    {
      fields: ["name", "full_name", "nirmaan_role_name"],
      filters: [["nirmaan_role_name", "in", ["Nirmaan Estimations User Profile", "Nirmaan Estimates User Profile", "Nirmaan Estimations lead Profile", "Nirmaan Estimations Lead Profile"]]],
      limit: 0,
    },
    "home-estimation-review-users",
    {
      // Prevent recurring retries if a role cannot read CRM Users.
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    setExpandedRowKey(null);
    setExpandedMode(null);
    setExpandedProjectId(null);
  }, [statusTab]);

  const projectMap = useMemo(() => {
    const map = new Map<string, CRMProject>();
    (projects || []).forEach((project) => {
      map.set(project.name, project);
    });
    return map;
  }, [projects]);

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (teamUsers || []).forEach((user) => {
      map.set(user.name, user.full_name || user.name);
    });
    return map;
  }, [teamUsers]);

  const eligibleProjectIds = useMemo(() => {
    const ids = new Set<string>();
    (projects || []).forEach((project) => {
      if (ESTIMATION_REVIEW_PROJECT_STATUSES.has(normalizeStatus(project.boq_status))) {
        ids.add(project.name);
      }
    });
    return ids;
  }, [projects]);

  const allEstimationRows = useMemo(() => {
    const currentEstimations = (estimations || []).filter((item) =>
      item.parent_project ? eligibleProjectIds.has(item.parent_project) : false
    );
    const projectIdsWithEstimations = new Set(
      currentEstimations
        .map((item) => item.parent_project)
        .filter((projectId): projectId is string => !!projectId)
    );

    // Legacy BOQ projects may not have child CRM Project Estimation rows.
    // Add one synthetic BOQ row so they appear in Estimations Review.
    const legacyRows: CRMProjectEstimation[] = (projects || [])
      .filter((project) => eligibleProjectIds.has(project.name) && !projectIdsWithEstimations.has(project.name))
      .map((project) => ({
        name: `legacy-${project.name}`,
        parent_project: project.name,
        title: project.boq_name || project.name,
        package_name: project.boq_name || "Legacy BOQ",
        document_type: "BOQ",
        value: Number(project.boq_value) || 0,
        link: project.boq_link,
        status: project.boq_status,
        sub_status: undefined,
        deadline: project.boq_submission_date,
        remarks: project.remarks,
        assigned_to: project.assigned_estimations,
        creation: project.creation,
      }));

    return [...currentEstimations, ...legacyRows];
  }, [estimations, projects, eligibleProjectIds]);

  // For non-lead users, scope to only their own tasks + unassigned
  const visibleEstimationRows = useMemo(() => {
    if (isEstimationLead) return allEstimationRows;
    return allEstimationRows.filter((item) => {
      const assignee = (item.assigned_to || "").trim();
      return assignee === userEmail || assignee === "";
    });
  }, [allEstimationRows, isEstimationLead, userEmail]);

  const filteredEstimations = useMemo(
    () => visibleEstimationRows.filter((item) => matchesStatusTab(item.status, statusTab)),
    [visibleEstimationRows, statusTab]
  );

  const summaryRows = useMemo(() => {
    const accumulators = new Map<
      string,
      {
        key: string;
        label: string;
        assignee: string | null;
        projectIds: Set<string>;
        totalTasks: number;
        overdue: number;
        isTeam?: boolean;
        isUnassigned?: boolean;
      }
    >();

    const sortedUsers = [...(teamUsers || [])].sort((a, b) =>
      (a.full_name || a.name).localeCompare(b.full_name || b.name)
    );

    sortedUsers.forEach((user) => {
      accumulators.set(user.name, {
        key: user.name,
        label: user.full_name || user.name,
        assignee: user.name,
        projectIds: new Set<string>(),
        totalTasks: 0,
        overdue: 0,
      });
    });

    filteredEstimations.forEach((item) => {
      const assignee = (item.assigned_to || "").trim() || UNASSIGNED_KEY;

      if (!accumulators.has(assignee)) {
        accumulators.set(assignee, {
          key: assignee,
          label: assignee === UNASSIGNED_KEY ? "Unassigned" : userNameMap.get(assignee) || assignee,
          assignee: assignee === UNASSIGNED_KEY ? UNASSIGNED_KEY : assignee,
          projectIds: new Set<string>(),
          totalTasks: 0,
          overdue: 0,
          isUnassigned: assignee === UNASSIGNED_KEY,
        });
      }

      const row = accumulators.get(assignee);
      if (!row) return;

      if (item.parent_project) {
        row.projectIds.add(item.parent_project);
      }

      row.totalTasks += 1;
      if (isOverdue(item.deadline, item.status)) {
        row.overdue += 1;
      }
    });

    const teamRow: SummaryRow = {
      key: TEAM_KEY,
      label: "Estimations Team",
      assignee: null,
      activeProjects: new Set(filteredEstimations.map((item) => item.parent_project).filter(Boolean)).size,
      totalTasks: filteredEstimations.length,
      overdue: filteredEstimations.filter((item) => isOverdue(item.deadline, item.status)).length,
      isTeam: true,
    };

    const rows: SummaryRow[] = [...accumulators.values()]
      .filter((item) => item.key !== UNASSIGNED_KEY)
      .map((item) => ({
        key: item.key,
        label: item.label,
        assignee: item.assignee,
        activeProjects: item.projectIds.size,
        totalTasks: item.totalTasks,
        overdue: item.overdue,
      }));

    const unassignedAccumulator = accumulators.get(UNASSIGNED_KEY);
    if (unassignedAccumulator) {
      rows.push({
        key: UNASSIGNED_KEY,
        label: "Unassigned",
        assignee: UNASSIGNED_KEY,
        activeProjects: unassignedAccumulator.projectIds.size,
        totalTasks: unassignedAccumulator.totalTasks,
        overdue: unassignedAccumulator.overdue,
        isUnassigned: true,
      });
    }

    return [teamRow, ...rows];
  }, [filteredEstimations, teamUsers, userNameMap]);

  // For non-lead users, filter summary rows to only show their own row + unassigned
  const visibleSummaryRows = useMemo(() => {
    if (isEstimationLead) return summaryRows;
    return summaryRows.filter(
      (row) => row.assignee === userEmail || row.isUnassigned
    );
  }, [summaryRows, isEstimationLead, userEmail]);

  const expandedRow = useMemo(
    () => summaryRows.find((row) => row.key === expandedRowKey) || null,
    [summaryRows, expandedRowKey]
  );

  const scopedEstimations = useMemo(() => {
    if (!expandedRow) return [] as CRMProjectEstimation[];

    if (expandedRow.assignee === null) {
      return filteredEstimations;
    }

    if (expandedRow.assignee === UNASSIGNED_KEY) {
      return filteredEstimations.filter((item) => !(item.assigned_to || "").trim());
    }

    return filteredEstimations.filter((item) => (item.assigned_to || "").trim() === expandedRow.assignee);
  }, [expandedRow, filteredEstimations]);

  const projectSummaries = useMemo(() => {
    const grouped = new Map<string, CRMProjectEstimation[]>();

    scopedEstimations.forEach((item) => {
      const projectId = item.parent_project;
      if (!projectId) return;
      if (!grouped.has(projectId)) {
        grouped.set(projectId, []);
      }
      grouped.get(projectId)?.push(item);
    });

    const summaries: ProjectSummary[] = Array.from(grouped.entries()).map(([projectId, items]) => {
      const project = projectMap.get(projectId);
      const derivedValue = items.reduce((acc, item) => acc + (Number(item.value) || 0), 0);

      return {
        projectId,
        projectName: project?.boq_name || projectId,
        status: project?.boq_status || "--",
        totalValue:
          project?.boq_value !== undefined && project?.boq_value !== null
            ? Number(project.boq_value)
            : derivedValue,
        tasks: items.length,
        overdue: items.filter((item) => isOverdue(item.deadline, item.status)).length,
      };
    });

    return summaries.sort((a, b) => a.projectName.localeCompare(b.projectName));
  }, [projectMap, scopedEstimations]);

  const expandedProjectTasks = useMemo(() => {
    if (!expandedProjectId) return [] as CRMProjectEstimation[];
    return scopedEstimations.filter((item) => item.parent_project === expandedProjectId);
  }, [expandedProjectId, scopedEstimations]);

  const toggleExpansion = (row: SummaryRow, mode: "projects" | "tasks") => {
    const isSame = expandedRowKey === row.key && expandedMode === mode;
    if (isSame) {
      setExpandedRowKey(null);
      setExpandedMode(null);
      setExpandedProjectId(null);
      return;
    }

    setExpandedRowKey(row.key);
    setExpandedMode(mode);
    setExpandedProjectId(null);
  };

  const renderTaskTable = (items: CRMProjectEstimation[], showProjectName: boolean) => {
    if (items.length === 0) {
      return (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          No BOQ/BCS rows found.
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                {showProjectName && <th className="px-3 py-2 text-left">Project Name</th>}
                <th className="px-3 py-2 text-left">Task Name</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Assigned</th>
                <th className="px-3 py-2 text-left">Remarks</th>
                <th className="px-3 py-2 text-left">Deadline</th>
                <th className="px-3 py-2 text-left">Link</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Sub-Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.name} className="align-top">
                  {showProjectName && (
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {projectMap.get(item.parent_project || "")?.boq_name || item.parent_project || "--"}
                    </td>
                  )}
                  <td className="px-3 py-2 text-sm text-gray-900">{item.package_name || item.title || "--"}</td>
                  <td className="px-3 py-2 text-xs font-semibold uppercase text-blue-700">{item.document_type || "--"}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    {item.assigned_to ? userNameMap.get(item.assigned_to) || item.assigned_to : "Unassigned"}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{item.remarks || "--"}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    {item.deadline ? formatDateWithOrdinal(item.deadline) : "--"}
                  </td>
                  <td className="px-3 py-2">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Open</span>
                      </a>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex rounded px-2 py-1 text-xs font-semibold", getStatusPillClass(item.status))}>
                      {item.status || "--"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{item.sub_status || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (estimationsLoading || projectsLoading || usersLoading) {
    return (
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
        {isEstimationLead ? "Team Task Allocation Overview" : "My Task Overview"}
      </div>

      <div className="flex flex-wrap gap-2 rounded-md bg-gray-100 p-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusTab(tab.value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              statusTab === tab.value
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-destructive"
                : "text-gray-500 hover:bg-white/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Team Member</th>
                <th className="px-4 py-3 text-center">Active Projects</th>
                <th className="px-4 py-3 text-center">Total Tasks</th>
                <th className="px-4 py-3 text-center">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleSummaryRows.map((row) => {
                const showExpansion = expandedRowKey === row.key;
                const isProjectExpanded = showExpansion && expandedMode === "projects";
                const isTasksExpanded = showExpansion && expandedMode === "tasks";

                return (
                  <React.Fragment key={row.key}>
                    <tr className={cn("hover:bg-gray-50", row.isUnassigned && "bg-amber-50/40")}> 
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          {row.isTeam ? (
                            <>
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">ET</span>
                              <span>{row.label}</span>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                                {(row.label || "U").slice(0, 2).toUpperCase()}
                              </span>
                              <span>{row.label}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CountButton
                          count={row.activeProjects}
                          tone="active"
                          isActive={isProjectExpanded}
                          onClick={() => toggleExpansion(row, "projects")}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CountButton
                          count={row.totalTasks}
                          tone="tasks"
                          isActive={isTasksExpanded}
                          onClick={() => toggleExpansion(row, "tasks")}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CountButton
                          count={row.overdue}
                          tone="overdue"
                          isActive={false}
                          onClick={() => undefined}
                          disabled={true}
                        />
                      </td>
                    </tr>

                    {showExpansion && (
                      <tr className="bg-gray-50/60">
                        <td colSpan={4} className="px-4 py-4">
                          {expandedMode === "projects" ? (
                            <div className="space-y-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {row.label} - Active Projects
                              </div>

                              {projectSummaries.length === 0 ? (
                                <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                                  No active projects found.
                                </div>
                              ) : (
                                <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px] text-sm">
                                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                          <th className="px-3 py-2 text-left">Project Name</th>
                                          <th className="px-3 py-2 text-left">Status</th>
                                          <th className="px-3 py-2 text-left">Total Value</th>
                                          <th className="px-3 py-2 text-left">Tasks</th>
                                          <th className="px-3 py-2 text-left">Overdue</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {projectSummaries.map((project) => {
                                          const isOpen = expandedProjectId === project.projectId;

                                          return (
                                            <React.Fragment key={project.projectId}>
                                              <tr
                                                onClick={() =>
                                                  setExpandedProjectId((prev) =>
                                                    prev === project.projectId ? null : project.projectId
                                                  )
                                                }
                                                className="cursor-pointer hover:bg-gray-50"
                                              >
                                                <td className="px-3 py-2 font-medium text-gray-900">
                                                  <div className="flex items-center gap-2">
                                                    {isOpen ? (
                                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                                    ) : (
                                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                                    )}
                                                    {project.projectName}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                  <span className={cn("inline-flex rounded px-2 py-1 text-xs font-semibold", getStatusPillClass(project.status))}>
                                                    {project.status || "--"}
                                                  </span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">{formatValue(project.totalValue)}</td>
                                                <td className="px-3 py-2 text-gray-700">{project.tasks} Total</td>
                                                <td className="px-3 py-2 text-red-600">{project.overdue} Task</td>
                                              </tr>

                                              {isOpen && (
                                                <tr>
                                                  <td colSpan={5} className="px-3 py-3 bg-gray-50">
                                                    {renderTaskTable(expandedProjectTasks, false)}
                                                  </td>
                                                </tr>
                                              )}
                                            </React.Fragment>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {row.label} - BOQ/BCS Tasks
                              </div>
                              {renderTaskTable(scopedEstimations, true)}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstimationsReviewTable;
