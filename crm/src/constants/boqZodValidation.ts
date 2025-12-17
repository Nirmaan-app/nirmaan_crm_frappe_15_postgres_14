import * as z from "zod";
import { nameValidationSchema } from "./nameValidation";

export const boqFormSchema = z.object({
  boq_name: nameValidationSchema,
  boq_size: z.coerce
    .number({
      // This message will be shown if the input cannot be converted to a number (e.g., "abc").
      invalid_type_error: "Please enter a valid number for size.",
    })
    .nonnegative({ message: "Size must be a positive number." })
    // Use .nullable().optional() to correctly handle an empty field
    .nullable()
    .optional(),
  boq_sub_status: z.string().optional(),
  boq_status: z.string().optional(),
  other_city: z.string().optional(),

  boq_value: z.coerce
    .number({
      // A specific, user-friendly message for the value field.
      invalid_type_error: "Please enter a valid number for value.",
    })
    .nonnegative({ message: "Value must be a positive number." })
    .nullable()
    .optional(),
  // boq_size: z.number().optional(),
  boq_type: z.string().optional(),
  // boq_value: z.number().optional(),
  boq_submission_date: z.string().optional(),
  boq_link: z.string().optional(),
  city: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  contact: z.string().optional(),
  remarks: z.string().optional(),



}).superRefine((data, ctx) => {
  // --- Global Validations ---
  if (!data.company || data.company.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company is required.",
      path: ['company'],
    });
  }
  // if (!data.contact || data.contact.trim() === "") {
  //   ctx.addIssue({
  //     code: z.ZodIssueCode.custom,
  //     message: "Contact is required.",
  //     path: ['contact'],
  //   });
  // }
  if (data.city === "Others" && (!data.other_city || data.other_city.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the city.",
      path: ['other_city'],
    });
  }

  // --- Custom validation for website URL ---
  if (data.boq_link && data.boq_link.trim() !== "" &&
    !data.boq_link.startsWith("http://") && !data.boq_link.startsWith("https://") && !data.boq_link.startsWith("www.")) {
    // If it's not a valid URL starting with http/https, mark it as invalid here.
    // We will prepend 'https://' during submission.
    try {
      z.string().url().parse(`https://${data.boq_link}`);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid URL (e.g., www.example.com or https://example.com).",
        path: ['boq_link'],
      });
    }
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
      if (data.boq_status === "Partial BOQ Submitted" && (!data.boq_submission_date || data.boq_submission_date.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for In-Progress BOQs.",
          path: ['boq_submission_date'],
        });
      }
      // --- NEW VALIDATION LOGIC ADDED HERE ---
      if (!data.boq_value || data.boq_value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `BOQ Value is required for the "${data.boq_status}" status.`,
          path: ['boq_value'],
        });
      }
      // --- END OF NEW LOGIC ---

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
      // --- NEW VALIDATION LOGIC ADDED HERE ---
      if (!data.boq_value || data.boq_value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `BOQ Value is required for the "${data.boq_status}" status.`,
          path: ['boq_value'],
        });
      }
      // --- END OF NEW LOGIC ---
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



// src/constants/boqZodValidation.ts
export const assignedBoqSchema = z.object({
  assigned_sales: z.string().optional(), // Can be empty if unassigned
  assigned_estimations: z.string().optional(), // Can be empty if unassigned
});

// src/constants/boqZodValidation.ts
export type AssignedBoqFormValues = z.infer<typeof assignedBoqSchema>;

// --- Updated: Schema for RemarkBoqForm ---
export const remarkBoqSchema = z.object({
  // Title: Optional, but if provided, must not be empty or just whitespace.
  // We use preprocess to convert empty strings or strings that become empty after trimming to undefined.
  title: z.string()
    .min(1, { message: "Remark content cannot be empty." })
    .trim() // Ensure content is not just whitespace
    .refine(val => val.length > 0, { // Additional check after trim for robustness
      message: "Remark content cannot be empty."
    }),
  // Content: Required, must not be empty or just whitespace.
  content: z.string()
    .min(1, { message: "Remark content cannot be empty." })
    .trim() // Ensure content is not just whitespace
    .refine(val => val.length > 0, { // Additional check after trim for robustness
      message: "Remark content cannot be empty."
    }),
});
export type RemarkBoqFormValues = z.infer<typeof remarkBoqSchema>;

