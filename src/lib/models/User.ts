import mongoose, { Schema, Document, Types } from 'mongoose';

// Enums for better type safety and data consistency
export enum UserRole {
  JobSeeker = 'JobSeeker',
  Employer = 'Employer',
  Admin = 'Admin'
}

export enum AccountStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
  PendingVerification = 'PendingVerification'
}

export enum LanguageProficiency {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Native = 'Native'
}

// Sub-schemas for nested objects
const ContactSchema = new Schema({
  phoneNumbers: [{
    type: { type: String, enum: ['Mobile', 'Home', 'Work'], required: true },
    number: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  }],
  addresses: [{
    type: { type: String, enum: ['Home', 'Work', 'Billing'], required: true },
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    isPrimary: { type: Boolean, default: false }
  }]
}, { _id: false });

const LanguageProficiencySchema = new Schema({
  language: { type: String, required: true },
  proficiency: { type: String, enum: Object.values(LanguageProficiency), required: true }
}, { _id: false });

const PrivacySettingsSchema = new Schema({
  profileVisibility: { type: String, enum: ['Public', 'Private', 'Connections'], default: 'Public' },
  showEmail: { type: Boolean, default: false },
  showPhone: { type: Boolean, default: false },
  allowSearchEngineIndexing: { type: Boolean, default: true }
}, { _id: false });

const NotificationPreferencesSchema = new Schema({
  email: {
    jobAlerts: { type: Boolean, default: true },
    applicationUpdates: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false }
  },
  sms: {
    applicationUpdates: { type: Boolean, default: false },
    importantNotifications: { type: Boolean, default: true }
  },
  push: {
    jobAlerts: { type: Boolean, default: true },
    applicationUpdates: { type: Boolean, default: true },
    messages: { type: Boolean, default: true }
  }
}, { _id: false });

const AccountPreferencesSchema = new Schema({
  theme: { type: String, enum: ['Light', 'Dark', 'Auto'], default: 'Light' },
  timezone: { type: String, default: 'UTC' },
  language: { type: String, default: 'en' }
}, { _id: false });

const LoginHistorySchema = new Schema({
  ipAddress: String,
  device: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  successful: { type: Boolean, default: true }
}, { _id: false });

// Main User interface extending Mongoose Document
export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  contact: {
    phoneNumbers: Array<{
      type: 'Mobile' | 'Home' | 'Work';
      number: string;
      isPrimary: boolean;
    }>;
    addresses: Array<{
      type: 'Home' | 'Work' | 'Billing';
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      isPrimary: boolean;
    }>;
  };
  nationality: string;
  residencyStatus: string;
  languageProficiency: Array<{
    language: string;
    proficiency: LanguageProficiency;
  }>;
  privacySettings: {
    profileVisibility: 'Public' | 'Private' | 'Connections';
    showEmail: boolean;
    showPhone: boolean;
    allowSearchEngineIndexing: boolean;
  };
  notificationPreferences: {
    email: {
      jobAlerts: boolean;
      applicationUpdates: boolean;
      marketingEmails: boolean;
    };
    sms: {
      applicationUpdates: boolean;
      importantNotifications: boolean;
    };
    push: {
      jobAlerts: boolean;
      applicationUpdates: boolean;
      messages: boolean;
    };
  };
  accountPreferences: {
    theme: 'Light' | 'Dark' | 'Auto';
    timezone: string;
    language: string;
  };
  loginHistory: Array<{
    ipAddress: string;
    device: string;
    userAgent: string;
    timestamp: Date;
    successful: boolean;
  }>;
  twoFactorEnabled: boolean;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema Definition
const UserSchema = new Schema<IUser>({
  // Authentication & Core Identity
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8 // In real app, this would be hashed
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },

  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  contact: ContactSchema,
  nationality: {
    type: String,
    required: true
  },
  residencyStatus: {
    type: String,
    enum: ['Citizen', 'Permanent Resident', 'Work Visa', 'Student Visa', 'Tourist'],
    required: true
  },

  // Language & Communication
  languageProficiency: [LanguageProficiencySchema],

  // Settings & Preferences
  privacySettings: {
    type: PrivacySettingsSchema,
    default: () => ({})
  },
  notificationPreferences: {
    type: NotificationPreferencesSchema,
    default: () => ({})
  },
  accountPreferences: {
    type: AccountPreferencesSchema,
    default: () => ({})
  },

  // Security & Account Management
  loginHistory: {
    type: [LoginHistorySchema],
    default: []
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  accountStatus: {
    type: String,
    enum: Object.values(AccountStatus),
    default: AccountStatus.Active
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
// Note: email index is automatically created by unique: true
UserSchema.index({ role: 1 });
UserSchema.index({ accountStatus: 1 });
UserSchema.index({ 'contact.addresses.city': 1 });
UserSchema.index({ nationality: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Instance method to check if user has specific language proficiency
UserSchema.methods.hasLanguageProficiency = function(language: string, minLevel: LanguageProficiency = LanguageProficiency.Beginner) {
  const userLanguage = this.languageProficiency.find((lang: any) => lang.language.toLowerCase() === language.toLowerCase());
  if (!userLanguage) return false;
  
  const levels = [LanguageProficiency.Beginner, LanguageProficiency.Intermediate, LanguageProficiency.Advanced, LanguageProficiency.Native];
  const userLevelIndex = levels.indexOf(userLanguage.proficiency);
  const minLevelIndex = levels.indexOf(minLevel);
  
  return userLevelIndex >= minLevelIndex;
};

// Static method to find users by role
UserSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, accountStatus: AccountStatus.Active });
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);