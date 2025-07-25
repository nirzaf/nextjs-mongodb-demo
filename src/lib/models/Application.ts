import mongoose, { Schema, Document, Types } from 'mongoose';

// Enums for Application-related data
export enum ApplicationStatus {
  Applied = 'Applied',
  UnderReview = 'Under Review',
  Shortlisted = 'Shortlisted',
  Interviewing = 'Interviewing',
  TechnicalTest = 'Technical Test',
  FinalRound = 'Final Round',
  Offered = 'Offered',
  Hired = 'Hired',
  Rejected = 'Rejected',
  Withdrawn = 'Withdrawn',
  Expired = 'Expired'
}

export enum InterviewType {
  Phone = 'Phone',
  Video = 'Video',
  InPerson = 'In-Person',
  Technical = 'Technical',
  Panel = 'Panel',
  Behavioral = 'Behavioral',
  Final = 'Final'
}

export enum RejectionReason {
  QualificationsNotMet = 'Qualifications Not Met',
  ExperienceInsufficient = 'Experience Insufficient',
  SkillsMismatch = 'Skills Mismatch',
  SalaryExpectationsMismatch = 'Salary Expectations Mismatch',
  LocationConstraints = 'Location Constraints',
  CulturalFitConcerns = 'Cultural Fit Concerns',
  PositionFilled = 'Position Filled',
  BudgetConstraints = 'Budget Constraints',
  Overqualified = 'Overqualified',
  Other = 'Other'
}

// Sub-schemas for nested objects
const ScreeningAnswerSchema = new Schema({
  questionId: String, // Reference to the question in the job posting
  question: { type: String, required: true },
  answer: { type: String, required: true },
  score: { type: Number, min: 0, max: 10 } // Employer can score the answer
}, { _id: false });

const InterviewSchema = new Schema({
  type: { type: String, enum: Object.values(InterviewType), required: true },
  scheduledDate: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // in minutes
  interviewers: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    title: String,
    email: String
  }],
  location: String, // Physical address or video link
  notes: { type: String, maxlength: 2000 },
  feedback: {
    technicalSkills: { type: Number, min: 1, max: 5 },
    communicationSkills: { type: Number, min: 1, max: 5 },
    culturalFit: { type: Number, min: 1, max: 5 },
    overallRating: { type: Number, min: 1, max: 5 },
    comments: { type: String, maxlength: 1000 },
    recommendation: { type: String, enum: ['Strongly Recommend', 'Recommend', 'Neutral', 'Do Not Recommend', 'Strongly Do Not Recommend'] }
  },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'], default: 'Scheduled' },
  completedAt: Date
}, { _id: false });

const StatusHistorySchema = new Schema({
  status: { type: String, enum: Object.values(ApplicationStatus), required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
  notes: { type: String, maxlength: 500 },
  isSystemGenerated: { type: Boolean, default: false }
}, { _id: false });

const DocumentSchema = new Schema({
  type: { type: String, enum: ['Resume', 'Cover Letter', 'Portfolio', 'Certificate', 'Other'], required: true },
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  size: Number, // in bytes
  mimeType: String
}, { _id: false });

const OfferDetailsSchema = new Schema({
  salary: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['Hourly', 'Monthly', 'Yearly'], default: 'Yearly' }
  },
  benefits: [String],
  startDate: Date,
  offerExpiryDate: Date,
  negotiable: { type: Boolean, default: true },
  additionalTerms: { type: String, maxlength: 1000 },
  offerLetter: {
    fileName: String,
    url: String,
    sentDate: { type: Date, default: Date.now }
  }
}, { _id: false });

// Application interface
export interface IApplication extends Document {
  // Core References
  jobId: Types.ObjectId; // Reference to Job
  jobSeekerId: Types.ObjectId; // Reference to JobSeekerProfile
  employerId: Types.ObjectId; // Reference to EmployerProfile
  companyId: Types.ObjectId; // Reference to Company
  
  // Application Details
  status: ApplicationStatus;
  appliedDate: Date;
  
  // Application Materials
  coverLetter: string;
  submittedResume: {
    fileName: string;
    url: string;
    uploadDate: Date;
  };
  additionalDocuments: Array<{
    type: 'Resume' | 'Cover Letter' | 'Portfolio' | 'Certificate' | 'Other';
    fileName: string;
    url: string;
    uploadDate: Date;
    size: number;
    mimeType: string;
  }>;
  
  // Screening Responses
  screeningAnswers: Array<{
    questionId: string;
    question: string;
    answer: string;
    score: number;
  }>;
  
  // Interview Process
  interviews: Array<{
    type: InterviewType;
    scheduledDate: Date;
    duration: number;
    interviewers: Array<{
      userId: Types.ObjectId;
      name: string;
      title: string;
      email: string;
    }>;
    location: string;
    notes: string;
    feedback: {
      technicalSkills: number;
      communicationSkills: number;
      culturalFit: number;
      overallRating: number;
      comments: string;
      recommendation: 'Strongly Recommend' | 'Recommend' | 'Neutral' | 'Do Not Recommend' | 'Strongly Do Not Recommend';
    };
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
    completedAt: Date;
  }>;
  
  // Status Tracking
  statusHistory: Array<{
    status: ApplicationStatus;
    changedBy: Types.ObjectId;
    changedAt: Date;
    notes: string;
    isSystemGenerated: boolean;
  }>;
  
  // Offer Management
  offerDetails: {
    salary: {
      amount: number;
      currency: string;
      period: 'Hourly' | 'Monthly' | 'Yearly';
    };
    benefits: string[];
    startDate: Date;
    offerExpiryDate: Date;
    negotiable: boolean;
    additionalTerms: string;
    offerLetter: {
      fileName: string;
      url: string;
      sentDate: Date;
    };
  };
  
  // Rejection Information
  rejectionReason: RejectionReason;
  rejectionNotes: string;
  rejectedAt: Date;
  rejectedBy: Types.ObjectId;
  
  // Communication & Notes
  internalNotes: string; // Private notes for employers
  candidateNotes: string; // Notes visible to candidate
  
  // Ratings & Feedback
  employerRating: number; // 1-5 rating of candidate by employer
  candidateRating: number; // 1-5 rating of company/process by candidate
  
  // Metadata
  source: string; // How they found the job (e.g., "Company Website", "LinkedIn", "Job Board")
  referredBy: Types.ObjectId; // Reference to User who referred this candidate
  
  // Timestamps
  lastViewedByEmployer: Date;
  lastViewedByCandidate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Application Schema Definition
const ApplicationSchema = new Schema<IApplication>({
  // Core References
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  jobSeekerId: {
    type: Schema.Types.ObjectId,
    ref: 'JobSeekerProfile',
    required: true,
    index: true
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'EmployerProfile',
    required: true,
    index: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },

  // Application Status & Date
  status: {
    type: String,
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.Applied,
    index: true
  },
  appliedDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Application Materials
  coverLetter: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  submittedResume: {
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  },
  additionalDocuments: [DocumentSchema],

  // Screening & Assessment
  screeningAnswers: [ScreeningAnswerSchema],

  // Interview Process
  interviews: [InterviewSchema],

  // Status History Tracking
  statusHistory: {
    type: [StatusHistorySchema],
    default: function() {
      return [{
        status: ApplicationStatus.Applied,
        changedBy: this.jobSeekerId,
        changedAt: new Date(),
        notes: 'Application submitted',
        isSystemGenerated: true
      }];
    }
  },

  // Offer Management
  offerDetails: OfferDetailsSchema,

  // Rejection Information
  rejectionReason: {
    type: String,
    enum: Object.values(RejectionReason)
  },
  rejectionNotes: {
    type: String,
    maxlength: 1000
  },
  rejectedAt: Date,
  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Communication & Notes
  internalNotes: {
    type: String,
    maxlength: 2000
  },
  candidateNotes: {
    type: String,
    maxlength: 1000
  },

  // Ratings
  employerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  candidateRating: {
    type: Number,
    min: 1,
    max: 5
  },

  // Metadata
  source: {
    type: String,
    default: 'Direct Application'
  },
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Activity Tracking
  lastViewedByEmployer: Date,
  lastViewedByCandidate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient querying
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ jobSeekerId: 1, status: 1 });
ApplicationSchema.index({ employerId: 1, status: 1 });
ApplicationSchema.index({ companyId: 1, status: 1 });
ApplicationSchema.index({ appliedDate: -1, status: 1 });
ApplicationSchema.index({ status: 1, appliedDate: -1 });
ApplicationSchema.index({ 'interviews.scheduledDate': 1, status: 1 });

// Unique constraint to prevent duplicate applications
ApplicationSchema.index({ jobId: 1, jobSeekerId: 1 }, { unique: true });

// Virtual for days since application
ApplicationSchema.virtual('daysSinceApplication').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.appliedDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for current interview
ApplicationSchema.virtual('currentInterview').get(function() {
  if (!this.interviews || this.interviews.length === 0) return null;
  return this.interviews
    .filter((interview: any) => interview.status === 'Scheduled')
    .sort((a: any, b: any) => a.scheduledDate.getTime() - b.scheduledDate.getTime())[0];
});

// Virtual for latest interview feedback
ApplicationSchema.virtual('latestFeedback').get(function() {
  if (!this.interviews || this.interviews.length === 0) return null;
  const completedInterviews = this.interviews
    .filter((interview: any) => interview.status === 'Completed' && interview.feedback)
    .sort((a: any, b: any) => b.completedAt.getTime() - a.completedAt.getTime());

  return completedInterviews.length > 0 ? completedInterviews[0].feedback : null;
});

// Virtual for average interview rating
ApplicationSchema.virtual('averageInterviewRating').get(function() {
  if (!this.interviews || this.interviews.length === 0) return null;

  const ratingsWithFeedback = this.interviews
    .filter((interview: any) => interview.feedback && interview.feedback.overallRating)
    .map((interview: any) => interview.feedback.overallRating);

  if (ratingsWithFeedback.length === 0) return null;

  const sum = ratingsWithFeedback.reduce((acc: number, rating: number) => acc + rating, 0);
  return Math.round((sum / ratingsWithFeedback.length) * 10) / 10;
});

// Virtual for time in current status
ApplicationSchema.virtual('timeInCurrentStatus').get(function() {
  const latestStatusChange = this.statusHistory && this.statusHistory.length > 0
    ? this.statusHistory[this.statusHistory.length - 1]
    : null;

  if (!latestStatusChange) return 0;

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - latestStatusChange.changedAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to update status
ApplicationSchema.methods.updateStatus = function(
  newStatus: ApplicationStatus,
  changedBy: Types.ObjectId,
  notes?: string,
  isSystemGenerated = false
) {
  // Don't update if status is the same
  if (this.status === newStatus) return this;

  const previousStatus = this.status;
  this.status = newStatus;

  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    changedAt: new Date(),
    notes: notes || `Status changed from ${previousStatus} to ${newStatus}`,
    isSystemGenerated
  });

  // Set rejection details if rejected
  if (newStatus === ApplicationStatus.Rejected) {
    this.rejectedAt = new Date();
    this.rejectedBy = changedBy;
  }

  return this.save();
};

// Instance method to schedule interview
ApplicationSchema.methods.scheduleInterview = function(interviewData: any) {
  this.interviews.push({
    ...interviewData,
    status: 'Scheduled'
  });

  // Update status to Interviewing if not already
  if (this.status === ApplicationStatus.Applied || this.status === ApplicationStatus.UnderReview) {
    this.updateStatus(ApplicationStatus.Interviewing, interviewData.scheduledBy, 'Interview scheduled');
  }

  return this.save();
};

// Instance method to complete interview
ApplicationSchema.methods.completeInterview = function(interviewIndex: number, feedback: any) {
  if (this.interviews && this.interviews[interviewIndex]) {
    this.interviews[interviewIndex].status = 'Completed';
    this.interviews[interviewIndex].completedAt = new Date();
    this.interviews[interviewIndex].feedback = feedback;
  }

  return this.save();
};

// Instance method to make offer
ApplicationSchema.methods.makeOffer = function(offerDetails: any, offeredBy: Types.ObjectId) {
  this.offerDetails = offerDetails;
  this.updateStatus(ApplicationStatus.Offered, offeredBy, 'Offer extended to candidate');

  return this.save();
};

// Static method to find by status
ApplicationSchema.statics.findByStatus = function(status: ApplicationStatus) {
  return this.find({ status });
};

// Static method to find applications for a job
ApplicationSchema.statics.findByJob = function(jobId: Types.ObjectId) {
  return this.find({ jobId }).populate('jobSeekerId', 'userId headline experienceLevel');
};

// Static method to find applications by job seeker
ApplicationSchema.statics.findByJobSeeker = function(jobSeekerId: Types.ObjectId) {
  return this.find({ jobSeekerId })
    .populate('jobId', 'title companyId status')
    .populate('companyId', 'companyName logoUrl')
    .sort({ appliedDate: -1 });
};

// Static method to get application statistics for employer
ApplicationSchema.statics.getEmployerStats = function(employerId: Types.ObjectId) {
  return this.aggregate([
    { $match: { employerId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDaysInStatus: { $avg: { $divide: [{ $subtract: [new Date(), '$appliedDate'] }, 86400000] } }
      }
    }
  ]);
};

// Pre-save middleware
ApplicationSchema.pre('save', function(next) {
  // Ensure unique application per job per candidate
  if (this.isNew) {
    // This will be enforced by the unique index, but we can add additional logic here
  }

  next();
});

export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
