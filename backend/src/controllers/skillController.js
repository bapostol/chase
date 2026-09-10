import fs from 'fs/promises';
import path from 'path';
import { CHASE_PATHS, ALLOWED_CATEGORIES } from '../utils/paths.js';

export const skillController = {
  // Read a specific skill markdown prompt file
  async get(req, res) {
    const { skill_name, file_name } = req.params;

    // Enforce taxonomy verification gate
    if (!ALLOWED_CATEGORIES.includes(skill_name)) {
      return res.status(400).json({ error: 'Invalid skill category requested.' });
    }

    const targetedPath = CHASE_PATHS.getSkillFilePath(skill_name, file_name);

    try {
      const content = await fs.readFile(targetedPath, 'utf8');
      return res.json({ category: skill_name, slug: file_name, content });
    } catch (error) {
      // If a custom variation file doesn't exist, fallback to the default template seamlessly
      if (file_name !== 'default') {
        try {
          const fallbackPath = CHASE_PATHS.getSkillFilePath(skill_name, 'default');
          const content = await fs.readFile(fallbackPath, 'utf8');
          return res.json({ category: skill_name, slug: file_name, content, is_fallback: true });
        } catch (fallbackError) {
          console.error('Failed to read baseline fallback prompt:', fallbackError);
        }
      }
      
      return res.status(404).json({ error: 'Requested prompt file asset not found.' });
    }
  },

  // Create or Update a custom skill markdown prompt file
  async upsert(req, res) {
    const { skill_name, file_name } = req.params;
    const { content } = req.body;

    if (!ALLOWED_CATEGORIES.includes(skill_name)) {
      return res.status(400).json({ error: 'Invalid skill category target.' });
    }

    if (content === undefined || typeof content !== 'string') {
      return res.status(400).json({ error: 'Prompt content body payload must be a string.' });
    }

    // Explicit 403 Forbidden Guard: protect default.md from git alterations
    if (file_name.toLowerCase() === 'default') {
      return res.status(403).json({ error: 'Forbidden: Direct modification of the git default baseline template is prohibited.' });
    }

    const targetedPath = CHASE_PATHS.getSkillFilePath(skill_name, file_name);

    try {
      await fs.writeFile(targetedPath, content, 'utf8');
      return res.json({ message: 'Prompt variation securely synchronized to disk storage.', slug: file_name });
    } catch (error) {
      console.error('Failed to write markdown prompt asset to storage layer:', error);
      return res.status(500).json({ error: 'Failed to save prompt asset configuration changes.' });
    }
  },
  // Scan folders dynamically and return a dictionary of clean file slugs
  async listAll(req, res) {
    try {
      const resultDictionary = {};

      for (const category of ALLOWED_CATEGORIES) {
        const folderPath = path.join(CHASE_PATHS.skillsDir, category);
        
        try {
          const files = await fs.readdir(folderPath);
          
          // Filter for markdown files and strip out their extensions
          const cleanSlugs = files
            .filter(file => file.endsWith('.md'))
            .map(file => file.replace('.md', ''));
            
          resultDictionary[category] = cleanSlugs;
        } catch {
          // If a directory hasn't initialized yet, default to an empty array fallback
          resultDictionary[category] = ['default'];
        }
      }

      res.json(resultDictionary);
    } catch (error) {
      console.error('Failed to parse prompt directory matrices:', error);
      res.status(500).json({ error: 'Failed to discover local file variations.' });
    }
  }
};
