import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Walk backward out of backend/src/utils/ to the repo root, then step down into data/
const STORAGE_ROOT = path.resolve(__dirname, '../../../data');

export const CHASE_PATHS = {
  dbPath: path.join(STORAGE_ROOT, 'tracker.db'),
  documentsDir: path.join(STORAGE_ROOT, 'documents'),
  masterCvsDir: path.join(STORAGE_ROOT, 'documents', 'master_cvs'),
  applicationsDir: path.join(STORAGE_ROOT, 'documents', 'applications'),

  // Deterministic file-system pathways mapped directly to incoming UUID v4 strings
  getMasterCvPath: (masterCvId) => 
    path.join(STORAGE_ROOT, 'documents', 'master_cvs', `${masterCvId}.docx`),

  getApplicationFolder: (applicationId) => 
    path.join(STORAGE_ROOT, 'documents', 'applications', applicationId),

  getJobDescriptionPath: (applicationId) => 
    path.join(STORAGE_ROOT, 'documents', 'applications', applicationId, 'job_desc.txt'),

  getDraftMarkdownPath: (applicationId, draftId) => 
    path.join(STORAGE_ROOT, 'documents', 'applications', applicationId, `${draftId}.md`)
};
