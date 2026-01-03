import React, { useMemo } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { ColumnFiltersState, Row } from '@tanstack/react-table';
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { useUserRoleLists } from '@/hooks/useUserRoleLists';
import { useNavigate, Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DataTableExportButton } from '@/components/table/data-table-export-button';
import { cn } from '@/lib/utils';
import { MeetingStatusCell } from '@/pages/Home/components/ExceptionReportForCompanies';

// Define the shape of the options for better type safety
interface SelectOption {
    label: string;
    value: string;
}

// import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager"; // REMOVED
interface CompanyTableOptions {
    assignedSalesOptions: SelectOption[];
    companyCityOptions: SelectOption[];
    companyPriorityOptions: SelectOption[];
    companyTypeOptions: SelectOption[];
    getUserFullNameByEmail: (email: string) => string | undefined;
}

export const useCompanyTableOptions = (companies: CRMCompany[]): CompanyTableOptions => {
    const { getUserFullNameByEmail } = useUserRoleLists();

    const options = useMemo(() => {
        if (!companies || companies.length === 0) {
            return {
                assignedSalesOptions: [],
                companyCityOptions: [],
                companyTypeOptions: [],
                companyPriorityOptions: [],
            };
        }

        const uniqueValues: { [key: string]: Set<string> } = {
            assigned_sales: new Set(),
            company_city: new Set(),
            company_type: new Set(),
            priority: new Set(),
        };

        // Single loop to gather all unique values
        companies.forEach(c => {
            c.assigned_sales && uniqueValues.assigned_sales.add(c.assigned_sales);
            c.company_city && uniqueValues.company_city.add(c.company_city);
            c.company_type && uniqueValues.company_type.add(c.company_type);
            c.priority && uniqueValues.priority.add(c.priority);
        });

        // Map Sets to the final SelectOption arrays
        const assignedSalesOptions = Array.from(uniqueValues.assigned_sales).map(email => ({
            label: getUserFullNameByEmail(email)?.split(" ")[0] || email,
            value: email,
        }));

        const companyCityOptions = Array.from(uniqueValues.company_city).map(name => ({
            label: name,
            value: name,
        }));

        const companyTypeOptions = Array.from(uniqueValues.company_type).map(name => ({
            label: name,
            value: name,
        }));

        const companyPriorityOptions = Array.from(uniqueValues.priority).map(name => ({
            label: name,
            value: name,
        }));

        return {
            assignedSalesOptions,
            companyCityOptions,
            companyTypeOptions,
            companyPriorityOptions,
        };
    }, [companies, getUserFullNameByEmail]); // Only re-run when companies or the user list changes

    return {
        ...options,
        getUserFullNameByEmail, // Also return this utility function for the main component's use
    };
};

interface CRMCompany {
  name: string;
  company_name: string;
  company_city?: string;
  company_type?: string;
  website?: string;
  assigned_sales?: string;
  priority?: string;
  last_meeting?: string;
  next_meeting_date?: string;
  next_meeting_id?: string;
  last_three_remarks_from_tasks?: string[];
  active_boq?: { }[];
  hot_boq?: { }[];
  last_30_days_boqs:{}[];
}

export const CompanyTableView = () => {
  // const { getUserFullNameByEmail } = useUserRoleLists();
  const currentUserEmail = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  const swrKey = "all-companies-list_modified";

  const { data, isLoading, error } = useFrappeGetCall<CRMCompany[]>(
    'nirmaan_crm.api.get_modified_crm_company.get_modified_crm_companies', undefined, swrKey,
  );

  const companies = data?.message || [];

  // REMOVED: useStateSyncedWithParams is no longer used
  // const [assignedSalesFilter, setAssignedSalesFilter] = useStateSyncedWithParams<string[]>...

  // const assignedSalesOptions = useMemo(() => {
  //   if (!companies || !Array.isArray(companies)) return [];
  //   const set = new Set<string>();
  //   companies.forEach(c => c.assigned_sales && set.add(c.assigned_sales));
  //   return Array.from(set).map(email => ({
  //     label: getUserFullNameByEmail(email)?.split(" ")[0] || email,
  //     value: email,
  //   }));
  // }, [companies, getUserFullNameByEmail]);

  const companyNameOptions = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];
    const set = new Set<string>();
    companies.forEach(c => c.company_name && set.add(c.company_name));
    return Array.from(set).map(name => ({ label: name, value: name }));
  }, [companies]);

  // const companyCityOptions = useMemo(() => {
  //   if (!companies || !Array.isArray(companies)) return [];
  //   const set = new Set<string>();
  //   companies.forEach(c => c.company_city && set.add(c.company_city));
  //   return Array.from(set).map(name => ({ label: name, value: name }));
  // }, [companies]);

  // const companyPriorityOptions = useMemo(() => {
  //   if (!companies || !Array.isArray(companies)) return [];
  //   const set = new Set<string>();
  //   companies.forEach(c => c.priority && set.add(c.priority));
  //   return Array.from(set).map(name => ({ label: name, value: name }));
  // }, [companies]);


  // --- 💡 CENTRALIZED HOOK REPLACEMENT ---
  
  const { 
    assignedSalesOptions, 
    companyCityOptions, 
    companyPriorityOptions, 
    companyTypeOptions,
    getUserFullNameByEmail // Destructured from the new hook
  } = useCompanyTableOptions(companies);

  const columns = useMemo<DataTableColumnDef<CRMCompany>[]>(() => [
    {
      accessorKey: "company_name",
      meta: { title: "Company Name", enableSorting: true },
      cell: ({ row }) => (
        <Link to={`/companies/company?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
          {row.original.company_name}
        </Link>
      ),
      filterFn: "faceted"
    },
    {
      accessorKey: "company_type",
      meta: { title: "Company Type", filterVariant: "select", enableSorting: true, filterOptions: companyTypeOptions },
      cell: ({ row }) => <span className='text-xs'>{row.original.company_type || '--'}</span>,
      filterFn: 'faceted',
    },
    // {
    //   accessorKey: "company_city",
    //   meta: { title: "City", filterVariant: "select", enableSorting: true, filterOptions: companyCityOptions },
    //   cell: ({ row }) => <span>{row.original.company_city || '--'}</span>,
    //   filterFn: 'faceted',
    //   enableSorting: true,
    // },
    {
      accessorKey: "assigned_sales",
      meta: {
        title: "Assigned Sales",
        filterVariant: "select",
        filterOptions: assignedSalesOptions,
        enableSorting: true
      },
      cell: ({ row }) =>
        row.original.assigned_sales
          ? getUserFullNameByEmail(row.original.assigned_sales)?.split(" ")[0] || row.original.assigned_sales
          : '--',
      filterFn: 'faceted',
      enableSorting: true,
    },
    {
      accessorKey: "priority",
      meta: { title: "Priority", enableSorting: false, filterVariant: "select", filterOptions: companyPriorityOptions },
      cell: ({ row }) => <span className='text-xs'>{row.original.priority || '--'}</span>,
      filterFn: 'faceted',
    },
    {
      accessorKey: "last_meeting",
      meta: { title: "Last Meeting", filterVariant: "date", enableSorting: true, },
      cell: ({ row }) =>

        (
                        <span className="text-xs text-muted-foreground">{row.original.last_meeting
                             ? formatDateWithOrdinal(new Date(row.original.last_meeting), 'dd-MMM-yyyy')
                             : '--'}</span>
                    ),
        // row.original.last_meeting
        //   ? formatDateWithOrdinal(new Date(row.original.last_meeting), 'dd-MMM-yyyy')
        //   : '--',
      enableSorting: true,
      filterFn: 'dateRange',
    },
    {
      accessorKey: "next_meeting_date",
      meta: { title: "Next Meeting", filterVariant: 'date', enableSorting: true, },
      cell: ({ row }) =>
         (
                        <span className="text-xs text-muted-foreground">{row.original.next_meeting_date
                             ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
                             : '--'}</span>
                    ),
        // row.original.next_meeting_date
        //   ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
        //   : '--',
      enableSorting: true,
      filterFn: 'dateRange',
    },
     {
      accessorKey: "last_meeting_in_7_days",
      meta: { title: "Meeting Done in Last Week",
        //  filterVariant: 'date', 
         enableSorting: true, },
      cell: ({ row }) =>
         (
                    
                        <div className=' text-xs'>
                          <MeetingStatusCell 
                                                                                status={row.original.last_meeting_in_7_days? 'YES' : 'NO'} 
                                                                                date={row.original.last_meeting_in_7_days}
                                                                                tooltipTitle="Last Meeting Done"
                                                                            />
                        </div>
                         
                    ),
        // row.original.next_meeting_date
        //   ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
        //   : '--',
      filterFn: 'dateRange',
    },
    {
      accessorKey: "next_meeting_in_14_days",
      meta: { title: "Meeting Scheduled for next 2 weeks",
        //  filterVariant: 'date', 
         enableSorting: true, },
      cell: ({ row }) =>{
        return (
                    
                        <div className=' text-xs'>
                          <MeetingStatusCell 
                                                                                status={row.original.next_meeting_in_14_days? 'YES' : 'NO'} 
                                                                                date={row.original.next_meeting_in_14_days}
                                                                                tooltipTitle="Next Meeting Scheduled"
                                                                            />
                        </div>
                         
                    );
      },
         
        // row.original.next_meeting_date
        //   ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
        //   : '--',
      filterFn: 'dateRange',
    },

    {
  accessorKey: "last_30_days_boqs",
  meta: { title: "BOQs (Last 30 Days)", enableSorting: false },
  cell: ({ row }) => {
    const last_30_days_boqs = row.original.last_30_days_boqs || [];
    if (last_30_days_boqs.length === 0) {
      return <div className="flex gap-1 justify-center">--</div>;
    }
    return (
      <div className="flex gap-1 justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs cursor-pointer">
                {last_30_days_boqs.length}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-wrap break-words">
               {last_30_days_boqs.map((r, i) => (
                <ol key={i} className="p-1 m-1 rounded-md list-disc">
<li>
                 <Link to={`/boqs/boq?id=${r.name}`} className="block border-gray-300 font-semibold hover:underline">
  {r.boq_name || r.name} {/* Use boq_name for display */}
</Link></li>
                </ol>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  },
},
   {
      accessorKey: "active_boq",
      meta: { title: "Active BOQs", enableSorting: false },
      cell: ({ row }) => {
        const active_boq = row.original.active_boq || [];
        if (active_boq.length === 0) {
          return <span className='flex gap-1 justify-center'>--</span>;
        }
        return (
          <div className="flex gap-1 justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs cursor-pointer">
                {active_boq.length}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-wrap break-words ">
              {active_boq.map((r, i) => (
                <ol key={i} className="p-1 m-1  rounded-md list-disc">
<li>
                 <Link to={`/boqs/boq?id=${r.name}`} className="block border-gray-300 font-semibold hover:underline">
  {r.name}
</Link></li>
                  {/* <p className="text-[8px] mt-0 pt-0 ">
                    Created: {formatDateWithOrdinal(r.creation)}
                  </p> */}
                </ol>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

        );
      },
    },
     {
      accessorKey: "hot_boq",
      meta: { title: "Hot BOQs", enableSorting: false },
      cell: ({ row }) => {
        const hot_boq = row.original.hot_boq || [];
        if (hot_boq.length === 0) {
          return <span className='flex gap-1 justify-center'>--</span>;
        }
        return (
        <div className="flex gap-1 justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs cursor-pointer">
                {hot_boq.length}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-wrap break-words">
               {hot_boq.map((r, i) => (
                <ol key={i} className="p-1 m-1  rounded-md list-disc">
<li>
                 <Link to={`/boqs/boq?id=${r.name}`} className="block border-gray-300 font-semibold hover:underline">
  {r.name}
</Link></li>
                  {/* <p className="text-[8px] mt-0 pt-0 ">
                    Created: {formatDateWithOrdinal(r.creation)}
                  </p> */}
                </ol>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

        );
      },
    },
    // --- NEW: Last 30 Days BOQs Column --

    
    // {
    //   accessorKey: "active_boq",
    //   meta: { title: "Active BOQs", enableSorting: true },
    //   cell: ({ row }) => <span>{row.original.active_boq ?? 0}</span>,
    // },
    // {
    //   accessorKey: "hot_boq",
    //   meta: { title: "Hot BOQs", enableSorting: true },
    //   cell: ({ row }) => <span>{row.original.hot_boq ?? 0}</span>,
    // },
    {
      accessorKey: "last_three_remarks_from_tasks",
      meta: { title: "Last 3 Remarks", enableSorting: false },
      cell: ({ row }) => {
        const remarks = row.original.last_three_remarks_from_tasks || [];
        if (remarks.length === 0) {
          return <span >--</span>;
        }
        return (
          <div className="flex gap-1 justify-start">
            <TooltipProvider>
              {remarks.map((r, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs cursor-pointer">
                      {i + 1}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-wrap break-words">
                    <p>{r}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        );
      },
      enableSorting: false, // Corrected to be consistent with meta
    }
  ], [companyNameOptions, companyCityOptions, assignedSalesOptions, companyPriorityOptions, getUserFullNameByEmail]);

  const initialSorting = [
    { id: 'next_meeting_date', desc: true },
    { id: 'last_meeting', desc: true }
  ];

  // 💡 MODIFIED: Calculate initial filters directly from role/email
  const initialFilters: ColumnFiltersState = useMemo(() => {
    if (currentUserEmail && role === "Nirmaan Sales User Profile") {
      return [{
        id: 'assigned_sales',
        value: [currentUserEmail],
      }];
    }
    return [];
  }, [currentUserEmail, role]);

  const tableLogic = useDataTableLogic<CRMCompany>({
    data: companies,
    columns,
    initialSorting: initialSorting,
    initialColumnFilters: initialFilters,
    customGlobalFilterFn: ['company_name', 'company_city', 'assigned_sales', 'priority'],
  });

  if (error) return <div className="text-center text-red-500 font-semibold p-4">An error occurred while loading companies.</div>;

  const renderMobileRow = (row: Row<CRMCompany>) => (
    <div className="flex flex-col p-4 border rounded-lg shadow-sm border-gray-200 hover:border-red-500 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col text-left gap-1">
          <span className="font-bold text-lg text-red-600">{row.original.company_name}</span>
          <p className="text-sm text-gray-500">City: {row.original.company_city || '--'}</p>
          <p className="text-sm">Assigned: <span className="font-medium">{getUserFullNameByEmail(row.original.assigned_sales) || '--'}</span></p>
        </div>
        <div className="flex flex-col items-end text-xs gap-1 text-gray-500">
          <span className="font-bold text-red-500">Priority: {row.original.priority || '--'}</span>
          {/* <span>Active BOQs: {row.original.active_boq || 0}</span>
          <span>Hot BOQs: {row.original.hot_boq || 0}</span> */}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Next Meeting: <span className="font-medium text-gray-600">{row.original.next_meeting_date
          ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
          : '--'}</span>
      </p>
    </div>
  );

  const companyExportFields = useMemo<DataTableColumnDef<CRMCompany>[]>(() => ([
    { accessorKey: "name", meta: { exportHeaderName: "Company ID" } },
    { accessorKey: "company_name", meta: { exportHeaderName: "Company Name" } },
    { accessorKey: "company_type", meta: { exportHeaderName: "Company Type" } },
    { accessorKey: "company_city", meta: { exportHeaderName: "City" } },
    {
      accessorKey: "assigned_sales",
      meta: {
        exportHeaderName: "Assigned Sales",
        exportValue: (row) => getUserFullNameByEmail(row.assigned_sales || '') || row.assigned_sales || ''
      }
    },
    { accessorKey: "priority", meta: { exportHeaderName: "Priority" } },
    {
      accessorKey: "last_meeting",
      meta: {
        exportHeaderName: "Last Meeting",
        exportValue: (row) => row.last_meeting ? formatDateWithOrdinal(new Date(row.last_meeting), 'dd-MMM-yyyy') : ''
      }
    },
    {
      accessorKey: "next_meeting_date",
      meta: {
        exportHeaderName: "Next Meeting",
        exportValue: (row) => row.next_meeting_date ? formatDateWithOrdinal(new Date(row.next_meeting_date), 'dd-MMM-yyyy') : ''
      }
    },
        { accessorKey: "active_boq", meta: { exportHeaderName: "Active BOQs", exportValue: (row) => row.active_boq?.length || 0 } }, // Changed exportValue to count
    { accessorKey: "hot_boq", meta: { exportHeaderName: "Hot BOQs", exportValue: (row) => row.hot_boq?.length || 0 } },         // Changed exportValue to count
    // --- MODIFIED: Export count only for Last 30 Days BOQs ---
    {
      accessorKey: "last_30_days_boqs",
      meta: {
        exportHeaderName: "BOQs (Last 30 Days)",
        exportValue: (row) => row.last_30_days_boqs?.length || 0 // Export the length (count)
      }
    },

    {
      accessorKey: "last_three_remarks_from_tasks",
      meta: {
        exportHeaderName: "Last 3 Remarks",
        exportValue: (row) => row.last_three_remarks_from_tasks?.join('; ') || ''
      }
    }
  ]), [getUserFullNameByEmail]);

  return (
    <DataTable
      tableLogic={tableLogic}
      isLoading={isLoading}
      renderMobileRow={renderMobileRow}
      headerTitle={<span>CRM Companies</span>}
      noResultsMessage="No companies found."
      globalSearchPlaceholder="Search Companies..."
      className="h-full"
      shouldExpandHeight={true}
      gridColsClass="grid-cols-[200px,125px,200px,150px,150px,150px,150px,150px,100px,100px,100px,300px]"
      minWidth="1850px"
      renderToolbarActions={(filteredData) => (
        <DataTableExportButton
          data={filteredData}
          columns={companyExportFields}
          fileName="Companies_List_Export"
        />
      )}
    />
  );
};