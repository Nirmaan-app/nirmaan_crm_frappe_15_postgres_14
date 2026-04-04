import * as z from "zod";

export const boqFormSchema = z.object({
  // boq_name: nameValidationSchema,
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
  boq_type: z.array(z.string()).optional().default([]),
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
  if (data.boq_link && data.boq_link.trim() !== "") {
    const rawLink = data.boq_link.trim();
    const parsedLink = rawLink.startsWith("http://") || rawLink.startsWith("https://")
      ? rawLink
      : rawLink.startsWith("www.")
        ? `https://${rawLink}`
        : `https://${rawLink}`;

    if (!z.string().url().safeParse(parsedLink).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid URL (e.g., www.example.com or https://example.com).",
        path: ['boq_link'],
      });
    }
  }


  // --- Status-Specific Validations ---
  const normalizedStatus = (data.boq_status || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  switch (normalizedStatus) {
    case "new":
    case "in progress":
      // Deadline: Required
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project Submission Deadline is required.",
          path: ['boq_submission_date'],
        });
      }
      break;

    case "negotiation":
    case "hold": // Legacy mapping
    case "lost":
    case "dropped":
      // Remarks: Required (*)
      if (!data.remarks || data.remarks.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Remarks are required for "${data.boq_status}" status.`,
          path: ['remarks'],
        });
      }
      break;

    case "won":
      break;

    default:
      // Default case, for initial load or legacy statuses (BOQ Submitted, Revision Pending, etc.)
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

export const boqDetailsSchema = z.object({
  // boq_name: nameValidationSchema,
  boq_size: z.coerce
    .number({
      invalid_type_error: "Please enter a valid number for size.",
    })
    .nonnegative({ message: "Size must be a positive number." })
    .nullable()
    .optional(),
  boq_sub_status: z.string().optional(),
  boq_status: z.string().optional(),
  other_city: z.string().optional(),
  boq_value: z.coerce
    .number({
      invalid_type_error: "Please enter a valid number for value.",
    })
    .nonnegative({ message: "Value must be a positive number." })
    .nullable()
    .optional(),
  boq_type: z.array(z.string()).optional().default([]),
  boq_submission_date: z.string().optional(),
  boq_link: z.string().optional(),
  city: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  contact: z.string().optional(),
  remarks: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.company || data.company.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company is required.",
      path: ['company'],
    });
  }
  if (data.city === "Others" && (!data.other_city || data.other_city.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the city.",
      path: ['other_city'],
    });
  }
});
