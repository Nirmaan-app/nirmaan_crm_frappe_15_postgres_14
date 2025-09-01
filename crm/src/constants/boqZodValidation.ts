// Schema based on your Frappe Doctype and UI Mockup
import * as z from "zod";

export const boqFormSchema = z.object({
  boq_name: z.string() .min(1, "BOQ name is required")
    .regex(/^[a-zA-Z0-9\s-]/, "Only letters, numbers, spaces, and hyphens are allowed."),
   boq_size: z.coerce
      .number({
          // This message will be shown if the input cannot be converted to a number (e.g., "abc").
          invalid_type_error: "Please enter a valid number for size.",
      })
      .positive({ message: "Size must be a positive number." })
      // Use .nullable().optional() to correctly handle an empty field
      .nullable()
      .optional(),
      boq_sub_status: z.string().optional(),
      boq_status: z.string().optional(), 
    
    boq_value: z.coerce
      .number({
          // A specific, user-friendly message for the value field.
          invalid_type_error: "Please enter a valid number for value.",
      })
      .positive({ message: "Value must be a positive number." })
      .nullable()
      .optional(),
  // boq_size: z.number().optional(),
  boq_type: z.string().optional(),
  // boq_value: z.number().optional(),
  boq_submission_date: z.string().optional(),
  boq_link: z.string().optional(),
  city: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  contact: z.string().min(1, "Contact is required"),
  remarks: z.string().optional(),
  assigned_sales: z.string().optional(),
  assigned_estimations:z.string().optional()
  

}).superRefine((data, ctx) => {
  // --- Global Validations ---
  if (!data.company || data.company.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company is required.",
      path: ['company'],
    });
  }
  if (!data.contact || data.contact.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Contact is required.",
      path: ['contact'],
    });
  }

  // --- Status-Specific Validations ---
  switch (data.boq_status) {
    case "New":
      // Deadline: Required
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for New BOQs.",
          path: ['boq_submission_date'],
        });
      }
      // Link: Optional (handled by original schema)
      // Remarks: Optional (handled by original schema)
      break;

    case "In-Progress":
      // Sub Status: Required
      if (!data.boq_sub_status || data.boq_sub_status.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sub Status is required for In-Progress BOQs.",
          path: ['boq_sub_status'],
        });
      }
      // Deadline: Required (Copy old)
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for In-Progress BOQs.",
          path: ['boq_submission_date'],
        });
      }
      // Link: Optional
      // Remarks: Optional
      break;

    case "BOQ Submitted":
    case "Partial BOQ Submitted": // Same rules for both
      // Deadline: Not Required (X) - we might want to clear it in UI if set
      // Link: Required (*)
      if (!data.boq_link || data.boq_link.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Link is required when BOQ is Submitted.",
          path: ['boq_link'],
        });
      } else if (!z.string().url().safeParse(data.boq_link).success) {
         ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid URL for BOQ Link.",
          path: ['boq_link'],
        });
      }
      // Remarks: Required for "Partial BOQ Submitted"
      if (data.boq_status === "Partial BOQ Submitted" && (!data.remarks || data.remarks.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remarks are required for Partial BOQ Submitted.",
          path: ['remarks'],
        });
      }
      break;

    case "Revision Pending":
      // Sub Status: Required
      if (!data.boq_sub_status || data.boq_sub_status.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sub Status is required for Revision Pending BOQs.",
          path: ['boq_sub_status'],
        });
      }
      // Deadline: Required (Copy old)
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for Revision Pending BOQs.",
          path: ['boq_submission_date'],
        });
      }
      // Link: Optional
      // Remarks: Optional
      break;

    case "Revision Submitted":
      // Deadline: Not Required (X)
      // Link: Required (*)
      if (!data.boq_link || data.boq_link.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Link is required when Revision is Submitted.",
          path: ['boq_link'],
        });
      } else if (!z.string().url().safeParse(data.boq_link).success) {
         ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid URL for BOQ Link.",
          path: ['boq_link'],
        });
      }
      // Remarks: Optional
      break;

    case "Negotiation":
      // Deadline: Not Required (X)
      // Link: Not Required (X)
      // Remarks: Required (*)
      if (!data.remarks || data.remarks.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remarks are required for Negotiation BOQs.",
          path: ['remarks'],
        });
      }
      break;

    case "Won":
    case "Lost":
    case "Dropped":
      // Deadline: Not Required (X)
      // Link: Not Required (X)
      // Remarks: Required (*) for Lost/Dropped
      if ((data.boq_status === "Lost" || data.boq_status === "Dropped") && (!data.remarks || data.remarks.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Remarks are required for ${data.boq_status} BOQs.`,
          path: ['remarks'],
        });
      }
      break;

    case "Hold":
      // Deadline: Not Required (X)
      // Link: Not Required (X)
      // Remarks: Required (*)
      if (!data.remarks || data.remarks.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remarks are required for Hold BOQs.",
          path: ['remarks'],
        });
      }
      break;

    default:
      // Default case, perhaps for initial load or unhandled statuses
      break;
  }
});
