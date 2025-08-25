-- Demo data for research portal

-- Insert faculty users
INSERT INTO users (role, first_name, last_name, email, password_hash)
VALUES
  ('faculty', 'John', 'Smith', 'john.smith@faculty.test', '$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q'),
  ('faculty', 'Sarah', 'Johnson', 'sarah.johnson@faculty.test', '$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q'),
  ('faculty', 'Michael', 'Brown', 'michael.brown@faculty.test', '$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q');

-- Insert student users
INSERT INTO users (role, first_name, last_name, email, password_hash)
VALUES
  ('student', 'Alice', 'Wilson', 'alice.wilson@student.test', '$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q'),
  ('student', 'Bob', 'Davis', 'bob.davis@student.test', '$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q'),
  ('student', 'Carol', 'Miller', 'carol.miller@student.test', '$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q');

-- Insert faculty profiles
INSERT INTO faculty_profiles (user_id, faculty_id, department, specialization, date_of_joining, date_of_birth)
SELECT id, 'FAC001', 'Computer Science', 'Machine Learning', '2020-01-15', '1980-05-10' FROM users WHERE email = 'john.smith@faculty.test';
INSERT INTO faculty_profiles (user_id, faculty_id, department, specialization, date_of_joining, date_of_birth)
SELECT id, 'FAC002', 'Electronics', 'Signal Processing', '2019-08-20', '1975-12-03' FROM users WHERE email = 'sarah.johnson@faculty.test';
INSERT INTO faculty_profiles (user_id, faculty_id, department, specialization, date_of_joining, date_of_birth)
SELECT id, 'FAC003', 'Mechanical Engineering', 'Robotics', '2021-03-10', '1982-09-15' FROM users WHERE email = 'michael.brown@faculty.test';

-- Insert student profiles
INSERT INTO student_profiles (user_id, registration_number, department, year, cgpa)
SELECT id, 'STU001', 'Computer Science', '3', 8.5 FROM users WHERE email = 'alice.wilson@student.test';
INSERT INTO student_profiles (user_id, registration_number, department, year, cgpa)
SELECT id, 'STU002', 'Electronics', '2', 7.8 FROM users WHERE email = 'bob.davis@student.test';
INSERT INTO student_profiles (user_id, registration_number, department, year, cgpa)
SELECT id, 'STU003', 'Mechanical Engineering', '4', 9.1 FROM users WHERE email = 'carol.miller@student.test';

-- Insert demo projects for each faculty
INSERT INTO projects (faculty_id, title, description, research_area, positions, start_date, deadline, status, min_cgpa, eligibility, prerequisites, created_at)
SELECT fp.id, 'AI Research', 'Research on AI', 'Artificial Intelligence', 2, '2024-07-01', '2024-12-31', 'active', 8.0, 'BTech', 'Python', NOW() FROM faculty_profiles fp WHERE fp.faculty_id = 'FAC001';
INSERT INTO projects (faculty_id, title, description, research_area, positions, start_date, deadline, status, min_cgpa, eligibility, prerequisites, created_at)
SELECT fp.id, 'Signal Analysis', 'Signal Processing Project', 'Signal Processing', 1, '2024-07-01', '2024-12-31', 'active', 7.5, 'BTech', 'Matlab', NOW() FROM faculty_profiles fp WHERE fp.faculty_id = 'FAC002';
INSERT INTO projects (faculty_id, title, description, research_area, positions, start_date, deadline, status, min_cgpa, eligibility, prerequisites, created_at)
SELECT fp.id, 'Robotics Automation', 'Robotics Project', 'Robotics', 3, '2024-07-01', '2024-12-31', 'active', 8.2, 'BTech', 'C++', NOW() FROM faculty_profiles fp WHERE fp.faculty_id = 'FAC003'; 