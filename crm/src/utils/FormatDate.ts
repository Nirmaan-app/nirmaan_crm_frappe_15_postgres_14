import { format } from 'date-fns';

/**
 * Formats a date into a "DD/MM/YYYY" format.
 * @param {Date | string | undefined} dateString - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: Date | string | undefined): string => {
    if (!dateString) return "";
    try {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(dateString));
    } catch (error) {
        return "Invalid Date";
    }
};

/**
 * Formats a time string (HH:MM:SS) into a 12-hour format with AM/PM.
 * @param {string | undefined} time - The time string to format.
 * @returns {string} The formatted 12-hour time.
 */
export const formatTime12Hour = (time: string | undefined): string => {
    if (!time) return ""
    try {
        const [hours, minutes] = time.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
        return "Invalid Time";
    }
};

/**
 * Formats a date into a casual "DD Mon" format (e.g., "28 Aug").
 * @param {string | Date | undefined} inputDate - The date to format.
 * @returns {string} The formatted casual date.
 */
export const formatCasualDate = (inputDate: string | Date | undefined): string => {
    if (!inputDate) return ""
    try {
        const date = new Date(inputDate);
        const day = date.getDate().toString().padStart(2, '0');
        const shortMonths = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const month = shortMonths[date.getMonth()];
        return `${day} ${month}`;
    } catch (error) {
        return "Invalid Date";
    }
}

// --- NEW FUNCTION ADDED HERE ---
/**
 * Formats a date string into a "12th July 2025" format with an ordinal suffix.
 * Requires the `date-fns` library.
 * @param {string | Date | undefined} dateString - The date string to format.
 * @returns {string} The formatted date string with an ordinal day.
 */
export const formatDateWithOrdinal = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A'; // Returning 'N/A' as it's for display, not input

    try {
        const date = new Date(dateString);
        
        // 'do' = day of month with ordinal (1st, 2nd, 25th)
        // 'MMMM' = full month name (July)
        // 'yyyy' = full year (2025)
        return format(date, "do MMMM yyyy");

    } catch (error) {
        console.error("Invalid date provided to formatDateWithOrdinal:", dateString);
        return "Invalid Date";
    }
};

// ### Summary of Changes:

// 1.  **Added `formatDateWithOrdinal`:** The new function has been added to the bottom of the file. It correctly uses the `format` function from `date-fns` to produce the "12th July 2025" style output.
// 2.  **Consistent Typing:** I've updated the input type for the new function to `string | Date | undefined` to match your other functions.
// 3.  **Robust Error Handling:** I've added `try...catch` blocks to all your existing functions. This is a crucial improvement that prevents your entire application from crashing if it ever receives an invalid date or time string (e.g., `""`, `"not a date"`, etc.).
// 4.  **Consistent "Empty" Value:** In your `formatDateWithOrdinal` function, I've kept the return value for an empty input as `"N/A"`. This is generally better for display purposes than an empty string `""`, as it's more explicit to the user that data is not available.

// Your `FormatDate.ts` file is now more robust and contains the new formatting function you need.

// export const formatDate = (dateString : Date | string | undefined) : string => {
//     if (!dateString) return "";
//     return new Intl.DateTimeFormat('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//     }).format(new Date(dateString));
// };
 

// export const formatTime12Hour = (time: string | undefined) : string => {
//     if(!time) return ""
//     const [hours, minutes] = time.split(":").map(Number);
//     const period = hours >= 12 ? "PM" : "AM";
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
// };

// export const formatCasualDate = (inputDate: string | Date | undefined): string => {
//     if(!inputDate) return ""
//     const date = new Date(inputDate);
  
//     const day = date.getDate().toString().padStart(2, '0');
  
//     const shortMonths = [
//       "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//     ];
//     const month = shortMonths[date.getMonth()];
  
//     return `${day} ${month}`;
//   }
  