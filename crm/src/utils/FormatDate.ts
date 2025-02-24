export const formatDate = (dateString : Date) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(dateString));
};


export const formatTime12Hour = (time: string) => {
    if(!time) return ""
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const formatCasualDate = (inputDate: string | Date): string => {
    const date = new Date(inputDate);
  
    const day = date.getDate().toString().padStart(2, '0');
  
    const shortMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = shortMonths[date.getMonth()];
  
    return `${day} ${month}`;
  }
  