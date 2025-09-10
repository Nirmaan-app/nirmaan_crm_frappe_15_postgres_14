// src/pages/Tasks/TaskDestopThree.tsx (Corrected and Simplified)

import React from 'react';
import { CRMTask } from '@/types/NirmaanCRM/CRMTask';
import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/store/dialogStore';
import { formatTime12Hour } from '@/utils/FormatDate';
import {TaskDashboardRow} from "./TaskList"

// The type definition for the task data
type EnrichedTask = CRMTask & {
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
};

// The props interface for the component
interface TaskDestopThreeProps {
    title: string;
    tasks: EnrichedTask[];
}



/**
 * A presentational component to display a list of tasks with a title.
 * It receives all the data it needs via props.
 */
export const TaskDestopThree = ({ title, tasks = [] }: TaskDestopThreeProps) => {
    // --- FIXES ---
    // 1. This component now correctly receives BOTH `title` and `tasks` from its props.
    // 2. The `tasks = []` part provides a default empty array to prevent crashes if `tasks` is undefined.
let context: 'today' | 'tomorrow' | 'createdToday' | 'upcoming7Days';
     if (title === "Today's Tasks") {
         context = "today";
     } else if (title === "Tomorrow's Tasks") {
         context = "tomorrow";
     } else if (title === "Tasks Created Today") {
         context = "createdToday";
     }else if (title === "Upcoming 7 Days Tasks") { // --- FIX HERE: Match title string from Tasks.tsx ---
          context = "upcoming7Days"; // Consistent context for TaskDashboardRow
     } else {
         context = "today";
     }
 


    return (
        <div className="w-full font-sans bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
                {/* 3. The title is now displayed directly from the prop. No complex logic needed. */}
                {title} - {tasks.length} Tasks
            </h2>
            <div>
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskDashboardRow key={task.name} task={task} context ={context}/>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-4">No tasks found for this category.</p>
                )}
            </div>
        </div>
    );
};