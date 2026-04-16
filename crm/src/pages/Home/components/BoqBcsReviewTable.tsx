import React, { useMemo } from "react";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskTable } from "./EstimationsReviewTable";

export const BoqBcsReviewTable = () => {
    // role based access
    const role = localStorage.getItem("role");
    const isEstimationLead = role === "Nirmaan Estimations lead Profile" || role === "Nirmaan Estimations Lead Profile" || role === "Nirmaan Admin User Profile";
    const isEstimationsTeam = role === "Nirmaan Estimations User Profile" || role === "Nirmaan Estimates User Profile" || isEstimationLead;
    const userEmail = localStorage.getItem("userId") || "";

    const { data: estimations, isLoading: estimationsLoading } = useFrappeGetDocList<any>(
        "CRM Project Estimation",
        {
          fields: ["name", "parent_project", "title", "package_name", "document_type", "value", "link", "status", "sub_status", "deadline", "remarks", "assigned_to", "creation"],
          limit: 0,
        },
        "home-boqbcs-review-estimations"
    );

    const { data: projects, isLoading: projectsLoading } = useFrappeGetDocList<any>(
        "CRM BOQ",
        {
          fields: ["name", "boq_name"],
          limit: 0,
        },
        "home-boqbcs-review-projects"
    );

    const { data: teamUsers, isLoading: usersLoading } = useFrappeGetDocList<any>(
        "CRM Users",
        {
          fields: ["name", "full_name"],
          limit: 0,
        },
        "home-boqbcs-review-users"
    );

    const projectMap = useMemo(() => {
        const map = new Map<string, any>();
        (projects || []).forEach((project: any) => {
          map.set(project.name, project);
        });
        return map;
      }, [projects]);
    
    const userNameMap = useMemo(() => {
        const map = new Map<string, string>();
        (teamUsers || []).forEach((user: any) => {
            map.set(user.name, user.full_name || user.name);
        });
        return map;
    }, [teamUsers]);

    const targetStatuses = new Set(["new", "in progress", "in-progress", "partial boq submitted", "revision pending", "hold"]);
    const normalizeStatus = (status: string) => (status||"").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

    const pendingWipEstimations = useMemo(() => {
        const items = (estimations || []).filter((item: any) => targetStatuses.has(normalizeStatus(item.status)));
        // Admin and leads see all tasks
        if (isEstimationLead) return items;
        // Regular estimation users see only their own assigned tasks
        return items.filter((item: any) => {
            const assignee = (item.assigned_to || "").trim();
            return assignee === userEmail;
        });
    }, [estimations, isEstimationLead, userEmail]);

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
        <div className="space-y-4">
           <TaskTable 
             items={pendingWipEstimations}
             showProjectName={true}
             projectMap={projectMap}
             userNameMap={userNameMap}
             isEstimationsTeam={isEstimationsTeam}
             title="Pending Tasks"
             maxHeightClass="max-h-[calc(90vh-200px)]"
           />
        </div>
    )
}
