// src/hooks/useTaskActions.ts
import { toast } from "@/hooks/use-toast";
import { TaskFormValues } from "@/types/NirmaanCRM/TaskFormValues";
import { useFrappeCreateDoc, useFrappeDeleteDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";

export const useTaskActions = () => {
  const { updateDoc } = useFrappeUpdateDoc();
  const { deleteDoc } = useFrappeDeleteDoc();
  const { createDoc } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();

  /**
   * Updates a task.
   * @param taskId - The ID of the task to update.
   * @param payload - The updated fields.
   */
  const updateTask = async (taskId: string, payload: Partial<TaskFormValues>) => {
    try {
      await updateDoc("CRM Task", taskId, payload);
      await mutate("CRM Task");
      toast({
        title: "Success!",
        description: "Task updated successfully!",
        variant: "success",
      });
    } catch (error: any) {
      console.error("updateTask error", error);
      toast({
        title: "Failed!",
        description: error?.message || "Failed to update task!",
        variant: "destructive",
      });
    }
  };

  /**
   * Deletes a task.
   * @param taskId - The ID of the task to delete.
   */
  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc("CRM Task", taskId);
      await mutate("CRM Task");
      toast({
        title: "Success!",
        description: "Task deleted successfully!",
        variant: "success",
      });
    } catch (error: any) {
      console.error("deleteTask error", error);
      toast({
        title: "Failed!",
        description: error?.message || "Failed to delete task!",
        variant: "destructive",
      });
    }
  };

  /**
   * Schedules (creates) a new task.
   * @param values - The task form values.
   * @param reference - Additional reference information (if needed).
   */
  const scheduleTask = async (values: TaskFormValues) => {
    try {
      await createDoc("CRM Task", {
        reference_doctype: "CRM Contacts",
        reference_docname: values.reference_docname,
        type: values.type,
        start_date: `${values.date} ${values.time}`,
        status: "Pending",
      });
      await mutate("CRM Task");
      // If you need to mutate other keys, you can add them here
      toast({
        title: "Success!",
        description: "Task scheduled successfully!",
        variant: "success",
      });
    } catch (error: any) {
      console.error("scheduleTask error", error);
      toast({
        title: "Failed!",
        description: error?.message || "Failed to schedule task!",
        variant: "destructive",
      });
    }
  };

  return { updateTask, deleteTask, scheduleTask };
};
