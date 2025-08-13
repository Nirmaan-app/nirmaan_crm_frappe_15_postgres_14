import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatDate } from "@/utils/FormatDate";
import { ChevronRight, Search } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface ContactSubPagesProps {
    boqs: CRMBOQ[];
    tasks: CRMTask[];
}

const getStatusClass = (status: string) => {
    // ... (same getStatusClass function from before)
    switch (status?.toLowerCase()) {
        case 'won': return 'bg-green-100 text-green-800';
        case 'lost': return 'bg-red-100 text-red-800';
        case 'hold': return 'bg-yellow-100 text-yellow-800';
        case 'revision pending': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export const ContactSubPages = ({ boqs, tasks }: ContactSubPagesProps) => {
    const navigate = useNavigate();

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Other Details</h2>
            <Tabs defaultValue="boqs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
                    <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs</TabsTrigger>
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks</TabsTrigger>
                </TabsList>

                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search Projects" className="pl-10" />
                </div>

                <TabsContent value="boqs">
                    <div className="space-y-2">
                        <div className="grid grid-cols-[1fr,auto,auto] text-sm font-semibold px-2">
                            <span>Name</span>
                            <span>Status</span>
                            <span className="text-right">Date</span>
                        </div>
                        {boqs.map((boq, index) => (
                            <React.Fragment key={boq.name}>
                                <div onClick={() => navigate(`/boqs/boq?id=${boq.name}`)} className="grid grid-cols-[1fr,auto,auto] items-center px-2 py-3 cursor-pointer">
                                    <span className="font-medium">{boq.boq_name}</span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClass(boq.boq_status)}`}>
                                        {boq.boq_status || 'N/A'}
                                    </span>
                                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                        <span>{formatDate(boq.boq_submission_date)}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                                {index < boqs.length - 1 && <Separator />}
                            </React.Fragment>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="tasks">
                    <p className="text-center text-muted-foreground py-8">Tasks list will be displayed here.</p>
                </TabsContent>
            </Tabs>
        </div>
    );
};