-- Up
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  url TEXT,
  status TEXT CHECK(status IN ('Ready to Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected')) DEFAULT 'Ready to Apply',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cv_drafts (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  display_version INTEGER NOT NULL,
  feedback_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE application_tags (
  application_id TEXT,
  tag_id TEXT,
  PRIMARY KEY (application_id, tag_id),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_drafts_app ON cv_drafts(application_id);

-- Down
DROP INDEX IF EXISTS idx_drafts_app;
DROP INDEX IF EXISTS idx_applications_status;
DROP TABLE IF EXISTS application_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS cv_drafts;
DROP TABLE IF EXISTS applications;
