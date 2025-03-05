import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { formatDate } from "@/utils/FormatDate";
import { SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompanyDetailsProps {
  toggleEditDialog: () => void
  toggleDeleteDialog: () => void
  data?: CRMCompany
}

export const CompanyDetails = ({toggleEditDialog, toggleDeleteDialog, data} : CompanyDetailsProps) => {
  return (
            <section>
                <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Company Name</p>
                                <p className="text-sm font-semibold text-destructive">{data?.company_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Company Type</p>
                                <p className="text-sm font-semibold text-destructive">{data?.industry || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Location</p>
                                <p className="text-sm font-semibold text-destructive">{data?.company_location || "--"}</p>
                            </div>
                            <div className="text-end">
                                <p className="text-xs">Website</p>
                                <a  href={data?.company_website} target="_blank" rel="noreferrer">
                                    <p className="text-sm font-semibold text-destructive underline">{data?.company_website || "--"}</p>
                                </a>
                                {/* <p className="text-sm font-semibold text-destructive">{data?.company_website || "--"}</p> */}
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Total Projects</p>
                                <p className="text-sm font-semibold text-destructive">N/A</p>
                            </div>
                            <div>
                                <p className="text-xs">Total Contacts</p>
                                <p className="text-sm font-semibold text-destructive">N/A</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Active Projects</p>
                                <p className="text-sm font-semibold text-destructive">N/A</p>
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
            </section>
  )
}

interface CompanyProjectsProps {
  projectsData?: any[];
  contactsData?: CRMContacts[];
  projectsTab?: boolean;
}

export const CompanyProjects = ({projectsData, contactsData, projectsTab = false} : CompanyProjectsProps) => {
  const navigate = useNavigate()

  return (
    <section>
    <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>BOQ Link</TableHead>
              {projectsTab && <TableHead>Location</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsData?.length ? (
                projectsData?.map(project => (
                    <TableRow key={project?.name}>
                      <TableCell onClick={() => navigate(`/projects/project?id=${project?.name}&company=${project?.project_company}`)} className="font-bold text-primary underline">{project?.project_name}</TableCell>
                      <TableCell className="font-bold text-primary underline">{contactsData?.find(contact => contact?.name === project?.project_contact)?.first_name || "--"}</TableCell>
                      <TableCell>{"--"}</TableCell>
                      {projectsTab && <TableCell className="font-bold">{project?.project_location || "--"}</TableCell>}
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


interface CompanyContactsProps {
  contactsData? : CRMContacts[]
}

export const CompanyContacts = ({contactsData} : CompanyContactsProps) => {

  return (
    <section>
    <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactsData?.length ? (
                contactsData?.map(contact => (
                    <TableRow key={contact?.name}>
                      <TableCell>{contact?.first_name} {contact?.last_name}</TableCell>
                      <TableCell>{contact?.designation}</TableCell>
                      <TableCell>{contact?.mobile || "--"}</TableCell>
                      <TableCell>{formatDate(contact?.creation)}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-2">
                        No Contacts Found
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
</section>
  )
}