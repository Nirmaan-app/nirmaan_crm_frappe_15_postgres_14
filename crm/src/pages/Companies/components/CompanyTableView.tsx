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

interface CRMCompany {
  name: string;
  company_name: string;
  company_city?: string;
  website?: string;
  assigned_sales?: string;
  priority?: string;
  last_meeting?: string;
  next_meeting_date?: string;
  next_meeting_id?: string;
  last_three_remarks_from_tasks?: string[];
  active_boq?: number;
  hot_boq?: number;
}

export const CompanyTableView = () => {
  const { getUserFullNameByEmail } = useUserRoleLists();

  const swrKey="all-companies-list_modified"

  const { data, isLoading, error } = useFrappeGetCall<CRMCompany[]>(
    'nirmaan_crm.api.get_modified_crm_company.get_modified_crm_companies',undefined,swrKey,
  );

  const companies = data?.message || [];

  const assignedSalesOptions = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];
    const set = new Set<string>();
    companies.forEach(c => c.assigned_sales && set.add(c.assigned_sales));
    return Array.from(set).map(email => ({
      label: getUserFullNameByEmail(email) || email,
      value: email,
    }));
  }, [companies, getUserFullNameByEmail]);

  const companyNameOptions = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];
    const set = new Set<string>();
    companies.forEach(c => c.company_name && set.add(c.company_name));
    return Array.from(set).map(name => ({ label: name, value: name }));
  }, [companies]);

    const companyCityOptions = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];
    const set = new Set<string>();
    companies.forEach(c => c.company_city && set.add(c.company_city));
    return Array.from(set).map(name => ({ label: name, value: name }));
  }, [companies]);

  


  const columns = useMemo<DataTableColumnDef<CRMCompany>[]>(() => [
    {
      accessorKey: "company_name",
      meta: { title: "Company Name",enableSorting: true},
      cell: ({ row }) => (
        <Link to={`/companies/company?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
          {row.original.company_name}
        </Link>
      ),
    
      filterFn: "faceted"
    },
    {
      accessorKey: "company_city",
      meta: { title: "City",filterVariant:"select", enableSorting: true,filterOptions:companyCityOptions },
      cell: ({ row }) => <span>{row.original.company_city || '--'}</span>,
         filterFn: 'faceted', // Uses the 'facetedFilterFn' registered in useDataTableLogic
            enableSorting: true,
     
    },
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
          ? getUserFullNameByEmail(row.original.assigned_sales) || row.original.assigned_sales
          : '--',
     filterFn: 'faceted', // Uses the 'facetedFilterFn' registered in useDataTableLogic
            enableSorting: true,
   
    },
    {
      accessorKey: "priority",
      meta: { title: "Priority", enableSorting: true },
      cell: ({ row }) => <span className='text-xs'>{row.original.priority || '--'}</span>,
      
    },
    {
      accessorKey: "last_meeting",
      meta: { title: "Last Meeting",filterVariant: 'date', enableSorting: true },
      cell: ({ row }) =>
        row.original.last_meeting
          ? formatDateWithOrdinal(new Date(row.original.last_meeting), 'dd-MMM-yyyy')
          : '--',
           enableSorting: true,
            filterFn: 'dateRange', 
    },
    {
      accessorKey: "next_meeting_date",
      meta: { title: "Next Meeting", enableSorting: true, filterVariant: "date" },
      cell: ({ row }) =>
        row.original.next_meeting_date
          ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
          : '--',
           enableSorting: true,
            filterFn: 'dateRange', 
 
    },
    {
      accessorKey: "active_boq",
      meta: { title: "Active BOQs", enableSorting: true },
      cell: ({ row }) => <span>{row.original.active_boq ?? 0}</span>,
      
    },
    {
      accessorKey: "hot_boq",
      meta: { title: "Hot BOQs" , enableSorting: true},
      cell: ({ row }) => <span>{row.original.hot_boq ?? 0}</span>,
      
    },
    {
      accessorKey: "last_three_remarks_from_tasks",
      meta: { title: "Last 3 Remarks" , enableSorting: false},
      cell: ({ row }) => {
        const remarks = row.original.last_three_remarks_from_tasks || [];
        if (remarks.length === 0) {
          return <span>--</span>;
        }

        return (
          <div className="flex gap-1">
            <TooltipProvider>
              {remarks.map((r, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs cursor-pointer">
                      {i + 1}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{r}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        );
      },
      enableSorting: true,
    }
  ], [companyNameOptions,companyCityOptions, assignedSalesOptions, getUserFullNameByEmail]);

  const initialSorting = [{ id: 'next_meeting_date', desc: false }];

  const initialFilters: ColumnFiltersState = [];

  const tableLogic = useDataTableLogic<CRMCompany>({
    data: companies,
    columns,
    initialSorting,
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
          <span>Active BOQs: {row.original.active_boq || 0}</span>
          <span>Hot BOQs: {row.original.hot_boq || 0}</span>
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
        { accessorKey: "active_boq", meta: { exportHeaderName: "Active BOQs" } },
        { accessorKey: "hot_boq", meta: { exportHeaderName: "Hot BOQs" } },
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
        className="h-full" //make page full
        shouldExpandHeight={true}
        gridColsClass="md:grid-cols-[2fr,1.5fr,1.5fr,1.5fr,1.5fr,1.5fr,1fr,1fr,1fr]"
        renderToolbarActions={(filteredData) => (
                        <DataTableExportButton
                            data={filteredData}
                            columns={companyExportFields}
                            fileName="Companies_List_Export"
                            label="Export Comapnies List"
                        />
                    )}
      />
   
  );
};

// import React, { useMemo } from 'react';
// import { useFrappeGetCall } from 'frappe-react-sdk';
// import { ColumnFiltersState, Row } from '@tanstack/react-table';
// import { DataTable } from '@/components/table/data-table';
// import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
// import { DataTableColumnDef } from '@/components/table/utils/table-filters';
// import { formatDateWithOrdinal } from '@/utils/FormatDate';
// import { useUserRoleLists } from '@/hooks/useUserRoleLists';
// import { useNavigate, Link } from 'react-router-dom';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { DataTableExportButton } from '@/components/table/data-table-export-button';

// interface CRMCompany {
//   name: string;
//   company_name: string;
//   company_city?: string;
//   website?: string;
//   assigned_sales?: string;
//   priority?: string;
//   last_meeting?: string;
//   next_meeting_date?: string;
//   next_meeting_id?: string;
//   last_three_remarks_from_tasks?: string[];
//   active_boq?: number;
//   hot_boq?: number;
// }

// export const CompanyTableView = () => {
//   const { getUserFullNameByEmail } = useUserRoleLists();

//   const { data, isLoading, error } = useFrappeGetCall<CRMCompany[]>(
//     'nirmaan_crm.api.get_modified_crm_company.get_modified_crm_companies'
//   );

//   const companies = data?.message || [];

//   const assignedSalesOptions = useMemo(() => {
//     if (!companies || !Array.isArray(companies)) return [];
//     const set = new Set<string>();
//     companies.forEach(c => c.assigned_sales && set.add(c.assigned_sales));
//     return Array.from(set).map(email => ({
//       label: getUserFullNameByEmail(email) || email,
//       value: email,
//     }));
//   }, [companies, getUserFullNameByEmail]);

//   const companyNameOptions = useMemo(() => {
//     if (!companies || !Array.isArray(companies)) return [];
//     const set = new Set<string>();
//     companies.forEach(c => c.company_name && set.add(c.company_name));
//     return Array.from(set).map(name => ({ label: name, value: name }));
//   }, [companies]);

//   const columns = useMemo<DataTableColumnDef<CRMCompany>[]>(() => [
//     {
//       accessorKey: "company_name",
//       meta: { title: "Company Name", filterVariant: "select", filterOptions: companyNameOptions },
//       cell: ({ row }) => (
//         <Link to={`/companies/company?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
//           {row.original.company_name}
//         </Link>
//       ),
//       enableSorting: true,
//       filterFn: "faceted"
//     },
//     {
//       accessorKey: "company_city",
//       meta: { title: "City" },
//       cell: ({ row }) => <span>{row.original.company_city || '--'}</span>,
//     },
//     {
//       accessorKey: "assigned_sales",
//       meta: {
//         title: "Assigned Sales",
//         filterVariant: "select",
//         filterOptions: assignedSalesOptions,
//       },
//       cell: ({ row }) =>
//         row.original.assigned_sales
//           ? getUserFullNameByEmail(row.original.assigned_sales) || row.original.assigned_sales
//           : '--',
//       filterFn: 'faceted',
//     },
//     {
//       accessorKey: "priority",
//       meta: { title: "Priority" },
//       cell: ({ row }) => <span>{row.original.priority || '--'}</span>
//     },
//     {
//       accessorKey: "last_meeting",
//       meta: { title: "Last Meeting" },
//       cell: ({ row }) =>
//         row.original.last_meeting
//           ? formatDateWithOrdinal(new Date(row.original.last_meeting), 'dd-MMM-yyyy')
//           : '--',
//     },
//     {
//       accessorKey: "next_meeting_date",
//       meta: { title: "Next Meeting", filterVariant: "date" },
//       cell: ({ row }) =>
//         row.original.next_meeting_date
//           ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
//           : '--',
//       filterFn: "dateRange",
//     },
//     {
//       accessorKey: "active_boq",
//       meta: { title: "Active BOQs" },
//       cell: ({ row }) => <span>{row.original.active_boq ?? 0}</span>
//     },
//     {
//       accessorKey: "hot_boq",
//       meta: { title: "Hot BOQs" },
//       cell: ({ row }) => <span>{row.original.hot_boq ?? 0}</span>
//     },
//     {
//       accessorKey: "last_three_remarks_from_tasks",
//       meta: { title: "Last 3 Remarks" },
//       cell: ({ row }) => {
//         const remarks = row.original.last_three_remarks_from_tasks || [];
//         if (remarks.length === 0) {
//           return <span>--</span>;
//         }

//         return (
//           <div className="flex gap-1">
//             <TooltipProvider>
//               {remarks.map((r, i) => (
//                 <Tooltip key={i}>
//                   <TooltipTrigger asChild>
//                     <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs cursor-pointer">
//                       {i + 1}
//                     </div>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>{r}</p>
//                   </TooltipContent>
//                 </Tooltip>
//               ))}
//             </TooltipProvider>
//           </div>
//         );
//       },
//     }
//   ], [companyNameOptions, assignedSalesOptions, getUserFullNameByEmail]);

//   const initialSorting = [{ id: 'next_meeting_date', desc: false }];

//   const initialFilters: ColumnFiltersState = [];

//   const tableLogic = useDataTableLogic<CRMCompany>({
//     data: companies,
//     columns,
//     initialSorting,
//     initialColumnFilters: initialFilters,
//     // CORRECTED: Pass the array of keys to the `searchableKeys` prop
//     searchableKeys: ['company_name', 'company_city', 'assigned_sales', 'priority'],
//   });

//   if (error) return <div className="text-center text-red-500 font-semibold p-4">An error occurred while loading companies.</div>;

//   const renderMobileRow = (row: Row<CRMCompany>) => (
//     <div className="flex flex-col p-4 border rounded-lg shadow-sm border-gray-200 hover:border-red-500 transition-colors">
//       <div className="flex justify-between items-start mb-2">
//         <div className="flex flex-col text-left gap-1">
//           <span className="font-bold text-lg text-red-600">{row.original.company_name}</span>
//           <p className="text-sm text-gray-500">City: {row.original.company_city || '--'}</p>
//           <p className="text-sm">Assigned: <span className="font-medium">{getUserFullNameByEmail(row.original.assigned_sales) || '--'}</span></p>
//         </div>
//         <div className="flex flex-col items-end text-xs gap-1 text-gray-500">
//           <span className="font-bold text-red-500">Priority: {row.original.priority || '--'}</span>
//           <span>Active BOQs: {row.original.active_boq || 0}</span>
//           <span>Hot BOQs: {row.original.hot_boq || 0}</span>
//         </div>
//       </div>
//       <p className="text-xs text-gray-400 mt-2">
//         Next Meeting: <span className="font-medium text-gray-600">{row.original.next_meeting_date
//           ? formatDateWithOrdinal(new Date(row.original.next_meeting_date), 'dd-MMM-yyyy')
//           : '--'}</span>
//       </p>
//     </div>
//   );

//   const companyExportFields = useMemo<DataTableColumnDef<CRMCompany>[]>(() => ([
//         { accessorKey: "name", meta: { exportHeaderName: "Company ID" } },
//         { accessorKey: "company_name", meta: { exportHeaderName: "Company Name" } },
//         { accessorKey: "company_city", meta: { exportHeaderName: "City" } },
//         {
//             accessorKey: "assigned_sales",
//             meta: {
//                 exportHeaderName: "Assigned Sales",
//                 exportValue: (row) => getUserFullNameByEmail(row.assigned_sales || '') || row.assigned_sales || ''
//             }
//         },
//         { accessorKey: "priority", meta: { exportHeaderName: "Priority" } },
//         {
//             accessorKey: "last_meeting",
//             meta: {
//                 exportHeaderName: "Last Meeting",
//                 exportValue: (row) => row.last_meeting ? formatDateWithOrdinal(new Date(row.last_meeting), 'dd-MMM-yyyy') : ''
//             }
//         },
//         {
//             accessorKey: "next_meeting_date",
//             meta: {
//                 exportHeaderName: "Next Meeting",
//                 exportValue: (row) => row.next_meeting_date ? formatDateWithOrdinal(new Date(row.next_meeting_date), 'dd-MMM-yyyy') : ''
//             }
//         },
//         { accessorKey: "active_boq", meta: { exportHeaderName: "Active BOQs" } },
//         { accessorKey: "hot_boq", meta: { exportHeaderName: "Hot BOQs" } },
//         {
//             accessorKey: "last_three_remarks_from_tasks",
//             meta: {
//                 exportHeaderName: "Last 3 Remarks",
//                 exportValue: (row) => row.last_three_remarks_from_tasks?.join('; ') || ''
//             }
//         }
//     ]), [getUserFullNameByEmail]);

//   return (
    
//       <DataTable
//         tableLogic={tableLogic}
//         isLoading={isLoading}
//         renderMobileRow={renderMobileRow}
//         headerTitle={<span>CRM Companies</span>}
//         noResultsMessage="No companies found."
//         globalSearchPlaceholder="Search Companies..."
//         shouldExpandHeight={true}
//         gridColsClass="md:grid-cols-[2fr,1.5fr,1.5fr,1.5fr,1.5fr,1.5fr,1fr,1fr,1fr]"
//         renderToolbarActions={(filteredData) => (
//                         <DataTableExportButton
//                             data={filteredData}
//                             columns={companyExportFields}
//                             fileName="Companies_List_Export"
//                             label="Export Comapnies List"
//                         />
//                     )}
//       />
   
//   );
// };


