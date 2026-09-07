import { z } from 'zod';

// 1. The Single Source of Truth: Base Schema for a Core Application Entity
const BaseApplication = z.object({
    title: z.string().trim().min(1, 'Job title is required.'),
    company: z.string().trim().min(1, 'Company name is required.'),
    url: z.url('Invalid URL format for job posting.').or(z.literal('')).nullable().optional(),
    status: z.enum(['Ready to Apply', 'Applied', 'Interviewing', 'Ghosted', 'Offer', 'Rejected']).default('Ready to Apply'),
    is_archived: z.boolean().default(false)
});

// 2. Derive the Creation Input Schema (Extends base with input-only requirements)
export const ApplicationCreateSchema = BaseApplication.extend({
  description_text: z.string().trim().min(1, 'Job description is required.'),
  tags: z.array(z.string().trim()).optional().default([])
});

// 3. Derive the Read Response Schema (Extends base with system-generated tracking markers)
export const ApplicationResponseSchema = BaseApplication.extend({
    id: z.uuid(),
    tags: z.array(z.string()),
    created_at: z.string()
});

// 4. List Array Aggregator
export const ApplicationListResponseSchema = z.array(ApplicationResponseSchema);

/**
 * Export JSDoc Typings for static compilation enforcement
 * @typedef {z.infer<typeof ApplicationCreateSchema>} ApplicationCreateInput
 */

/**
 * Export JSDoc Typings for client read operations
 * @typedef {z.infer<typeof ApplicationResponseSchema>} ApplicationResponse
 */

// 5. Derive the Patch Schema by making every creation property dynamically optional
export const ApplicationPatchSchema = ApplicationCreateSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "Patch payload must contain at least one field to modify." }
);

/**
 * Export JSDoc Typings for partial updates
 * @typedef {z.infer<typeof ApplicationPatchSchema>} ApplicationPatchInput
 */