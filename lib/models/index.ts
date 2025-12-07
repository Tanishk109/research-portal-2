import mongoose, { Schema, Model } from "mongoose";

// User Schema
export interface IUser {
  _id?: string;
  role: "faculty" | "student";
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
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
  uploaded_at?: Date;
}

const StudentCVSchema = new Schema<IStudentCV>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    file_url: { type: String, required: true, maxlength: 255 },
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
    file_url: { type: String, required: true, maxlength: 255 },
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
  status: "active" | "inactive" | "completed";
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
    status: { type: String, enum: ["active", "inactive", "completed"], default: "active", index: true },
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

// Create models (use existing if already compiled)
export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export const FacultyProfile = (mongoose.models.FacultyProfile as Model<IFacultyProfile>) || mongoose.model<IFacultyProfile>("FacultyProfile", FacultyProfileSchema);
export const StudentProfile = (mongoose.models.StudentProfile as Model<IStudentProfile>) || mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);
export const StudentCV = (mongoose.models.StudentCV as Model<IStudentCV>) || mongoose.model<IStudentCV>("StudentCV", StudentCVSchema);
export const StudentCertificate = (mongoose.models.StudentCertificate as Model<IStudentCertificate>) || mongoose.model<IStudentCertificate>("StudentCertificate", StudentCertificateSchema);
export const StudentSkill = (mongoose.models.StudentSkill as Model<IStudentSkill>) || mongoose.model<IStudentSkill>("StudentSkill", StudentSkillSchema);
export const Project = (mongoose.models.Project as Model<IProject>) || mongoose.model<IProject>("Project", ProjectSchema);
export const Application = (mongoose.models.Application as Model<IApplication>) || mongoose.model<IApplication>("Application", ApplicationSchema);
export const LoginActivity = (mongoose.models.LoginActivity as Model<ILoginActivity>) || mongoose.model<ILoginActivity>("LoginActivity", LoginActivitySchema);

