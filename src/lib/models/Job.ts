import mongoose, { Schema, Document, Types } from 'mongoose';

// Enums for Job-related data
export enum JobType {
  FullTime = 'Full-time',
  PartTime = 'Part-time',
  Contract = 'Contract',
  Freelance = 'Freelance',
  Internship = 'Internship',
  Temporary = 'Temporary'
}

export enum WorkArrangement {
  Remote = 'Remote',
  Hybrid = 'Hybrid',
  OnSite = 'On-site'
}

export enum JobStatus {
  Draft = 'Draft',
  Active = 'Active',
  Paused = 'Paused',
  Closed = 'Closed',
  Filled = 'Filled',
  Cancelled = 'Cancelled'
}

export enum ExperienceLevel {
  EntryLevel = 'Entry Level',
  Junior = 'Junior',
  Mid = 'Mid-Level',
  Senior = 'Senior',
  Lead = 'Lead',
  Executive = 'Executive'
}

export enum JobCategory {
  Technology = 'Technology',
  Marketing = 'Marketing',
  Sales = 'Sales',
  Finance = 'Finance',
  HR = 'Human Resources',
  Operations = 'Operations',
  Design = 'Design',
  CustomerService = 'Customer Service',
  Healthcare = 'Healthcare',
  Education = 'Education',
  Legal = 'Legal',
  Manufacturing = 'Manufacturing',
  Retail = 'Retail',
  RealEstate = 'Real Estate',
  Hospitality = 'Hospitality',
  Transportation = 'Transportation',
  Energy = 'Energy',
  Agriculture = 'Agriculture',
  Media = 'Media',
  Government = 'Government',
  NonProfit = 'Non-Profit',
  Other = 'Other'
}

// Sub-schemas for nested objects
const SalaryRangeSchema = new Schema({
  min: { type: Number, required: true, min: 0 },
  max: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  period: { type: String, enum: ['Hourly', 'Monthly', 'Yearly'], default: 'Yearly' },
  isNegotiable: { type: Boolean, default: true }
}, { _id: false });

const LocationSchema = new Schema({
  city: { type: String, required: true },
  state: String,
  country: { type: String, required: true },
  postalCode: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  isRemoteAllowed: { type: Boolean, default: false }
}, { _id: false });

const ScreeningQuestionSchema = new Schema({
  question: { type: String, required: true, maxlength: 500 },
  type: { type: String, enum: ['Text', 'Multiple Choice', 'Yes/No', 'Number'], required: true },
  options: [String], // For multiple choice questions
  isRequired: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: false });

const RequirementSchema = new Schema({
  category: { type: String, enum: ['Education', 'Experience', 'Skills', 'Certification', 'Language', 'Other'], required: true },
  requirement: { type: String, required: true, maxlength: 200 },
  isRequired: { type: Boolean, default: true },
  priority: { type: String, enum: ['Must Have', 'Nice to Have', 'Preferred'], default: 'Must Have' }
}, { _id: false });

const BenefitSchema = new Schema({
  category: { type: String, enum: ['Health', 'Retirement', 'Time Off', 'Professional Development', 'Wellness', 'Financial', 'Perks'], required: true },
  benefit: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 300 }
}, { _id: false });

const JobAnalyticsSchema = new Schema({
  views: { type: Number, default: 0 },
  applications: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  clickThroughRate: { type: Number, default: 0 }, // percentage
  applicationRate: { type: Number, default: 0 }, // percentage
  averageTimeOnPage: { type: Number, default: 0 }, // seconds
  topReferralSources: [String],
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// Job interface
export interface IJob extends Document {
  // Basic Job Information
  title: string;
  description: string;
  shortDescription: string;
  jobCategory: JobCategory;
  jobType: JobType;
  workArrangement: WorkArrangement;
  experienceLevel: ExperienceLevel;
  
  // Company & Employer Information
  companyId: Types.ObjectId; // Reference to Company
  employerId: Types.ObjectId; // Reference to EmployerProfile
  hiringManagerId: Types.ObjectId; // Reference to User (hiring manager)
  
  // Location & Remote Work
  locations: Array<{
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
    isRemoteAllowed: boolean;
  }>;
  
  // Compensation
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    period: 'Hourly' | 'Monthly' | 'Yearly';
    isNegotiable: boolean;
  };
  
  // Requirements & Qualifications
  requirements: Array<{
    category: 'Education' | 'Experience' | 'Skills' | 'Certification' | 'Language' | 'Other';
    requirement: string;
    isRequired: boolean;
    priority: 'Must Have' | 'Nice to Have' | 'Preferred';
  }>;
  
  // Skills & Technologies
  requiredSkills: string[];
  preferredSkills: string[];
  
  // Benefits & Perks
  benefits: Array<{
    category: 'Health' | 'Retirement' | 'Time Off' | 'Professional Development' | 'Wellness' | 'Financial' | 'Perks';
    benefit: string;
    description: string;
  }>;
  
  // Application Process
  screeningQuestions: Array<{
    question: string;
    type: 'Text' | 'Multiple Choice' | 'Yes/No' | 'Number';
    options: string[];
    isRequired: boolean;
    order: number;
  }>;
  
  applicationDeadline: Date;
  expectedStartDate: Date;
  
  // Job Status & Lifecycle
  status: JobStatus;
  isUrgent: boolean;
  isFeatured: boolean;
  
  // Analytics & Performance
  analytics: {
    views: number;
    applications: number;
    saves: number;
    shares: number;
    clickThroughRate: number;
    applicationRate: number;
    averageTimeOnPage: number;
    topReferralSources: string[];
    lastUpdated: Date;
  };
  
  // SEO & Discoverability
  tags: string[];
  keywords: string[];
  
  // Dates
  postedDate: Date;
  lastModifiedDate: Date;
  closedDate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Job Schema Definition
const JobSchema = new Schema<IJob>({
  // Basic Job Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 300,
    trim: true
  },
  jobCategory: {
    type: String,
    enum: Object.values(JobCategory),
    required: true,
    index: true
  },
  jobType: {
    type: String,
    enum: Object.values(JobType),
    required: true,
    index: true
  },
  workArrangement: {
    type: String,
    enum: Object.values(WorkArrangement),
    required: true,
    index: true
  },
  experienceLevel: {
    type: String,
    enum: Object.values(ExperienceLevel),
    required: true,
    index: true
  },

  // Company & Employer References
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'EmployerProfile',
    required: true,
    index: true
  },
  hiringManagerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Location Information
  locations: {
    type: [LocationSchema],
    required: true,
    validate: {
      validator: function(locations: any[]) {
        return locations.length > 0;
      },
      message: 'At least one location is required'
    }
  },

  // Compensation
  salaryRange: {
    type: SalaryRangeSchema,
    required: true
  },

  // Requirements & Skills
  requirements: [RequirementSchema],
  requiredSkills: {
    type: [String],
    index: true
  },
  preferredSkills: [String],

  // Benefits
  benefits: [BenefitSchema],

  // Application Process
  screeningQuestions: [ScreeningQuestionSchema],
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(deadline: Date) {
        return !deadline || deadline > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  expectedStartDate: Date,

  // Job Status
  status: {
    type: String,
    enum: Object.values(JobStatus),
    default: JobStatus.Draft,
    index: true
  },
  isUrgent: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },

  // Analytics
  analytics: {
    type: JobAnalyticsSchema,
    default: () => ({})
  },

  // SEO & Discovery
  tags: {
    type: [String],
    index: true
  },
  keywords: [String],

  // Important Dates
  postedDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastModifiedDate: {
    type: Date,
    default: Date.now
  },
  closedDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Additional Indexes for efficient querying
JobSchema.index({ companyId: 1, status: 1 });
JobSchema.index({ employerId: 1, status: 1 });
JobSchema.index({ 'locations.city': 1, status: 1 });
JobSchema.index({ 'locations.country': 1, status: 1 });
JobSchema.index({ 'locations.coordinates': '2dsphere' }); // Geospatial index
JobSchema.index({ 'salaryRange.min': 1, 'salaryRange.max': 1 });
JobSchema.index({ postedDate: -1, status: 1 });
JobSchema.index({ applicationDeadline: 1, status: 1 });
JobSchema.index({ isUrgent: 1, isFeatured: 1, status: 1 });
JobSchema.index({ 'analytics.applications': -1 });
JobSchema.index({ 'analytics.views': -1 });

// Compound indexes for common queries
JobSchema.index({
  jobCategory: 1,
  experienceLevel: 1,
  workArrangement: 1,
  status: 1
});

// Text index for search functionality
JobSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  requiredSkills: 'text',
  preferredSkills: 'text',
  tags: 'text',
  keywords: 'text'
});

// Virtual for days since posted
JobSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const posted = this.postedDate || this.createdAt;
  const diffTime = Math.abs(now.getTime() - posted.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until deadline
JobSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.applicationDeadline) return null;
  const now = new Date();
  const diffTime = this.applicationDeadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for salary range display
JobSchema.virtual('salaryDisplay').get(function() {
  const { min, max, currency, period } = this.salaryRange;
  const periodAbbrev = period === 'Yearly' ? '/year' : period === 'Monthly' ? '/month' : '/hour';
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} ${periodAbbrev}`;
});

// Virtual for primary location
JobSchema.virtual('primaryLocation').get(function() {
  return this.locations && this.locations.length > 0 ? this.locations[0] : null;
});

// Virtual for application rate
JobSchema.virtual('applicationRate').get(function() {
  if (!this.analytics || !this.analytics.views || this.analytics.views === 0) return 0;
  return Math.round((this.analytics.applications / this.analytics.views) * 100);
});

// Instance method to update analytics
JobSchema.methods.updateAnalytics = function(type: 'view' | 'application' | 'save' | 'share', source?: string) {
  switch (type) {
    case 'view':
      this.analytics.views += 1;
      break;
    case 'application':
      this.analytics.applications += 1;
      break;
    case 'save':
      this.analytics.saves += 1;
      break;
    case 'share':
      this.analytics.shares += 1;
      break;
  }

  // Update rates
  if (this.analytics.views > 0) {
    this.analytics.applicationRate = Math.round((this.analytics.applications / this.analytics.views) * 100);
  }

  // Track referral sources
  if (source && type === 'view') {
    if (!this.analytics.topReferralSources.includes(source)) {
      this.analytics.topReferralSources.push(source);
    }
  }

  this.analytics.lastUpdated = new Date();
  return this.save();
};

// Instance method to close job
JobSchema.methods.closeJob = function(reason: 'Filled' | 'Cancelled' | 'Expired' = 'Filled') {
  this.status = reason === 'Filled' ? JobStatus.Filled : JobStatus.Closed;
  this.closedDate = new Date();
  return this.save();
};

// Static method to find active jobs
JobSchema.statics.findActive = function() {
  return this.find({
    status: JobStatus.Active,
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } }
    ]
  });
};

// Static method to find jobs by location
JobSchema.statics.findByLocation = function(city: string, country?: string) {
  const query: any = { 'locations.city': new RegExp(city, 'i'), status: JobStatus.Active };
  if (country) {
    query['locations.country'] = new RegExp(country, 'i');
  }
  return this.find(query);
};

// Static method to find jobs within salary range
JobSchema.statics.findBySalaryRange = function(minSalary: number, maxSalary: number, currency = 'USD') {
  return this.find({
    'salaryRange.currency': currency,
    'salaryRange.min': { $lte: maxSalary },
    'salaryRange.max': { $gte: minSalary },
    status: JobStatus.Active
  });
};

// Static method to find nearby jobs (geospatial)
JobSchema.statics.findNearby = function(longitude: number, latitude: number, maxDistance: number = 50000) {
  return this.find({
    'locations.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    status: JobStatus.Active
  });
};

// Pre-save middleware
JobSchema.pre('save', function(next) {
  // Update lastModifiedDate when job is modified
  if (this.isModified() && !this.isNew) {
    this.lastModifiedDate = new Date();
  }

  // Set postedDate when status changes to Active
  if (this.isModified('status') && this.status === JobStatus.Active && !this.postedDate) {
    this.postedDate = new Date();
  }

  next();
});

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
