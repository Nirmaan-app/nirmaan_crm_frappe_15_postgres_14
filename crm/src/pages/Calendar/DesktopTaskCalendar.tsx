import { Calendar } from "@/components/ui/calendar";
import { addMonths, format } from "date-fns";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const DesktopTaskCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = React.useState<string | null>(searchParams.get("date") || format(new Date(), "yyyy-MM-dd"));
  
  const handleNext = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handlePrev = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const firstMonth = currentMonth;
  const secondMonth = addMonths(currentMonth, 1);

  const {data, isLoading} = useFrappeGetDocList("CRM Task", {
      fields: ["*"],
      limit: 100000
    }, 'CRM Task')
  
    const tasksDatesSet = React.useMemo(() => {
      const set = new Set<string>();
      if (data) {
        data.forEach((task) => {
          const datePart = task.start_date.split(" ")[0];
          set.add(datePart);
        });
      }
      return set;
    }, [data]);
  
    const isTaskDate = React.useCallback((date: Date) => {
      const dStr = format(date, "yyyy-MM-dd");
      return tasksDatesSet.has(dStr);
    }, [tasksDatesSet]);
  
    // const updateURL = (key, value) => {
    //       const url = new URL(window.location);
    //       url.searchParams.set(key, value);
    //       window.history.pushState({}, "", url);
    //   };
    
    const handleDateChange = (date) => {
      console.log("date", date)
      if(searchParams.get("date") === date) return;
      // updateURL("date", date);
      navigate(`/calendar?date=${date}`)
      setSelectedDate(date);
    }

  return (
    <div className="w-full h-full relative">
      {/* Two Calendar Components */}
      <div className="flex flex-col space-y-8">
        <Calendar
          mode="single"
          showOutsideDays={false}
          timeZone="Asia/Calcutta"
          className="min-w-full"
          month={firstMonth}
          selected={selectedDate}
          onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
          modifiers={{ hasTask: isTaskDate }}
          modifiersClassNames={{ hasTask: "border-b border-[#000399] dark:border-primary dark:text-primary text-[#000399]" }}
        />
        <Calendar
          mode="single"
          showOutsideDays={false}
          timeZone="Asia/Calcutta"
          className="min-w-full"
          month={secondMonth}
          selected={selectedDate}
          onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
          modifiers={{ hasTask: isTaskDate }}
          modifiersClassNames={{ hasTask: "border-b border-[#000399] dark:border-primary dark:text-primary text-[#000399]" }}
        />
      </div>
      {/* Central Navigation Arrows */}
      <div className="flex items-center justify-center gap-4 pt-10">
        <button
          onClick={handlePrev}
          className="p-2 border rounded hover:bg-gray-100"
          aria-label="Previous Month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="p-2 border rounded hover:bg-gray-100"
          aria-label="Next Month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DesktopTaskCalendar;
