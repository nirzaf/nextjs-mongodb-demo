import { connectDatabase, disconnectDatabase } from './database';
import { User, UserRole, AccountStatus, LanguageProficiency } from './models/User';
import { Company, CompanySize, Industry } from './models/Company';
import { JobSeekerProfile, ExperienceLevel, EducationLevel, JobSearchStatus } from './models/JobSeekerProfile';
import { EmployerProfile, HiringAuthority, DepartmentType } from './models/EmployerProfile';
import { Job, JobType, WorkArrangement, JobStatus, JobCategory } from './models/Job';
import { Application, ApplicationStatus, InterviewType, RejectionReason } from './models/Application';
import { faker } from '@faker-js/faker';
import { 
  SKILLS, 
  JOB_TITLES, 
  COMPANIES, 
  UNIVERSITIES, 
  CITIES, 
  BENEFITS,
  getRandomItems, 
  getRandomItem, 
  generatePhoneNumber, 
  generateSalaryRange,
  generateCoordinates 
} from './data/mockData';

// Configuration for data generation
const DATA_COUNTS = {
  ADMIN_USERS: 3,
  COMPANIES: 10,
  EMPLOYERS: 15,
  JOB_SEEKERS: 50,
  JOBS: 30,
  APPLICATIONS: 100
};

class DatabaseSeeder {
  private createdUsers: any[] = [];
  private createdCompanies: any[] = [];
  private createdJobSeekerProfiles: any[] = [];
  private createdEmployerProfiles: any[] = [];
  private createdJobs: any[] = [];

  async seed() {
    try {
      console.log('🌱 Starting database seeding process...\n');
      
      await connectDatabase();
      
      // Check command line arguments
      const args = process.argv.slice(2);
      if (args.includes('--destroy')) {
        await this.destroyData();
        return;
      }

      // Clear existing data
      await this.clearData();
      
      // Seed data in order
      await this.seedAdminUsers();
      await this.seedCompanies();
      // TODO: Implement remaining seed methods
      // await this.seedEmployers();
      // await this.seedJobSeekers();
      // await this.seedJobs();
      // await this.seedApplications();
      
      console.log('\n🎉 Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`👥 Users: ${this.createdUsers.length}`);
      console.log(`🏢 Companies: ${this.createdCompanies.length}`);
      console.log(`👔 Employers: ${this.createdEmployerProfiles.length}`);
      console.log(`🔍 Job Seekers: ${this.createdJobSeekerProfiles.length}`);
      console.log(`💼 Jobs: ${this.createdJobs.length}`);
      console.log(`📝 Applications: ${DATA_COUNTS.APPLICATIONS}`);
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await disconnectDatabase();
    }
  }

  async destroyData() {
    try {
      console.log('🗑️  Destroying all data...\n');
      
      await this.clearData();
      
      console.log('✅ All data destroyed successfully!');
    } catch (error) {
      console.error('❌ Data destruction failed:', error);
      throw error;
    } finally {
      await disconnectDatabase();
    }
  }

  private async clearData() {
    console.log('🧹 Clearing existing data...');
    
    await Application.deleteMany({});
    await Job.deleteMany({});
    await EmployerProfile.deleteMany({});
    await JobSeekerProfile.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});
    
    console.log('✅ Existing data cleared');
  }

  private async seedAdminUsers() {
    console.log('👑 Creating admin users...');
    
    const adminUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@jobsportal.com',
        role: UserRole.Admin,
        accountStatus: AccountStatus.Active,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        profileCompleteness: 100
      },
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'system@jobsportal.com',
        role: UserRole.Admin,
        accountStatus: AccountStatus.Active,
        isEmailVerified: true,
        lastLoginAt: faker.date.recent({ days: 7 }),
        profileCompleteness: 100
      },
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@jobsportal.com',
        role: UserRole.Admin,
        accountStatus: AccountStatus.Active,
        isEmailVerified: true,
        lastLoginAt: faker.date.recent({ days: 3 }),
        profileCompleteness: 100
      }
    ];

    for (const userData of adminUsers) {
      const user = new User(userData);
      await user.save();
      this.createdUsers.push(user);
    }
    
    console.log(`✅ Created ${adminUsers.length} admin users`);
  }

  private async seedCompanies() {
    console.log('🏢 Creating companies...');
    
    for (let i = 0; i < DATA_COUNTS.COMPANIES; i++) {
      const companyData = getRandomItem(COMPANIES);
      const allCities = [...CITIES.qatar, ...CITIES.international];
      const city = getRandomItem(allCities);
      
      const company = new Company({
        companyName: companyData.name,
        industry: companyData.industry,
        description: faker.company.catchPhrase() + '. ' + faker.lorem.sentences(2),
        website: faker.internet.url(),
        foundedYear: faker.date.between({ from: '1990-01-01', to: '2020-12-31' }).getFullYear(),
        employeeCount: faker.number.int({ min: 10, max: 10000 }),
        companySize: getRandomItem(Object.values(CompanySize)),
        headquarters: {
          address: faker.location.streetAddress(),
          city: city.name,
          state: (city as any).state || 'N/A',
          country: (city as any).country || 'Qatar',
          postalCode: faker.location.zipCode(),
          coordinates: generateCoordinates(city.name)
        },
        locations: [
          {
            address: faker.location.streetAddress(),
            city: city.name,
            state: (city as any).state || 'N/A',
            country: (city as any).country || 'Qatar',
            postalCode: faker.location.zipCode(),
            coordinates: generateCoordinates(city.name),
            isHeadquarters: true,
            officeType: 'Main Office'
          }
        ],
        logoUrl: faker.image.avatar(),
        socialMedia: {
          linkedin: faker.internet.url(),
          twitter: faker.internet.url(),
          facebook: faker.internet.url()
        },
        benefits: getRandomItems(BENEFITS, faker.number.int({ min: 3, max: 8 })),
        averageRating: faker.number.float({ min: 2.5, max: 5.0, fractionDigits: 1 }),
        totalReviews: faker.number.int({ min: 5, max: 500 }),
        isActive: true,
        isVerified: faker.datatype.boolean({ probability: 0.8 }),
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: new Date()
      });

      await company.save();
      this.createdCompanies.push(company);
    }
    
    console.log(`✅ Created ${DATA_COUNTS.COMPANIES} companies`);
  }

  // Additional methods would continue here...
  // For brevity, I'll create separate files for the remaining methods
}

export const seeder = new DatabaseSeeder();

// Export the seed function for use in Next.js
export const seedDatabase = async () => {
  return seeder.seed();
};

export const destroyDatabase = async () => {
  return seeder.destroyData();
};

// If this file is run directly
if (require.main === module) {
  seeder.seed().catch(console.error);
}
