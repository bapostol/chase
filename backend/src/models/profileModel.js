import { z } from 'zod';

// 1. Define the structural runtime validation rule schema
export const ProfileSchema = z.object({
  name: z.string().trim(),
  email: z.email('Invalid email address format.').or(z.literal('')),
  phone: z.string().trim(),
  location: z.string().trim(),
  website: z.url('Invalid URL format for website.').or(z.literal('')),
  github: z.url('Invalid URL format for GitHub.').or(z.literal('')),
  linkedin: z.url('Invalid URL format for LinkedIn.').or(z.literal('')),
  summary_baseline: z.string().trim(),
  is_profile_complete: z.boolean()
});

/**
 * 2. Export JSDoc Typings for static compilation enforcement
 * @typedef {z.infer<typeof ProfileSchema>} UserProfile
 */
