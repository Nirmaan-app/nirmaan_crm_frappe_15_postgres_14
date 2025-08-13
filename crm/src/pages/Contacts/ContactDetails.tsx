import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useViewport } from "@/hooks/useViewPort";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMPRojects } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatDate } from "@/utils/FormatDate";
import { ChevronRight, SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

interface ContactDetailsProps {
  data? : CRMContacts
  contactCompany? : CRMCompany
  toggleEditDialog: () => void
  toggleDeleteDialog: () => void
}

export const ContactDetails = ({data, contactCompany, toggleEditDialog, toggleDeleteDialog} : ContactDetailsProps) => {
  return (
    <>
    <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Name</p>
                                <p className="text-sm font-semibold text-destructive">{data?.first_name} {data?.last_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Email</p>
                                <p className="text-sm font-semibold text-destructive">{data?.email || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Designation</p>
                                <p className="text-sm font-semibold text-destructive">{data?.designation || "--"}</p>
                            </div>
                            <div className="text-end">
                                <p className="text-xs">Mobile</p>
                                <p className="text-sm font-semibold text-destructive">{data?.mobile || "--"}</p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Company Name</p>
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.company_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Company Type</p>
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.industry || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Location</p>
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.company_location || "--"}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={toggleEditDialog} variant="outline" className="text-destructive border-destructive">
                        <SquarePen />
                        Edit
                    </Button>
                    <Button onClick={toggleDeleteDialog} variant="outline" className="text-destructive border-destructive">
                        <Trash2 />
                        Delete
                    </Button>
                </div>
    </>
  )
}


export const ContactTasks = ({tasksData} : {tasksData? : CRMTask[]}) => {
  const {isMobile} = useViewport()
  return (
    <div className="space-y-4">
    <section>
    <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Task</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              {isMobile && <TableHead className="w-[5%]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasksData?.length ? (
                tasksData?.map(task => (
                    <TableRow key={task?.name}>
                      <TableCell className="font-medium">{task?.type}</TableCell>
                      <TableCell>{task?.start_date}</TableCell>
                      <TableCell>{task?.status}</TableCell>
                      {isMobile && (
                        <TableCell>
                        <ChevronRight />
                      </TableCell>
                      )}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={isMobile ? 4 : 3} className="text-center py-2">
                        No Tasks Found
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
</section>

<section>
    <h2 className="font-medium mb-2">Last Remark</h2>
    <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
        hello
    </div>
</section>

    </div>
  )
}


export const ContactProjects = ({projectsData, companiesData} : {projectsData : CRMPRojects[], companiesData : CRMCompany[]}) => {
  const navigate = useNavigate()
  return (
    <section>
    <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>BOQ Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsData?.length ? (
                projectsData?.map(project => (
                    <TableRow key={project?.project_name}>
                      <TableCell onClick={() => navigate(`/projects/project?id=${project?.name}&company=${project?.project_company}`)} className="font-bold text-primary underline">{project?.project_name}</TableCell>
                      <TableCell className="font-bold text-primary underline">{companiesData?.find(company => company?.name === project?.project_company)?.company_name}</TableCell>
                      <TableCell className="font-bold">{"--"}</TableCell>
                      <TableCell className="font-bold">{project?.status || "--"}</TableCell>
                      <TableCell className="font-bold">{formatDate(project?.creation)}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-2">
                        No Projects Found
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
</section>
  )
}