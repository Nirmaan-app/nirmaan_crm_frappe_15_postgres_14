import { addDays, isSameDay, parseISO, subDays } from "date-fns";

export interface Task {
  start_date: string;
  name: string;
  // ... other fields as needed
}

export interface GroupedTasks {
  yesterday: Task[];
  today: Task[];
  tomorrow: Task[];
  dayAfterTomorrow: Task[];
  twoDaysAfterTomorrow: Task[];
}

export const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
  const groups: GroupedTasks = {
    yesterday: [],
    today: [],
    tomorrow: [],
    dayAfterTomorrow: [],
    twoDaysAfterTomorrow: [],
  };

  const now = new Date();
  const yesterday = subDays(now, 1);
  const today = now;
  const tomorrow = addDays(now, 1);
  const dayAfterTomorrow = addDays(now, 2);
  const twoDaysAfterTomorrow = addDays(now, 3);

  tasks.forEach((task) => {
    // Extract the date part from "YYYY-MM-DD HH:MM"
    const datePart = task.start_date.split(" ")[0];
    const taskDate = parseISO(datePart);
    if (isSameDay(taskDate, yesterday)) {
      groups.yesterday.push(task);
    } else if (isSameDay(taskDate, today)) {
      groups.today.push(task);
    } else if (isSameDay(taskDate, tomorrow)) {
      groups.tomorrow.push(task);
    } else if (isSameDay(taskDate, dayAfterTomorrow)) {
      groups.dayAfterTomorrow.push(task);
    } else if (isSameDay(taskDate, twoDaysAfterTomorrow)) {
      groups.twoDaysAfterTomorrow.push(task);
    }
  });

  return groups;
};
