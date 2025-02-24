import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatDate } from "@/utils/FormatDate";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, ListFilter } from "lucide-react";
import { useState } from "react";

export const TasksVariantPage = ({ variant }: { variant: string }) => {

  const [filterBy, setFilterBy] = useState("All");

  const [filterByMenuOpen, setFilterByMenuOpen] = useState(false);

  const toggleFilterByMenu = () => {
    setFilterByMenuOpen((prevState) => !prevState);
  };

  const contactsMap = new Map<string, any>();

  const {data: tasksData, isLoading: tasksDataLoading, error: tasksError} = useFrappeGetDocList("CRM Task", {
    fields: ["*"],
    filters: [["status", filterBy === "All" ? "not in" : "in", filterBy === "All" ? [] : [filterBy]]],
    limit: 100000,
    orderBy: {field: "creation", order: "desc"}
  })

  const {data: contactsData, isLoading: contactsDataLoading, error: contactsError} = useFrappeGetDocList("CRM Contacts", {
    fields: ["*"],
    limit: 100000,
  })

  contactsData?.map((contact) => {
    contactsMap.set(contact.name, contact)
  })

  return (
    <div>
        <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">{variant === "history" ? "Tasks History" : `${variant?.slice(0, 1)?.toUpperCase() + variant?.slice(1)} Tasks`}</h2>
          <DropdownMenu open={filterByMenuOpen} onOpenChange={toggleFilterByMenu}>
            <DropdownMenuTrigger className="flex items-center gap-4 px-2 py-1 rounded-lg border shadow hover:bg-gray-200">
                    <ListFilter className="w-4 h-4" />
                    <p className="min-w-[75px] text-end text-sm">{filterBy}</p>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" className="p-4 mr-16">

              <RadioGroup className="space-y-2" value={filterBy} onValueChange={(value) => {
                toggleFilterByMenu();
                setFilterBy(value);
              }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="All" id="All" />
                <Label htmlFor="All">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pending" id="Pending" />
                <Label htmlFor="Pending">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Completed" id="Completed" />
                <Label htmlFor="Completed">Completed</Label>
              </div>
              </RadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="mt-4 p-0">
            <CardContent className="p-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">Contact</TableHead>
                   <TableHead>{variant === "history" ? "Status" : "Task"}</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="w-[2%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksData?.length > 0 ? (
                  tasksData?.map((task) => {
                    return (
                      <TableRow key={task.name}>
                        <TableCell>{contactsMap.get(task.reference_docname)?.first_name}</TableCell>
                        <TableCell>{variant === "history" ? task.status : task.type}</TableCell>
                        <TableCell>{formatDate(task.start_date.split(" ")[0])}</TableCell>
                        <TableCell>
                            <ChevronRight className="w-4 h-4" />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-2">
                      No Tasks Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
             </Table>
            </CardContent>
        </Card>
  </div>
  )
}