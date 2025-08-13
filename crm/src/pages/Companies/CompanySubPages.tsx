// src/pages/Companies/CompanySubPages.tsx

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask"; // Import the Task type
import { formatDate } from "@/utils/FormatDate";
import { ChevronRight, Search } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface CompanySubPagesProps {
    boqs: CRMBOQ[];
    contacts: CRMContacts[];
    tasks: CRMTask[]; // Correctly typed prop
}

// --- Sub-component for rendering the BOQ list ---
const BoqList = ({ boqs }: { boqs: CRMBOQ[] }) => {
    const navigate = useNavigate();
     // This is the updated function from Step 1
    const getStatusClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'won': return 'text-green-600 bg-green-50 border border-green-300';
            case 'lost': return 'text-red-600 bg-red-50 border border-red-300';
            case 'new': return 'text-yellow-600 bg-yellow-50 border border-yellow-300';
            case 'negotiation': return 'text-emerald-600 bg-emerald-50 border border-emerald-300';
            case 'revision submitted': return 'text-blue-600 bg-blue-50 border border-blue-300';
            case 'revision pending': return 'text-amber-600 bg-amber-50 border border-amber-300';
            default: return 'text-gray-600 bg-gray-100 border border-gray-300';
        }
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[1fr,1fr,1fr] text-sm font-semibold px-2">
                <span>Name</span>
                <span className="text-center">Status</span>
                <span className="text-right">Date</span>
            </div>
            {boqs.map((boq, index) => (
                <React.Fragment key={boq.name}>
                    <div onClick={() => navigate(`/boqs/boq?id=${boq.name}`)} className="grid grid-cols-[1fr,1fr,1fr] items-center px-2 py-3 cursor-pointer hover:bg-secondary rounded-md">
                        <span className="font-medium truncate pr-2">{boq.boq_name}</span>
                        <span className={`text-xs text-center font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getStatusClass(boq.boq_status)}`}>
                            {boq.boq_status || 'N/A'}
                        </span>
                        <div className="flex items-center justify-end gap-2 text-sm text- -foreground">
                            <span>{formatDate(boq.boq_submission_date)}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                    {index < boqs.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Sub-component for rendering the Contact list ---
const ContactList = ({ contacts }: { contacts: CRMContacts[] }) => {
    const navigate = useNavigate();
    return (
         <div className="space-y-2">
            <div className="grid grid-cols-[1fr,auto] text-sm font-semibold px-2">
                <span>Name</span>
                <span className="text-right">Designation</span>
            </div>
            {contacts.map((contact, index) => (
                <React.Fragment key={contact.name}>
                    <div onClick={() => navigate(`/contacts/contact?id=${contact.name}`)} className="grid grid-cols-[1fr,auto] items-center px-2 py-3 cursor-pointer hover:bg-secondary rounded-md">
                        <span className="font-medium">{contact.first_name} {contact.last_name}</span>
                        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                            <span className="truncate">{contact.designation || 'N/A'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                    {index < contacts.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Sub-component for rendering the Task list ---
const TaskList = ({ tasks, contacts }: { tasks: CRMTask[], contacts: CRMContacts[] }) => {
    const navigate = useNavigate();
    // Create a quick lookup map for contact names for efficiency
    const contactMap = new Map(contacts.map(c => [c.name, `${c.first_name} ${c.last_name}`]));
    
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[1fr,1fr,1fr] text-sm font-semibold px-2">
                <span>Task</span>
                <span>Contact</span>
                <span className="text-right">Date</span>
            </div>
            {tasks.map((task, index) => (
                <React.Fragment key={task.name}>
                    <div onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="grid grid-cols-[1fr,1fr,1fr] items-center px-2 py-3 cursor-pointer hover:bg-secondary rounded-md">
                        <span className="font-medium truncate pr-2">{task.type || 'General Task'}</span>
                        <span className="text-sm text-muted-foreground">{contactMap.get(task.contact) || 'N/A'}</span>
                        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                            <span>{formatDate(task.start_date)}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                    {index < tasks.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    );
}

// --- Main Component ---
export const CompanySubPages = ({ boqs, contacts, tasks }: CompanySubPagesProps) => {
    return (
        <Tabs defaultValue="boqs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs</TabsTrigger>
                <TabsTrigger value="contacts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-none border-x">Contacts</TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks</TabsTrigger>
            </TabsList>

            <div className="relative my-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10" />
            </div>

            <TabsContent value="boqs">
                {boqs?.length > 0 
                    ? <BoqList boqs={boqs} /> 
                    : <p className="text-center text-muted-foreground py-8">No BOQs found for this company.</p>
                }
            </TabsContent>

            <TabsContent value="contacts">
                 {contacts?.length > 0 
                    ? <ContactList contacts={contacts} /> 
                    : <p className="text-center text-muted-foreground py-8">No contacts found for this company.</p>
                }
            </TabsContent>

            <TabsContent value="tasks">
                {tasks?.length > 0 
                    ? <TaskList tasks={tasks} contacts={contacts} /> 
                    : <p className="text-center text-muted-foreground py-8">No tasks found for this company.</p>
                }
            </TabsContent>
        </Tabs>
    );
};