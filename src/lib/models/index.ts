import mongoose from 'mongoose';

// Prevent duplicate model registration
const isModelRegistered = (modelName: string): boolean => {
  try {
    mongoose.model(modelName);
    return true;
  } catch {
    return false;
  }
};

// Import models only if not already registered
if (!isModelRegistered('User')) {
  require('./User');
}
if (!isModelRegistered('Company')) {
  require('./Company');
}
if (!isModelRegistered('JobSeekerProfile')) {
  require('./JobSeekerProfile');
}
if (!isModelRegistered('EmployerProfile')) {
  require('./EmployerProfile');
}
if (!isModelRegistered('Job')) {
  require('./Job');
}
if (!isModelRegistered('Application')) {
  require('./Application');
}

// Re-export models and types
export * from './User';
export * from './Company';
// Export JobSeekerProfile with renamed ExperienceLevel to avoid conflict
export { JobSeekerProfile, ExperienceLevel as JobSeekerExperienceLevel } from './JobSeekerProfile';
// Export Job model with its own ExperienceLevel
export { Job, JobStatus, WorkArrangement, ExperienceLevel as JobExperienceLevel, JobType as JobModelType, JobCategory } from './Job';
export * from './EmployerProfile';
export * from './Application';
