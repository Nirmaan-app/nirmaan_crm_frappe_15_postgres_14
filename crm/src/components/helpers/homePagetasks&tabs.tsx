import { Separator } from "@/components/ui/separator";
import { useTaskActions } from "@/hooks/useTaskActions";
import { useViewport } from "@/hooks/useViewPort";
import { taskFormSchema, TaskFormValues } from "@/pages/Tasks/Task";
import { TaskForm } from "@/pages/Tasks/TaskDialogs";
import { formatCasualDate, formatTime12Hour } from "@/utils/FormatDate";
import { getFilteredTasks } from "@/utils/taskutils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeGetDocCount, useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, CircleCheck } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ReusableAlertDialog, ReusableDialog } from "../ui/ReusableDialogs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export const HomePageTasksAndTabs = () => {

  const navigate = useNavigate()

  const {isMobile} = useViewport()
  const [dialogType, setDialogType] = useState("")
  const [currentTask, setCurrentTask] = useState({})
  const [status, setStatus] = useState("")
  const [remarks, setRemarks] = useState("");

  const [checked, setChecked] = useState(false);

  const {updateTask, scheduleTask} = useTaskActions()

  const [taskStatusDialog, setTaskStatusDialog] = useState(false)

  const toggleTaskStatusDialog = useCallback(() => {
    setTaskStatusDialog(!taskStatusDialog)
  }, [taskStatusDialog])

  const [taskUpdateDialog, setTaskUpdateDialog] = useState(false)

  const toggleTaskUpdateDialog = useCallback(() => {
    setTaskUpdateDialog(!taskUpdateDialog)
  }, [taskUpdateDialog])

  const [scheduleTaskDialog, setScheduleTaskDialog] = useState(false);
  const toggleScheduleTaskDialog = useCallback(() => {
      setScheduleTaskDialog(!scheduleTaskDialog);
  }, [scheduleTaskDialog]);
  
  const { data: tasksData, isLoading: tasksDataLoading } = useFrappeGetDocList("CRM Task", {
      fields: ["*"],
      limit: 1000,
  }, "CRM Task");
    
  const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList("CRM Contacts", {
      fields: ["*"],
      limit: 10000
  }, "CRM Contacts")
    
  const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList("CRM Company", {
      fields: ["name", "company_name"],
      limit: 1000,
    }, "CRM Company")

  const form = useForm<TaskFormValues>({
      resolver: zodResolver(taskFormSchema),
      defaultValues: {},
      mode: "onBlur",
  });
    
    
  const {data : projectsCount, isLoading: projectsCountLoading} = useFrappeGetDocCount("CRM Projects")

  const today = new Date().toISOString().split("T")[0];

  const todayTasks = useMemo(() => getFilteredTasks(tasksData, today, contactsList, companiesList), [tasksData, contactsList, companiesList])

  const resetForm = (values) => {
    form.reset({
      reference_docname: values?.reference_docname,
      type: values?.type,
      date: values?.start_date?.split(" ")?.[0],
      time: values?.start_date?.split(" ")?.[1],
    });
  }

  const newScheduleTask = () => {
      form.reset({
          reference_docname: currentTask?.reference_docname,
          type: undefined,
          date: undefined,
          time: undefined,
      })
  }

  const handleUpdateTask = async () => {
    await updateTask(currentTask?.name, {
        // status: status?.value,
        status: status,
        description: remarks,
    })

    toggleTaskUpdateDialog()

    if(checked) {
      if (dialogType === "complete") {
          newScheduleTask()
      } else if (dialogType === "incomplete") {
          setDialogType("reSchedule")
      }
      toggleScheduleTaskDialog()
    }

    setChecked(false)
    // setStatus({})
    setStatus("")
    setRemarks("")
}

const handleReScheduleTask = async (values : TaskFormValues) => {
  const isValid = await form.trigger();
  if(!isValid) return;

  await updateTask(currentTask?.name, {
      type : values?.type,
      start_date: `${values?.date} ${values?.time}`,
  })
  toggleScheduleTaskDialog()
}

const handleNewScheduleTask = async (values : TaskFormValues) => {
    const isValid = await form.trigger();
    if(!isValid) return;

    await scheduleTask(values)
    toggleScheduleTaskDialog()  
}

  const completeStatusOptions = [
      {label: "Pending", value: "Pending"},
      {label: "Completed", value: "Completed"},
  ]

  const inCompleteStatusOptions = [
      {label: "Pending", value: "Pending"},
      {label: "Incomplete", value: "Incomplete"},
  ]

  return (
    <>
    <div className="p-6 border-2 rounded-md cardBorder flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className={`${isMobile ? "text-sm" : ""} font-semibold dark:text-white`}>Today</p>
          <strong className="text-primary">{formatCasualDate(new Date())}</strong>
        </div>
          <ul className="my-2 space-y-2 text-sm">
              {todayTasks?.length ? (
                  todayTasks?.map((task, index, array) => {
                      const [, time] = task?.start_date?.split(" ");
                      return (
                        <div key={task?.name}>
                          <li 
                          // onClick={() => navigate(`/tasks/task?id=${task?.name}`)} 
                          key={task?.name} className="py-4 flex justify-between items-center">
                              <span>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(time)}</span>
                              {isMobile ? <ChevronRight /> : (
                                task?.status === "Pending" ? (
                                  <button onClick={() => {
                                    resetForm(task)
                                    setCurrentTask(task)
                                    toggleTaskStatusDialog()
                                  }} className="text-yellow-500 underline">
                                    Pending
                                 </button>
                                ) : (
                                  task?.status === "Completed" ? (
                                    <div className="flex gap-1 items-center text-green-500 dark:text-green-400">
                                    <CircleCheck />
                                    <span>Completed</span>
                                 </div>
                                  ) : (
                                    <span className="text-primary">Incomplete</span>
                                  )
                                )
                              )}
                          </li>
                          {array.length - 1 !== index && <Separator />}
                        </div>
                      );
                  })
              ) : (
                  <p className="text-muted-foreground text-center font-semibold">Empty!</p>
              )}
          </ul>
      </div>

       <ReusableDialog
          open={taskStatusDialog}
          onOpenChange={toggleTaskStatusDialog}
          title="Task Completed"
          confirmText="Yes"
          cancelButton={false}
          cancelText="No"
          onConfirm={() => {
            toggleTaskStatusDialog()
            setDialogType("complete")
            toggleTaskUpdateDialog()
          }}
          cancelConfirm={() => {
            toggleTaskStatusDialog()
            setDialogType("incomplete")
            toggleTaskUpdateDialog()
          }}
        />

          <ReusableAlertDialog
            open={taskUpdateDialog} onOpenChange={toggleTaskUpdateDialog} 
            title={dialogType === "complete" ? "Task Completed" : "Task Incomplete"} 
            confirmText="Confirm" 
            cancelText="Cancel"
            onConfirm={handleUpdateTask}
            disableConfirm={!status}
            children={
                            <div className="space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="status" className="flex">Current Status<sup className="text-sm text-destructive">*</sup></Label>
                                {/* <ReactSelect id="status"
                                    value={status}
                                    className="text-sm text-muted-foreground border-destructive" 
                                    placeholder="Select Status" 
                                    options={dialogType === "complete" ? completeStatusOptions : inCompleteStatusOptions}
                                    onChange={(e) => setStatus(e)} 
                                /> */}
                                <Input
                                  value={status || ""}
                                  onChange={(e) => setStatus(e.target.value)}
                                  placeholder="Type Status"
                                />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks" className="flex">Remarks</Label>
                                    <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter Remarks" className="text-sm text-muted-foreground" rows={3} />
                                </div>
                                <div className="flex items-center gap-2"> 
                                    <input className="w-5 h-5" id="schedule" type="checkbox" value={checked} onChange={(e) => setChecked(e.target.checked)} />
                                    <Label htmlFor="schedule" className="flex">{dialogType === "complete" ? 
                                    "Schedule next task?" : "Re-schedule this task?"}</Label>
                                </div>
                            </div>
            }
            />

            <ReusableAlertDialog 
              open={scheduleTaskDialog} onOpenChange={toggleScheduleTaskDialog} 
              title={dialogType === "reSchedule" ? "Re-Schedule Task" : "Schedule New Task"}
              confirmText="Confirm" 
              cancelText="Cancel" 
              onConfirm={ dialogType === "reSchedule" ? () => handleReScheduleTask(form.getValues()) : () => handleNewScheduleTask(form.getValues())}
              children={ <TaskForm form={form} />}
              disableConfirm={!form.getValues("type") || !form.getValues("time") || !form.getValues("date")}
            />

      <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4 text-white font-light text-sm`}>
          <div
            role="button"
            aria-label="Prospects"
            onClick={() => navigate("/prospects")}
           className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Prospect Generated</p>
            <p className="font-normal text-base">{contactsList?.length}/{companiesList?.length}</p>
          </div>
           <div
           role="button"
           aria-label="Projects"
           onClick={() => navigate("/projects")}
            className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Projects</p>
            <p className="font-normal text-base">{projectsCount}</p>
          </div>
           <div className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Follow-Up Pending</p>
            <p className="font-normal text-base">11</p>
          </div>
           <div className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Updates Pending</p>
            <p className="font-normal text-base">20</p>
          </div>
      </div>

    </>
  )
}