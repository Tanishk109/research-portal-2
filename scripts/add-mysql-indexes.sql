-- Add recommended indexes for backend performance
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_user_id ON faculty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_faculty_id ON projects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_timestamp ON login_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id); 