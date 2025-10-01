
export const salesTaskTypeOptions = [
  { label: "In Person Meeting", value: "In Person Meeting" },
  { label: "Call", value: "Call" },
  { label: "Virtual Meeting", value: "Virtual Meeting" },
  { label: "Follow-up", value: "Follow-up" },
  { label: "Submit BOQ", value: "Submit BOQ" },
  { label: "Follow-up BOQ", value: "Follow-up BOQ" },
];

export const estimationTaskTypeOptions = [
  { label: "Get Vendor Quotes", value: "Get Vendor Quotes" },
  { label: "Follow-up with Sales", value: "Follow-up with Sales" },
  { label: "Review", value: "Review" },
  { label: "Other", value: "Other" }
];

/**
 * A helper function to get the appropriate task type options based on a task profile.
 * This will be used by the Admin user's task creation flow.
 * @param profile - The task profile, either 'Sales' or 'Estimates'.
 * @returns An array of task type options for the given profile.
 */
export const getTaskTypesForProfile = (profile: 'Sales' | 'Estimates') => {
  if (profile === 'Sales') return salesTaskTypeOptions;
  if (profile === 'Estimates') return estimationTaskTypeOptions;
  return []; // Fallback for safety
};

export const BOQsubStatusOptions = [
  { label: "WIP", value: "WIP" },
  { label: "Awaiting clarification from Client", value: "Awaiting clarification from Client" },
  { label: "Awaiting quotation from Vendor", value: "Awaiting quotation from Vendor" },
  { label: "Review pending from Divyansh", value: "Review pending from Divyansh" }
];

export const BOQmainStatusOptions = [
  { label: "New", value: "New" },

  { label: "In-Progress", value: "In-Progress" },
  { label: "BOQ Submitted", value: "BOQ Submitted" },
  { label: "Partial BOQ Submitted", value: "Partial BOQ Submitted" },
  { label: "Revision Submitted", value: "Revision Submitted" },
  { label: "Revision Pending", value: "Revision Pending" },
  { label: "Negotiation", value: "Negotiation" },
  { label: "Won", value: "Won" },
  { label: "Lost", value: "Lost" },
  { label: "Dropped", value: "Dropped" },
  { label: "Hold", value: "Hold" },
];



export const LocationOptions = [
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Bengaluru", value: "Bengaluru" },
  { label: "Chennai", value: "Chennai" },
  { label: "Delhi", value: "Delhi" },
  { label: "Gurgaon", value: "Gurgaon" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Indore", value: "Indore" },
  { label: "Jaipur", value: "Jaipur" },
  { label: "Kanpur", value: "Kanpur" },
  { label: "Kochi", value: "Kochi" },
  { label: "Kolkata", value: "Kolkata" },
  { label: "Lucknow", value: "Lucknow" },
  { label: "Mumbai", value: "Mumbai" },
  { label: "Nagpur", value: "Nagpur" },
  { label: "Noida", value: "Noida" },
  { label: "Patna", value: "Patna" },
  { label: "Pune", value: "Pune" },
  { label: "Surat", value: "Surat" },
  { label: "Thane", value: "Thane" },
  { label: "Vadodara", value: "Vadodara" },
  { label: "Visakhapatnam", value: "Visakhapatnam" },
  { label: "Others", value: "Others" }
];



// src/constants/dropdownData.ts

// ... (your existing LocationOptions, TeamSizeOptions, etc.)

export const CompanyProgressPriorityOptions = [
    { label: "Meet Every Week", value: "Meet Every Week" },
  { label: "Meet Once Every 2 Weeks", value: "Meet Once Every 2 Weeks" },
  { label: "Meet Once a Month", value: "Meet Once a Month" },
  { label: "Hold", value: "Hold" },
];

export const TeamSizeOptions = [
  { label: "0-10", value: "0-10" },
  { label: "11-50", value: "11-50" },
  { label: "50-100", value: "50-100" },
  { label: "100-500", value: "100-500" },
  { label: "500+", value: "500+" },
];
