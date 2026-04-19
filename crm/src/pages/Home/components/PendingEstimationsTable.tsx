import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Row } from "@tanstack/react-table";
import { Link2, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/store/dialogStore";

import { DataTable } from "@/components/table/data-table";
import { useDataTableLogic } from "@/components/table/hooks/useDataTableLogic";
import { DataTableColumnDef } from "@/components/table/utils/table-filters";
import { BoqBcsTaskExport } from "../../BOQS/components/BoqBcsTaskExport";

import {
  isDueToday,
  isOverdue,
  getStatusPillClass,
} from "./EstimationsReviewTable";

interface CRMProjectEstimation {
  name: string;
  parent_project?: string;
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
  modified?: string;
}

interface CRMProject {
  name: string;
  boq_name?: string;
  company?: string;
}

type EstimationRow = CRMProjectEstimation & {
  project_name: string;
  company: string;
  task_name: string;
  assigned_to_name: string;
};

interface PendingEstimationsTableProps {
  items: CRMProjectEstimation[];
  projectMap: Map<string, CRMProject>;
  userNameMap: Map<string, string>;
  isEstimationsTeam?: boolean;
  title?: string;
}

const toFacetOptions = (values: Iterable<string>) =>
  Array.from(new Set(Array.from(values).filter(Boolean))).map((v) => ({
    label: v,
    value: v,
  }));

const INITIAL_SORTING = [{ id: "modified", desc: true }] as const;
const SEARCHABLE_KEYS = [
  "project_name",
  "company",
  "task_name",
  "document_type",
  "assigned_to_name",
  "remarks",
  "status",
  "sub_status",
] as const;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "--";

export const PendingEstimationsTable = ({
  items,
  projectMap,
  userNameMap,
  isEstimationsTeam,
  title,
}: PendingEstimationsTableProps) => {
  const { openEditProjectEstimationDialog } = useDialogStore();

  const rows = useMemo<EstimationRow[]>(() => {
    return (items || []).map((item) => {
      const project = projectMap.get(item.parent_project || "");
      return {
        ...item,
        project_name: project?.boq_name || item.parent_project || "--",
        company: project?.company || "",
        task_name: item.package_name || item.title || "--",
        assigned_to_name: item.assigned_to
          ? userNameMap.get(item.assigned_to) || item.assigned_to
          : "Unassigned",
      };
    });
  }, [items, projectMap, userNameMap]);

  const projectOptions = useMemo(
    () => toFacetOptions(rows.map((r) => r.project_name)),
    [rows]
  );
  const companyOptions = useMemo(
    () => toFacetOptions(rows.map((r) => r.company)),
    [rows]
  );
  const taskNameOptions = useMemo(
    () => toFacetOptions(rows.map((r) => r.task_name)),
    [rows]
  );
  const typeOptions = useMemo(
    () => toFacetOptions(rows.map((r) => r.document_type || "")),
    [rows]
  );
  const assignedOptions = useMemo(
    () => toFacetOptions(rows.map((r) => r.assigned_to_name)),
    [rows]
  );
  const statusOptions = useMemo(
    () => toFacetOptions(rows.map((r) => r.status || "")),
    [rows]
  );
  const subStatusOptions = useMemo(
    () => toFacetOptions(rows.map((r) => r.sub_status || "")),
    [rows]
  );

  const columns = useMemo<DataTableColumnDef<EstimationRow>[]>(() => {
    const base: DataTableColumnDef<EstimationRow>[] = [
      {
        accessorKey: "project_name",
        meta: {
          title: "Project Name",
          filterVariant: "select",
          filterOptions: projectOptions,
          enableSorting: true,
        },
        cell: ({ row }) =>
          row.original.parent_project ? (
            <Link
              to={`/boqs/boq?id=${row.original.parent_project}`}
              className="text-primary font-semibold hover:underline text-left block truncate"
              title={row.original.project_name}
            >
              {row.original.project_name}
            </Link>
          ) : (
            <span>--</span>
          ),
        filterFn: "faceted" as any,
      },
      {
        accessorKey: "company",
        meta: {
          title: "Company Name",
          filterVariant: "select",
          filterOptions: companyOptions,
          enableSorting: true,
        },
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 truncate" title={row.original.company}>
            {row.original.company || "--"}
          </span>
        ),
        filterFn: "faceted" as any,
      },
      {
        accessorKey: "task_name",
        meta: {
          title: "Task Name",
          filterVariant: "select",
          filterOptions: taskNameOptions,
          enableSorting: true,
        },
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 truncate" title={row.original.task_name}>
            {row.original.task_name}
          </span>
        ),
        filterFn: "faceted" as any,
      },
      {
        accessorKey: "document_type",
        meta: {
          title: "Type",
          filterVariant: "select",
          filterOptions: typeOptions,
          enableSorting: true,
        },
        cell: ({ row }) => (
          <span className="text-xs font-semibold uppercase text-blue-700">
            {row.original.document_type || "--"}
          </span>
        ),
        filterFn: "faceted" as any,
      },
      {
        accessorKey: "assigned_to_name",
        meta: {
          title: "Assigned",
          filterVariant: "select",
          filterOptions: assignedOptions,
          enableSorting: true,
        },
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 truncate" title={row.original.assigned_to_name}>
            {row.original.assigned_to_name}
          </span>
        ),
        filterFn: "faceted" as any,
      },
      {
        accessorKey: "remarks",
        meta: { title: "Remarks", enableSorting: false },
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 truncate" title={row.original.remarks || ""}>
            {row.original.remarks || "--"}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "deadline",
        meta: { title: "Deadline", filterVariant: "date", enableSorting: true },
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{formatDate(row.original.deadline)}</span>
        ),
        filterFn: "dateRange" as any,
      },
      {
        accessorKey: "link",
        meta: { title: "Link", enableSorting: false },
        cell: ({ row }) =>
          row.original.link ? (
            <a
              href={row.original.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span className="text-xs">Open</span>
            </a>
          ) : (
            <span className="text-gray-400">--</span>
          ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        meta: {
          title: "Status",
          filterVariant: "select",
          filterOptions: statusOptions,
          enableSorting: true,
        },
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex rounded px-2 py-1 text-xs font-semibold",
              getStatusPillClass(row.original.status)
            )}
          >
            {row.original.status || "--"}
          </span>
        ),
        filterFn: "faceted" as any,
      },
      {
        accessorKey: "sub_status",
        meta: {
          title: "Sub-Status",
          filterVariant: "select",
          filterOptions: subStatusOptions,
          enableSorting: true,
        },
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.sub_status || "--"}</span>
        ),
        filterFn: "faceted" as any,
      },
      {
        accessorKey: "modified",
        meta: { title: "Last Updated", filterVariant: "date", enableSorting: true },
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{formatDate(row.original.modified)}</span>
        ),
        filterFn: "dateRange" as any,
      },
    ];

    if (isEstimationsTeam) {
      base.push({
        id: "actions",
        meta: { title: "Action", enableSorting: false, excludeFromExport: true },
        cell: ({ row }) =>
          !row.original.name.startsWith("legacy-") ? (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditProjectEstimationDialog({ estimationData: row.original });
                }}
                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              >
                <SquarePen className="w-4 h-4" />
              </Button>
            </div>
          ) : null,
        enableSorting: false,
        enableColumnFilter: false,
      });
    }

    return base;
  }, [
    projectOptions,
    companyOptions,
    taskNameOptions,
    typeOptions,
    assignedOptions,
    statusOptions,
    subStatusOptions,
    isEstimationsTeam,
    openEditProjectEstimationDialog,
  ]);

  const tableLogic = useDataTableLogic<EstimationRow>({
    data: rows,
    columns,
    initialSorting: INITIAL_SORTING as any,
    customGlobalFilterFn: SEARCHABLE_KEYS as unknown as string[],
  });

  const gridColsClass = isEstimationsTeam
    ? "md:grid-cols-[1.2fr_minmax(100px,1fr)_1fr_0.7fr_0.9fr_1.1fr_0.9fr_0.7fr_0.9fr_0.9fr_0.9fr_60px] md:gap-x-2 md:pl-2"
    : "md:grid-cols-[1.2fr_minmax(100px,1fr)_1fr_0.7fr_0.9fr_1.1fr_0.9fr_0.7fr_0.9fr_0.9fr_0.9fr] md:gap-x-2 md:pl-2";

  const getRowClassName = (row: Row<EstimationRow>) => {
    if (isOverdue(row.original.deadline, row.original.status))
      return "bg-red-50 hover:bg-red-100/50";
    if (isDueToday(row.original.deadline, row.original.status))
      return "bg-yellow-50 hover:bg-yellow-100/50";
    return "";
  };

  const renderToolbarActions = (filteredData: EstimationRow[]) =>
    title ? (
      <BoqBcsTaskExport
        data={filteredData as any}
        customFileName={`${title.replace(/\s+/g, "_")}_Export`}
      />
    ) : null;

  return (
    <DataTable<EstimationRow>
      tableLogic={tableLogic}
      isLoading={false}
      gridColsClass={gridColsClass}
      headerTitle={title}
      globalSearchPlaceholder="Search estimations..."
      noResultsMessage="No BOQ/BCS rows found."
      getRowClassName={getRowClassName}
      renderToolbarActions={renderToolbarActions}
      minWidth="1200px"
      containerClassName="max-h-none"
    />
  );
};
