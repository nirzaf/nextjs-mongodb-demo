import mongoose, { Schema, Document, Types } from 'mongoose';

// Enums for Company-related data
export enum CompanySize {
  Startup = 'Startup', // 1-10 employees
  Small = 'Small', // 11-50 employees
  Medium = 'Medium', // 51-200 employees
  Large = 'Large', // 201-1000 employees
  Enterprise = 'Enterprise' // 1000+ employees
}

export enum Industry {
  Technology = 'Technology',
  Finance = 'Finance',
  Healthcare = 'Healthcare',
  Education = 'Education',
  Retail = 'Retail',
  Manufacturing = 'Manufacturing',
  RealEstate = 'Real Estate',
  Hospitality = 'Hospitality',
  Transportation = 'Transportation',
  Energy = 'Energy',
  Government = 'Government',
  NonProfit = 'Non-Profit',
  Construction = 'Construction',
  Agriculture = 'Agriculture',
  Media = 'Media'
}

// Sub-schemas for nested objects
const LocationSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Headquarters", "Branch Office"
  street: String,
  city: { type: String, required: true },
  state: String,
  country: { type: String, required: true },
  postalCode: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  isHeadquarters: { type: Boolean, default: false },
  phoneNumber: String,
  email: String
}, { _id: false });

const SocialMediaSchema = new Schema({
  platform: { type: String, enum: ['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'YouTube'], required: true },
  url: { type: String, required: true },
  followers: { type: Number, default: 0 }
}, { _id: false });

const CompanyBenefitsSchema = new Schema({
  category: { type: String, enum: ['Health', 'Retirement', 'Time Off', 'Professional Development', 'Wellness', 'Financial', 'Perks'], required: true },
  benefit: { type: String, required: true },
  description: String
}, { _id: false });

// Company interface
export interface ICompany extends Document {
  companyName: string;
  description: string;
  industry: Industry;
  companySize: CompanySize;
  foundedYear: number;
  website: string;
  logoUrl: string;
  bannerUrl: string;
  locations: Array<{
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    isHeadquarters: boolean;
    phoneNumber: string;
    email: string;
  }>;
  socialMedia: Array<{
    platform: 'LinkedIn' | 'Twitter' | 'Facebook' | 'Instagram' | 'YouTube';
    url: string;
    followers: number;
  }>;
  benefits: Array<{
    category: 'Health' | 'Retirement' | 'Time Off' | 'Professional Development' | 'Wellness' | 'Financial' | 'Perks';
    benefit: string;
    description: string;
  }>;
  companyValues: string[];
  mission: string;
  vision: string;
  // Reference to User documents with 'Employer' role who are admins of this company
  admins: Types.ObjectId[];
  employeeCount: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  tags: string[]; // e.g., ["Remote-friendly", "Fast-growing", "Diversity-focused"]
  createdAt: Date;
  updatedAt: Date;
}

// Company Schema Definition
const CompanySchema = new Schema<ICompany>({
  // Basic Company Information
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  industry: {
    type: String,
    enum: Object.values(Industry),
    required: true
  },
  companySize: {
    type: String,
    enum: Object.values(CompanySize),
    required: true
  },
  foundedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },

  // Visual Assets
  logoUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  bannerUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },

  // Location Information with Geospatial Support
  locations: {
    type: [LocationSchema],
    required: true,
    validate: {
      validator: function(locations: any[]) {
        // Ensure at least one headquarters location exists
        return locations.some(loc => loc.isHeadquarters);
      },
      message: 'At least one headquarters location is required'
    }
  },

  // Social Media Presence
  socialMedia: [SocialMediaSchema],

  // Company Benefits
  benefits: [CompanyBenefitsSchema],

  // Company Culture & Values
  companyValues: [{ type: String, maxlength: 100 }],
  mission: {
    type: String,
    maxlength: 500
  },
  vision: {
    type: String,
    maxlength: 500
  },

  // Management & Administration
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  // Company Statistics
  employeeCount: {
    type: Number,
    min: 1,
    default: 1
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    min: 0,
    default: 0
  },

  // Status & Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Tags for categorization and search
  tags: [{ type: String, maxlength: 50 }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
// Note: companyName index is automatically created by unique: true
CompanySchema.index({ industry: 1 });
CompanySchema.index({ companySize: 1 });
CompanySchema.index({ 'locations.city': 1 });
CompanySchema.index({ 'locations.country': 1 });
CompanySchema.index({ 'locations.coordinates': '2dsphere' }); // Geospatial index
CompanySchema.index({ tags: 1 });
CompanySchema.index({ isActive: 1, isVerified: 1 });
CompanySchema.index({ foundedYear: 1 });
CompanySchema.index({ employeeCount: 1 });
CompanySchema.index({ averageRating: -1 }); // Descending for top-rated companies

// Text index for search functionality
CompanySchema.index({
  companyName: 'text',
  description: 'text',
  'companyValues': 'text',
  mission: 'text',
  vision: 'text'
});

// Virtual for headquarters location
CompanySchema.virtual('headquarters').get(function() {
  return this.locations?.find(location => location.isHeadquarters) || null;
});

// Virtual for company age
CompanySchema.virtual('companyAge').get(function() {
  if (!this.foundedYear) return null;
  return new Date().getFullYear() - this.foundedYear;
});

// Instance method to get locations by city
CompanySchema.methods.getLocationsByCity = function(city: string) {
  return this.locations.filter((location: any) => 
    location.city.toLowerCase() === city.toLowerCase()
  );
};

// Instance method to add a new admin
CompanySchema.methods.addAdmin = function(userId: Types.ObjectId) {
  if (!this.admins.includes(userId)) {
    this.admins.push(userId);
    return this.save();
  }
  return this;
};

// Instance method to remove an admin
CompanySchema.methods.removeAdmin = function(userId: Types.ObjectId) {
  this.admins = this.admins.filter((adminId: Types.ObjectId) => !adminId.equals(userId));
  return this.save();
};

// Static method to find companies by industry
CompanySchema.statics.findByIndustry = function(industry: Industry) {
  return this.find({ industry, isActive: true });
};

// Static method to find companies within a radius of coordinates
CompanySchema.statics.findNearby = function(longitude: number, latitude: number, maxDistance: number = 10000) {
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
    isActive: true
  });
};

// Static method to find top-rated companies
CompanySchema.statics.findTopRated = function(limit: number = 10) {
  return this.find({ isActive: true, totalReviews: { $gte: 5 } })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit);
};

// Pre-save middleware to update employee count based on company size
CompanySchema.pre('save', function(next) {
  if (this.isModified('companySize')) {
    switch (this.companySize) {
      case CompanySize.Startup:
        this.employeeCount = Math.max(this.employeeCount, 1);
        break;
      case CompanySize.Small:
        this.employeeCount = Math.max(this.employeeCount, 11);
        break;
      case CompanySize.Medium:
        this.employeeCount = Math.max(this.employeeCount, 51);
        break;
      case CompanySize.Large:
        this.employeeCount = Math.max(this.employeeCount, 201);
        break;
      case CompanySize.Enterprise:
        this.employeeCount = Math.max(this.employeeCount, 1000);
        break;
    }
  }
  next();
});

export const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);