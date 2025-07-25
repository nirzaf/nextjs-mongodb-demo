import mongoose, { Schema, Document, Types } from 'mongoose';

// Enums for JobSeeker-related data
export enum EducationLevel {
  HighSchool = 'High School',
  Associate = 'Associate Degree',
  Bachelor = 'Bachelor Degree',
  Master = 'Master Degree',
  PhD = 'PhD',
  Certificate = 'Certificate',
  Diploma = 'Diploma'
}

export enum ExperienceLevel {
  EntryLevel = 'Entry Level', // 0-2 years
  Junior = 'Junior', // 2-5 years
  Mid = 'Mid-Level', // 5-8 years
  Senior = 'Senior', // 8-12 years
  Lead = 'Lead', // 12+ years
  Executive = 'Executive' // C-level, VP, Director
}

export enum EmploymentType {
  FullTime = 'Full-time',
  PartTime = 'Part-time',
  Contract = 'Contract',
  Freelance = 'Freelance',
  Internship = 'Internship'
}

export enum JobSearchStatus {
  ActivelyLooking = 'Actively Looking',
  OpenToOffers = 'Open to Offers',
  NotLooking = 'Not Looking',
  Employed = 'Currently Employed'
}

// Sub-schemas for nested objects
const ResumeSchema = new Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  parsedData: {
    skills: [String],
    experience: String,
    education: String,
    summary: String
  }
}, { _id: false });

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, enum: Object.values(EducationLevel), required: true },
  fieldOfStudy: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date, // null if currently studying
  gpa: { type: Number, min: 0, max: 4.0 },
  honors: [String], // e.g., ["Magna Cum Laude", "Dean's List"]
  activities: [String], // e.g., ["Student Government", "Computer Science Club"]
  isCurrentlyStudying: { type: Boolean, default: false }
}, { _id: false });

const ExperienceSchema = new Schema({
  companyName: { type: String, required: true },
  title: { type: String, required: true },
  employmentType: { type: String, enum: Object.values(EmploymentType), required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date, // null if currently working
  description: { type: String, maxlength: 1000 },
  achievements: [String], // Specific accomplishments
  technologies: [String], // Technologies used in this role
  isCurrentPosition: { type: Boolean, default: false }
}, { _id: false });

const SkillSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Technical', 'Soft', 'Language', 'Industry'], required: true },
  proficiencyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  yearsOfExperience: { type: Number, min: 0, default: 0 },
  certifications: [String] // Related certifications
}, { _id: false });

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expirationDate: Date,
  credentialId: String,
  url: String
}, { _id: false });

const PortfolioItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, maxlength: 500 },
  url: String,
  imageUrl: String,
  technologies: [String],
  completionDate: Date,
  category: { type: String, enum: ['Web Development', 'Mobile App', 'Design', 'Data Analysis', 'Research', 'Other'] }
}, { _id: false });

const JobPreferencesSchema = new Schema({
  desiredJobTitles: [String],
  desiredIndustries: [String],
  preferredLocations: [String],
  remoteWorkPreference: { type: String, enum: ['Remote Only', 'Hybrid', 'On-site', 'No Preference'], default: 'No Preference' },
  salaryExpectation: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  availabilityDate: Date,
  jobSearchStatus: { type: String, enum: Object.values(JobSearchStatus), default: JobSearchStatus.OpenToOffers },
  willingToRelocate: { type: Boolean, default: false }
}, { _id: false });

// JobSeekerProfile interface
export interface IJobSeekerProfile extends Document {
  userId: Types.ObjectId; // Reference to User document
  // Professional Summary
  headline: string; // Professional headline/tagline
  summary: string; // Professional summary/bio
  experienceLevel: ExperienceLevel;
  
  // Resume Management
  resumes: Array<{
    fileName: string;
    url: string;
    uploadDate: Date;
    isActive: boolean;
    parsedData: {
      skills: string[];
      experience: string;
      education: string;
      summary: string;
    };
  }>;
  
  // Education History
  education: Array<{
    institution: string;
    degree: EducationLevel;
    fieldOfStudy: string;
    startDate: Date;
    endDate: Date;
    gpa: number;
    honors: string[];
    activities: string[];
    isCurrentlyStudying: boolean;
  }>;
  
  // Work Experience
  experience: Array<{
    companyName: string;
    title: string;
    employmentType: EmploymentType;
    location: string;
    startDate: Date;
    endDate: Date;
    description: string;
    achievements: string[];
    technologies: string[];
    isCurrentPosition: boolean;
  }>;
  
  // Skills & Expertise
  skills: Array<{
    name: string;
    category: 'Technical' | 'Soft' | 'Language' | 'Industry';
    proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    yearsOfExperience: number;
    certifications: string[];
  }>;
  
  // Certifications
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expirationDate: Date;
    credentialId: string;
    url: string;
  }>;
  
  // Portfolio & Projects
  portfolio: Array<{
    title: string;
    description: string;
    url: string;
    imageUrl: string;
    technologies: string[];
    completionDate: Date;
    category: 'Web Development' | 'Mobile App' | 'Design' | 'Data Analysis' | 'Research' | 'Other';
  }>;
  
  // Job Preferences
  jobPreferences: {
    desiredJobTitles: string[];
    desiredIndustries: string[];
    preferredLocations: string[];
    remoteWorkPreference: 'Remote Only' | 'Hybrid' | 'On-site' | 'No Preference';
    salaryExpectation: {
      min: number;
      max: number;
      currency: string;
    };
    availabilityDate: Date;
    jobSearchStatus: JobSearchStatus;
    willingToRelocate: boolean;
  };
  
  // Social & Professional Links
  linkedInUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  personalWebsite: string;
  
  // Career Goals & Aspirations
  careerGoals: string;
  targetCompanies: string[];
  
  // Profile Statistics
  profileViews: number;
  profileCompleteness: number; // Calculated percentage
  lastUpdated: Date;
  
  // Privacy & Visibility
  isPublic: boolean;
  allowRecruiterContact: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// JobSeekerProfile Schema Definition
const JobSeekerProfileSchema = new Schema<IJobSeekerProfile>({
  // User Reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Professional Summary
  headline: {
    type: String,
    maxlength: 120,
    trim: true
  },
  summary: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  experienceLevel: {
    type: String,
    enum: Object.values(ExperienceLevel),
    required: true
  },
  
  // Resume Management
  resumes: {
    type: [ResumeSchema],
    validate: {
      validator: function(resumes: any[]) {
        // Ensure only one active resume at a time
        const activeResumes = resumes.filter(resume => resume.isActive);
        return activeResumes.length <= 1;
      },
      message: 'Only one resume can be active at a time'
    }
  },
  
  // Education & Experience
  education: [EducationSchema],
  experience: [ExperienceSchema],
  
  // Skills & Certifications
  skills: [SkillSchema],
  certifications: [CertificationSchema],
  
  // Portfolio
  portfolio: [PortfolioItemSchema],
  
  // Job Preferences
  jobPreferences: {
    type: JobPreferencesSchema,
    default: () => ({})
  },
  
  // Social & Professional Links
  linkedInUrl: {
    type: String,
    match: [/^https:\/\/(www\.)?linkedin\.com\/in\/.+/, 'Please enter a valid LinkedIn URL']
  },
  githubUrl: {
    type: String,
    match: [/^https:\/\/(www\.)?github\.com\/.+/, 'Please enter a valid GitHub URL']
  },
  portfolioUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  personalWebsite: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  
  // Career Goals
  careerGoals: {
    type: String,
    maxlength: 1000
  },
  targetCompanies: [{ type: String, maxlength: 100 }],
  
  // Profile Statistics
  profileViews: {
    type: Number,
    default: 0,
    min: 0
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Privacy Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  allowRecruiterContact: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
// Note: userId index is automatically created by unique: true
JobSeekerProfileSchema.index({ experienceLevel: 1 });
JobSeekerProfileSchema.index({ 'skills.name': 1 });
JobSeekerProfileSchema.index({ 'skills.category': 1 });
JobSeekerProfileSchema.index({ 'jobPreferences.preferredLocations': 1 });
JobSeekerProfileSchema.index({ 'jobPreferences.jobSearchStatus': 1 });
JobSeekerProfileSchema.index({ 'jobPreferences.desiredJobTitles': 1 });
JobSeekerProfileSchema.index({ 'jobPreferences.desiredIndustries': 1 });
JobSeekerProfileSchema.index({ 'education.degree': 1 });
JobSeekerProfileSchema.index({ 'education.fieldOfStudy': 1 });
JobSeekerProfileSchema.index({ isPublic: 1 });
JobSeekerProfileSchema.index({ allowRecruiterContact: 1 });

// Text index for search
JobSeekerProfileSchema.index({
  headline: 'text',
  summary: 'text',
  'skills.name': 'text',
  'experience.title': 'text',
  'experience.companyName': 'text',
  'education.fieldOfStudy': 'text',
  careerGoals: 'text'
});

// Virtual for total years of experience
JobSeekerProfileSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  const totalMs = this.experience.reduce((total: number, exp: any) => {
    const endDate = exp.endDate || new Date();
    const duration = endDate.getTime() - exp.startDate.getTime();
    return total + duration;
  }, 0);
  
  // Convert milliseconds to years
  return Math.round(totalMs / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10;
});

// Virtual for active resume
JobSeekerProfileSchema.virtual('activeResume').get(function() {
  if (!this.resumes || this.resumes.length === 0) return null;
  return this.resumes.find(resume => resume.isActive);
});

// Virtual for current position
JobSeekerProfileSchema.virtual('currentPosition').get(function() {
  if (!this.experience || this.experience.length === 0) return null;
  return this.experience.find(exp => exp.isCurrentPosition);
});

// Virtual for latest education
JobSeekerProfileSchema.virtual('latestEducation').get(function() {
  if (!this.education || this.education.length === 0) return null;
  return this.education.sort((a: any, b: any) => {
    const aDate = a.endDate || new Date();
    const bDate = b.endDate || new Date();
    return bDate.getTime() - aDate.getTime();
  })[0];
});

// Instance method to calculate profile completeness
JobSeekerProfileSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const maxScore = 100;
  
  // Basic info (20 points)
  if (this.headline) score += 5;
  if (this.summary) score += 10;
  if (this.experienceLevel) score += 5;
  
  // Resume (15 points)
  if (this.resumes && this.resumes.length > 0) score += 15;
  
  // Education (15 points)
  if (this.education && this.education.length > 0) score += 15;
  
  // Experience (20 points)
  if (this.experience && this.experience.length > 0) score += 20;
  
  // Skills (15 points)
  if (this.skills && this.skills.length >= 3) score += 15;
  
  // Professional links (10 points)
  if (this.linkedInUrl) score += 5;
  if (this.portfolioUrl || this.githubUrl) score += 5;
  
  // Career goals (5 points)
  if (this.careerGoals) score += 5;
  
  this.profileCompleteness = Math.min(score, maxScore);
  return this.profileCompleteness;
};

// Instance method to get skills by category
JobSeekerProfileSchema.methods.getSkillsByCategory = function(category: string) {
  if (!this.skills || this.skills.length === 0) return [];
  return this.skills.filter((skill: any) => skill.category === category);
};

// Instance method to add experience
JobSeekerProfileSchema.methods.addExperience = function(experienceData: any) {
  // Initialize experience array if it doesn't exist
  if (!this.experience) {
    this.experience = [];
  }
  
  // If this is marked as current position, unmark other current positions
  if (experienceData.isCurrentPosition) {
    this.experience.forEach((exp: any) => {
      exp.isCurrentPosition = false;
    });
  }
  
  this.experience.push(experienceData);
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find by experience level
JobSeekerProfileSchema.statics.findByExperienceLevel = function(level: ExperienceLevel) {
  return this.find({ experienceLevel: level, isPublic: true });
};

// Static method to find by skills
JobSeekerProfileSchema.statics.findBySkills = function(skillNames: string[]) {
  return this.find({
    'skills.name': { $in: skillNames },
    isPublic: true,
    allowRecruiterContact: true
  });
};

// Pre-save middleware to update profile completeness and lastUpdated
JobSeekerProfileSchema.pre('save', function(next) {
  if (this.isModified()) {
    (this as any).calculateCompleteness();
    this.lastUpdated = new Date();
  }
  next();
});

export const JobSeekerProfile = mongoose.models.JobSeekerProfile || mongoose.model<IJobSeekerProfile>('JobSeekerProfile', JobSeekerProfileSchema);