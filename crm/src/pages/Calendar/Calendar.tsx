import { Calendar } from "@/components/ui/calendar";
// import "react-day-picker/style.css";

export const TaskCalendar = () => {

 
  return (
    // <DayPicker captionLayout="label" mode="single" timeZone="Asia/Calcutta" />
    <Calendar
        mode="single"
        showOutsideDays={false}
        className="min-w-full"
        onDayClick={(day) => console.log(day)}
        
     />
  )
}