import fs from 'fs/promises';
import { CHASE_PATHS } from '../utils/paths.js';
import { ProfileSchema } from '../models/profileModel.js';

export const profileController = {
  // Fetch current user details from disk
  async get(req, res) {
    try {
      const data = await fs.readFile(CHASE_PATHS.profileJson, 'utf8');
      
      /** @type {import('../models/profileModel.js').UserProfile} */
      const rawProfile = JSON.parse(data);
      
      // Enforce structural check on database file readout data
      const verifiedProfile = ProfileSchema.parse(rawProfile);
      
      res.json(verifiedProfile);
    } catch (error) {
      console.error("Failed to parse or validate profile layout:", error);
      res.status(500).json({ error: "Failed to read sanitized profile file context." });
    }
  },

  // Save updated user data from the frontend wizard
  async update(req, res) {
    try {
      const cleanProfileData = ProfileSchema.parse({
        name: req.body.name || "",
        email: req.body.email || "",
        phone: req.body.phone || "",
        location: req.body.location || "",
        website: req.body.website || "",
        github: req.body.github || "",
        linkedin: req.body.linkedin || "",
        summary_baseline: req.body.summary_baseline || "",
        is_profile_complete: true // Elevate completion matrix
      });

      await fs.writeFile(
        CHASE_PATHS.profileJson, 
        JSON.stringify(cleanProfileData, null, 2), 
        'utf8'
      );

      res.json({ message: "Profile written successfully.", profile: cleanProfileData });
    } catch (error) {
      // Catch type validation failures gracefully and report parsing mismatches
      if (error instanceof import('zod').ZodError) {
        return res.status(400).json({ error: "Validation failed.", details: error.errors });
      }
      
      console.error("Failed to execute profile update payload:", error);
      res.status(500).json({ error: "Failed to compile profile transformations to file storage." });
    }
  }
};
