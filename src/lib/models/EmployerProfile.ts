import mongoose, { Schema, Document, Types } from 'mongoose';

// Enums for Employer-related data
export enum HiringAuthority {
  FullAuthority = 'Full Authority',
  LimitedAuthority = 'Limited Authority',
  NoAuthority = 'No Authority',
  TeamLead = 'Team Lead'
}

export enum DepartmentType {
  HR = 'Human Resources',
  Engineering = 'Engineering',
  Marketing = 'Marketing',
  Sales = 'Sales',
  Finance = 'Finance',
  Operations = 'Operations',
  ProductManagement = 'Product Management',
  Design = 'Design',
  DataScience = 'Data Science',
  CustomerSuccess = 'Customer Success',
  Legal = 'Legal',
  Executive = 'Executive'
}

// Sub-schemas for nested objects
const HiringPreferencesSchema = new Schema({
  preferredExperienceLevels: [{
    type: String,
    enum: ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive']
  }],
  preferredEducationLevels: [{
    type: String,
    enum: ['High School', 'Associate Degree', 'Bachelor Degree', 'Master Degree', 'PhD', 'Certificate', 'Diploma']
  }],
  requiredSkills: [String],
  preferredSkills: [String],
  industryExperience: [String],
  languageRequirements: [{
    language: String,
    proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'] }
  }],
  salaryBudgetRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  willingToSponsorVisa: { type: Boolean, default: false },
  remoteWorkPolicy: { type: String, enum: ['Remote Only', 'Hybrid', 'On-site', 'Flexible'], default: 'Flexible' }
}, { _id: false });

const TeamMemberSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  department: { type: String, enum: Object.values(DepartmentType) },
  startDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const HiringStatisticsSchema = new Schema({
  totalJobsPosted: { type: Number, default: 0 },
  activeJobPostings: { type: Number, default: 0 },
  totalApplicationsReceived: { type: Number, default: 0 },
  totalInterviewsConducted: { type: Number, default: 0 },
  totalHires: { type: Number, default: 0 },
  averageTimeToHire: { type: Number, default: 0 }, // in days
  averageApplicationsPerJob: { type: Number, default: 0 },
  hiringSuccessRate: { type: Number, default: 0 }, // percentage
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// EmployerProfile interface
export interface IEmployerProfile extends Document {
  userId: Types.ObjectId; // Reference to User document
  companyId: Types.ObjectId; // Reference to Company document
  
  // Professional Information
  jobTitle: string;
  department: DepartmentType;
  hiringAuthority: HiringAuthority;
  yearsInRole: number;
  yearsAtCompany: number;
  
  // Contact & Communication
  workEmail: string;
  workPhone: string;
  officeLocation: string;
  timezone: string;
  
  // Team Management
  teamSize: number;
  directReports: number;
  teamMembers: Array<{
    userId: Types.ObjectId;
    role: string;
    department: DepartmentType;
    startDate: Date;
    isActive: boolean;
  }>;
  
  // Hiring Preferences & Requirements
  hiringPreferences: {
    preferredExperienceLevels: string[];
    preferredEducationLevels: string[];
    requiredSkills: string[];
    preferredSkills: string[];
    industryExperience: string[];
    languageRequirements: Array<{
      language: string;
      proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
    }>;
    salaryBudgetRange: {
      min: number;
      max: number;
      currency: string;
    };
    willingToSponsorVisa: boolean;
    remoteWorkPolicy: 'Remote Only' | 'Hybrid' | 'On-site' | 'Flexible';
  };
  
  // Hiring Statistics & Performance
  hiringStatistics: {
    totalJobsPosted: number;
    activeJobPostings: number;
    totalApplicationsReceived: number;
    totalInterviewsConducted: number;
    totalHires: number;
    averageTimeToHire: number;
    averageApplicationsPerJob: number;
    hiringSuccessRate: number;
    lastUpdated: Date;
  };
  
  // Professional Development
  certifications: string[];
  specializations: string[]; // e.g., ["Technical Recruiting", "Executive Search", "Diversity Hiring"]
  
  // Preferences & Settings
  notificationSettings: {
    newApplications: boolean;
    applicationStatusUpdates: boolean;
    candidateMessages: boolean;
    teamUpdates: boolean;
    weeklyReports: boolean;
  };
  
  // Profile Information
  bio: string;
  linkedInUrl: string;
  isActive: boolean;
  lastLoginAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// EmployerProfile Schema Definition
const EmployerProfileSchema = new Schema<IEmployerProfile>({
  // User and Company References
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // Professional Information
  jobTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  department: {
    type: String,
    enum: Object.values(DepartmentType),
    required: true
  },
  hiringAuthority: {
    type: String,
    enum: Object.values(HiringAuthority),
    required: true
  },
  yearsInRole: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  yearsAtCompany: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },

  // Contact & Communication
  workEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, 'Please enter a valid work email']
  },
  workPhone: {
    type: String,
    trim: true
  },
  officeLocation: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },

  // Team Management
  teamSize: {
    type: Number,
    min: 0,
    default: 0
  },
  directReports: {
    type: Number,
    min: 0,
    default: 0
  },
  teamMembers: [TeamMemberSchema],

  // Hiring Preferences
  hiringPreferences: {
    type: HiringPreferencesSchema,
    default: () => ({})
  },

  // Hiring Statistics
  hiringStatistics: {
    type: HiringStatisticsSchema,
    default: () => ({})
  },

  // Professional Development
  certifications: [{ type: String, maxlength: 100 }],
  specializations: [{ type: String, maxlength: 100 }],

  // Notification Settings
  notificationSettings: {
    newApplications: { type: Boolean, default: true },
    applicationStatusUpdates: { type: Boolean, default: true },
    candidateMessages: { type: Boolean, default: true },
    teamUpdates: { type: Boolean, default: false },
    weeklyReports: { type: Boolean, default: true }
  },

  // Profile Information
  bio: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  linkedInUrl: {
    type: String,
    match: [/^https:\/\/(www\.)?linkedin\.com\/in\/.+/, 'Please enter a valid LinkedIn URL']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
// Note: userId index is automatically created by unique: true
EmployerProfileSchema.index({ companyId: 1 });
EmployerProfileSchema.index({ department: 1 });
EmployerProfileSchema.index({ hiringAuthority: 1 });
EmployerProfileSchema.index({ isActive: 1 });
EmployerProfileSchema.index({ 'hiringPreferences.requiredSkills': 1 });
EmployerProfileSchema.index({ 'hiringPreferences.preferredExperienceLevels': 1 });
EmployerProfileSchema.index({ 'hiringStatistics.totalJobsPosted': -1 });
EmployerProfileSchema.index({ 'hiringStatistics.hiringSuccessRate': -1 });

// Text index for search
EmployerProfileSchema.index({
  jobTitle: 'text',
  bio: 'text',
  'hiringPreferences.requiredSkills': 'text',
  'hiringPreferences.preferredSkills': 'text',
  specializations: 'text'
});

// Virtual for hiring efficiency score
EmployerProfileSchema.virtual('hiringEfficiencyScore').get(function() {
  const stats = this.hiringStatistics;
  if (!stats.totalJobsPosted || stats.totalJobsPosted === 0) return 0;

  // Calculate efficiency based on success rate and time to hire
  const successWeight = stats.hiringSuccessRate * 0.6;
  const timeWeight = stats.averageTimeToHire > 0 ? (30 / stats.averageTimeToHire) * 40 : 0; // 30 days is baseline

  return Math.min(Math.round(successWeight + timeWeight), 100);
});

// Virtual for active team members count
EmployerProfileSchema.virtual('activeTeamMembersCount').get(function() {
  return this.teamMembers.filter(member => member.isActive).length;
});

// Instance method to update hiring statistics
EmployerProfileSchema.methods.updateHiringStats = function(newJobPosted = false, newApplication = false, newInterview = false, newHire = false) {
  if (newJobPosted) {
    this.hiringStatistics.totalJobsPosted += 1;
    this.hiringStatistics.activeJobPostings += 1;
  }
  if (newApplication) {
    this.hiringStatistics.totalApplicationsReceived += 1;
  }
  if (newInterview) {
    this.hiringStatistics.totalInterviewsConducted += 1;
  }
  if (newHire) {
    this.hiringStatistics.totalHires += 1;
    this.hiringStatistics.activeJobPostings = Math.max(0, this.hiringStatistics.activeJobPostings - 1);
  }

  // Recalculate derived statistics
  if (this.hiringStatistics.totalJobsPosted > 0) {
    this.hiringStatistics.averageApplicationsPerJob =
      Math.round(this.hiringStatistics.totalApplicationsReceived / this.hiringStatistics.totalJobsPosted);

    this.hiringStatistics.hiringSuccessRate =
      Math.round((this.hiringStatistics.totalHires / this.hiringStatistics.totalJobsPosted) * 100);
  }

  this.hiringStatistics.lastUpdated = new Date();
  return this.save();
};

// Instance method to add team member
EmployerProfileSchema.methods.addTeamMember = function(userId: Types.ObjectId, role: string, department: DepartmentType) {
  // Check if user is already a team member
  const existingMember = this.teamMembers.find((member: any) => member.userId.equals(userId));
  if (existingMember) {
    existingMember.isActive = true;
    existingMember.role = role;
    existingMember.department = department;
  } else {
    this.teamMembers.push({
      userId,
      role,
      department,
      startDate: new Date(),
      isActive: true
    });
  }

  this.teamSize = this.teamMembers.filter((member: any) => member.isActive).length;
  return this.save();
};

// Static method to find by company
EmployerProfileSchema.statics.findByCompany = function(companyId: Types.ObjectId) {
  return this.find({ companyId, isActive: true });
};

// Static method to find by hiring authority
EmployerProfileSchema.statics.findByHiringAuthority = function(authority: HiringAuthority) {
  return this.find({ hiringAuthority: authority, isActive: true });
};

// Static method to find top performers
EmployerProfileSchema.statics.findTopPerformers = function(limit: number = 10) {
  return this.find({
    isActive: true,
    'hiringStatistics.totalJobsPosted': { $gte: 3 }
  })
  .sort({ 'hiringStatistics.hiringSuccessRate': -1, 'hiringStatistics.totalHires': -1 })
  .limit(limit);
};

export const EmployerProfile = mongoose.models.EmployerProfile || mongoose.model<IEmployerProfile>('EmployerProfile', EmployerProfileSchema);
