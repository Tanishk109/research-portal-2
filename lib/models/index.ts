import mongoose, { Schema, Model } from "mongoose";

// User Schema
export interface IUser {
  _id?: string;
  role: "faculty" | "student";
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  google_id?: string;
  auth_provider?: "credentials" | "google";
  profile_picture_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: { type: String, enum: ["faculty", "student"], required: true, index: true },
    first_name: { type: String, required: true, maxlength: 100 },
    last_name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, index: true, maxlength: 255 },
    password_hash: { type: String, required: true },
    google_id: { type: String, unique: true, sparse: true, index: true },
    auth_provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    profile_picture_url: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Faculty Profile Schema
export interface IFacultyProfile {
  _id?: string;
  user_id: mongoose.Types.ObjectId;
  faculty_id: string;
  department: string;
  specialization: string;
  date_of_joining: Date;
  date_of_birth: Date;
  phone?: string;
  bio?: string;
  created_at?: Date;
  updated_at?: Date;
}

const FacultyProfileSchema = new Schema<IFacultyProfile>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    faculty_id: { type: String, required: true, unique: true, index: true, maxlength: 50 },
    department: { type: String, required: true, maxlength: 100, index: true },
    specialization: { type: String, required: true, maxlength: 255 },
    date_of_joining: { type: Date, required: true },
    date_of_birth: { type: Date, required: true },
    phone: { type: String, maxlength: 30 },
    bio: { type: String, maxlength: 2000 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Student Profile Schema
export interface IStudentProfile {
  _id?: string;
  user_id: mongoose.Types.ObjectId;
  registration_number: string;
  department: string;
  year: string;
  cgpa: number;
  cv_url?: string;
  phone?: string;
  bio?: string;
  created_at?: Date;
  updated_at?: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    registration_number: { type: String, required: true, unique: true, index: true, maxlength: 50 },
    department: { type: String, required: true, maxlength: 100, index: true },
    year: { type: String, required: true, maxlength: 20, index: true },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    cv_url: { type: String, maxlength: 255 },
    phone: { type: String, maxlength: 30 },
    bio: { type: String, maxlength: 2000 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Student CV Schema
export interface IStudentCV {
  _id?: string;
  user_id: mongoose.Types.ObjectId;
  file_url: string;
  file_name?: string;
  mime_type?: string;
  uploaded_at?: Date;
}

const StudentCVSchema = new Schema<IStudentCV>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    file_url: { type: String, required: true },
    file_name: { type: String, maxlength: 255, default: "Resume.pdf" },
    mime_type: { type: String, maxlength: 100, default: "application/pdf" },
    uploaded_at: { type: Date, default: Date.now },
  }
);

// Student Certificate Schema
export interface IStudentCertificate {
  _id?: string;
  user_id: mongoose.Types.ObjectId;
  name: string;
  type?: string;
  file_url: string;
  date?: Date;
  uploaded_at?: Date;
}

const StudentCertificateSchema = new Schema<IStudentCertificate>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, maxlength: 255 },
    type: { type: String, maxlength: 100 },
    file_url: { type: String, required: true },
    date: { type: Date },
    uploaded_at: { type: Date, default: Date.now },
  }
);

// Student Skill Schema
export interface IStudentSkill {
  _id?: string;
  user_id: mongoose.Types.ObjectId;
  skill: string;
  added_at?: Date;
}

const StudentSkillSchema = new Schema<IStudentSkill>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    skill: { type: String, required: true, maxlength: 100 },
    added_at: { type: Date, default: Date.now },
  }
);

// Project Schema
export interface IProject {
  _id?: string;
  faculty_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements?: string;
  duration?: string;
  stipend?: string;
  status: "draft" | "active" | "closed" | "completed" | "inactive";
  max_students?: number;
  research_area?: string;
  positions?: number;
  start_date?: Date;
  deadline?: Date;
  min_cgpa?: string;
  eligibility?: string;
  prerequisites?: string;
  tags?: string[];
  created_at?: Date;
  updated_at?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    faculty_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 255 },
    description: { type: String, required: true },
    requirements: { type: String },
    duration: { type: String, maxlength: 100 },
    stipend: { type: String, maxlength: 100 },
    status: { type: String, enum: ["draft", "active", "closed", "completed", "inactive"], default: "active", index: true },
    max_students: { type: Number, default: 1 },
    research_area: { type: String },
    positions: { type: Number },
    start_date: { type: Date },
    deadline: { type: Date },
    min_cgpa: { type: String },
    eligibility: { type: String },
    prerequisites: { type: String },
    tags: [{ type: String }],
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Application Schema
export interface IApplication {
  _id?: string;
  project_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  cover_letter: string;
  status: "pending" | "accepted" | "rejected";
  applied_at?: Date;
  reviewed_at?: Date;
  feedback?: string;
  created_at?: Date;
  updated_at?: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    project_id: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    student_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cover_letter: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true },
    applied_at: { type: Date, default: Date.now, index: true },
    reviewed_at: { type: Date },
    feedback: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Unique compound index for project_id and student_id
ApplicationSchema.index({ project_id: 1, student_id: 1 }, { unique: true });

// Login Activity Schema
export interface ILoginActivity {
  _id?: string;
  user_id: mongoose.Types.ObjectId;
  timestamp?: Date;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  location?: string;
  device_type?: string;
}

const LoginActivitySchema = new Schema<ILoginActivity>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    ip_address: { type: String, maxlength: 45 },
    user_agent: { type: String },
    success: { type: Boolean, required: true, index: true },
    location: { type: String, maxlength: 255 },
    device_type: { type: String, maxlength: 50 },
  }
);

// Admin test entry schema used by the database operations page
export interface ITestEntry {
  _id?: string;
  title: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

const TestEntrySchema = new Schema<ITestEntry>(
  {
    title: { type: String, required: true, maxlength: 255 },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  const existingModel = mongoose.models[name] as Model<T> | undefined;

  if (existingModel && process.env.NODE_ENV !== "development") {
    return existingModel;
  }

  if (existingModel) {
    mongoose.deleteModel(name);
  }

  return mongoose.model<T>(name, schema);
}

export const User = getModel<IUser>("User", UserSchema);
export const FacultyProfile = getModel<IFacultyProfile>("FacultyProfile", FacultyProfileSchema);
export const StudentProfile = getModel<IStudentProfile>("StudentProfile", StudentProfileSchema);
export const StudentCV = getModel<IStudentCV>("StudentCV", StudentCVSchema);
export const StudentCertificate = getModel<IStudentCertificate>("StudentCertificate", StudentCertificateSchema);
export const StudentSkill = getModel<IStudentSkill>("StudentSkill", StudentSkillSchema);
export const Project = getModel<IProject>("Project", ProjectSchema);
export const Application = getModel<IApplication>("Application", ApplicationSchema);
export const LoginActivity = getModel<ILoginActivity>("LoginActivity", LoginActivitySchema);
export const TestEntry = getModel<ITestEntry>("TestEntry", TestEntrySchema);
