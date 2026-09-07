import { z } from 'zod';

// 1. The Single Source of Truth: Base Schema for a Core Application Entity
const BaseApplication = z.object({
  title: z.string().trim().min(1, 'Job title is required.'),
  company: z.string().trim().min(1, 'Company name is required.'),
  url: z.url('Invalid URL format for job posting.').or(z.literal('')).nullable().optional(),
  status: z.enum(['Ready to Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected']).default('Ready to Apply')
});

// 2. Derive the Creation Input Schema (Extends base with input-only requirements)
export const ApplicationCreateSchema = BaseApplication.extend({
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
