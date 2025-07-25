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
      
      await this.destroyData();
      await this.createAdminUsers();
      await this.createCompanies();
      await this.createEmployers();
      await this.createJobSeekers();
      await this.createJobs();
      await this.createApplications();
      
      console.log('\n✅ Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   👥 Admin Users: ${DATA_COUNTS.ADMIN_USERS}`);
      console.log(`   🏢 Companies: ${DATA_COUNTS.COMPANIES}`);
      console.log(`   👔 Employers: ${DATA_COUNTS.EMPLOYERS}`);
      console.log(`   🔍 Job Seekers: ${DATA_COUNTS.JOB_SEEKERS}`);
      console.log(`   💼 Jobs: ${DATA_COUNTS.JOBS}`);
      console.log(`   📝 Applications: ${DATA_COUNTS.APPLICATIONS}`);
      
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      process.exit(1);
    } finally {
      await disconnectDatabase();
    }
  }

  async destroyData() {
    console.log('🗑️  Clearing existing data...');
    
    await Application.deleteMany({});
    await Job.deleteMany({});
    await EmployerProfile.deleteMany({});
    await JobSeekerProfile.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});
    
    console.log('✅ Existing data cleared');
  }

  async createAdminUsers() {
    console.log('👑 Creating admin users...');
    
    for (let i = 0; i < DATA_COUNTS.ADMIN_USERS; i++) {
      const adminUser = new User({
        email: faker.internet.email().toLowerCase(),
        password: 'admin123456', // In real app, this would be hashed
        role: UserRole.Admin,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        contact: {
          phoneNumbers: [{
            type: 'Mobile',
            number: generatePhoneNumber(),
            isPrimary: true
          }],
          addresses: [{
            type: 'Home',
            street: faker.location.streetAddress(),
            city: getRandomItem(CITIES.qatar).name,
            country: 'Qatar',
            postalCode: faker.location.zipCode(),
            isPrimary: true
          }]
        },
        nationality: faker.location.country(),
        residencyStatus: getRandomItem(['Citizen', 'Permanent Resident', 'Work Visa']),
        languageProficiency: [
          { language: 'English', proficiency: LanguageProficiency.Advanced },
          { language: 'Arabic', proficiency: getRandomItem(Object.values(LanguageProficiency)) }
        ],
        accountStatus: AccountStatus.Active,
        emailVerified: true,
        phoneVerified: true
      });
      
      await adminUser.save();
      this.createdUsers.push(adminUser);
    }
    
    console.log(`✅ Created ${DATA_COUNTS.ADMIN_USERS} admin users`);
  }

  async createCompanies() {
    console.log('🏢 Creating companies...');
    
    for (let i = 0; i < DATA_COUNTS.COMPANIES; i++) {
      const companyData = getRandomItem(COMPANIES);
      const qatarCity = getRandomItem(CITIES.qatar);
      const coordinates = generateCoordinates(qatarCity.name);
      
      const company = new Company({
        companyName: `${companyData.name} ${i + 1}`, // Make unique
        description: faker.company.catchPhrase() + '. ' + faker.lorem.paragraph(3),
        industry: companyData.industry as Industry,
        companySize: companyData.size as CompanySize,
        foundedYear: faker.date.between({ from: '1980-01-01', to: '2020-01-01' }).getFullYear(),
        website: `https://www.${companyData.name.toLowerCase().replace(/\s+/g, '')}${i + 1}.com`,
        logoUrl: faker.image.url({ width: 200, height: 200 }),
        bannerUrl: faker.image.url({ width: 1200, height: 400 }),
        locations: [{
          name: 'Headquarters',
          street: faker.location.streetAddress(),
          city: qatarCity.name,
          country: 'Qatar',
          postalCode: faker.location.zipCode(),
          coordinates: {
            type: 'Point',
            coordinates: coordinates
          },
          isHeadquarters: true,
          phoneNumber: generatePhoneNumber(),
          email: `info@${companyData.name.toLowerCase().replace(/\s+/g, '')}${i + 1}.com`
        }],
        socialMedia: [
          {
            platform: 'LinkedIn',
            url: `https://linkedin.com/company/${companyData.name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
            followers: faker.number.int({ min: 100, max: 50000 })
          }
        ],
        benefits: getRandomItems(BENEFITS, faker.number.int({ min: 5, max: 12 })),
        companyValues: getRandomItems([
          'Innovation', 'Integrity', 'Excellence', 'Teamwork', 'Customer Focus',
          'Diversity', 'Sustainability', 'Growth', 'Quality', 'Transparency'
        ], faker.number.int({ min: 3, max: 6 })),
        mission: faker.company.catchPhrase(),
        vision: faker.lorem.sentence(),
        admins: [], // Will be populated when creating employers
        employeeCount: faker.number.int({ min: 10, max: 5000 }),
        averageRating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
        totalReviews: faker.number.int({ min: 5, max: 500 }),
        isVerified: faker.datatype.boolean(0.8), // 80% chance of being verified
        tags: getRandomItems([
          'Remote-friendly', 'Fast-growing', 'Diversity-focused', 'Innovation-driven',
          'Employee-centric', 'Startup', 'Enterprise', 'Global', 'Local'
        ], faker.number.int({ min: 2, max: 5 }))
      });
      
      await company.save();
      this.createdCompanies.push(company);
    }
    
    console.log(`✅ Created ${DATA_COUNTS.COMPANIES} companies`);
  }

  async createEmployers() {
    console.log('👔 Creating employers...');

    for (let i = 0; i < DATA_COUNTS.EMPLOYERS; i++) {
      // Create employer user
      const employerUser = new User({
        email: faker.internet.email().toLowerCase(),
        password: 'employer123456',
        role: UserRole.Employer,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        contact: {
          phoneNumbers: [{
            type: 'Mobile',
            number: generatePhoneNumber(),
            isPrimary: true
          }],
          addresses: [{
            type: 'Home',
            street: faker.location.streetAddress(),
            city: getRandomItem(CITIES.qatar).name,
            country: 'Qatar',
            postalCode: faker.location.zipCode(),
            isPrimary: true
          }]
        },
        nationality: faker.location.country(),
        residencyStatus: getRandomItem(['Citizen', 'Permanent Resident', 'Work Visa']),
        languageProficiency: [
          { language: 'English', proficiency: LanguageProficiency.Advanced },
          { language: 'Arabic', proficiency: getRandomItem(Object.values(LanguageProficiency)) }
        ],
        accountStatus: AccountStatus.Active,
        emailVerified: true,
        phoneVerified: true
      });

      await employerUser.save();
      this.createdUsers.push(employerUser);

      // Assign to random company
      const company = getRandomItem(this.createdCompanies);
      company.admins.push(employerUser._id);
      await company.save();

      // Create employer profile
      const department = getRandomItem(Object.values(DepartmentType));
      const jobTitles = (JOB_TITLES as any)[department.toLowerCase().replace(/\s+/g, '')] || JOB_TITLES.technology;

      const employerProfile = new EmployerProfile({
        userId: employerUser._id,
        companyId: company._id,
        jobTitle: getRandomItem(jobTitles),
        department,
        hiringAuthority: getRandomItem(Object.values(HiringAuthority)),
        yearsInRole: faker.number.int({ min: 1, max: 15 }),
        yearsAtCompany: faker.number.int({ min: 1, max: 20 }),
        workEmail: `${employerUser.firstName.toLowerCase()}.${employerUser.lastName.toLowerCase()}@${company.companyName.toLowerCase().replace(/\s+/g, '').replace(/\d+/g, '')}.com`,
        workPhone: generatePhoneNumber(),
        officeLocation: company.locations[0].city,
        timezone: 'Asia/Qatar',
        teamSize: faker.number.int({ min: 1, max: 50 }),
        directReports: faker.number.int({ min: 0, max: 10 }),
        hiringPreferences: {
          preferredExperienceLevels: getRandomItems(Object.values(ExperienceLevel), faker.number.int({ min: 2, max: 4 })),
          requiredSkills: getRandomItems(SKILLS.technical, faker.number.int({ min: 3, max: 8 })),
          preferredSkills: getRandomItems(SKILLS.soft, faker.number.int({ min: 2, max: 5 })),
          salaryBudgetRange: generateSalaryRange('Senior'),
          willingToSponsorVisa: faker.datatype.boolean(0.3),
          remoteWorkPolicy: getRandomItem(['Remote Only', 'Hybrid', 'On-site', 'Flexible'])
        },
        certifications: getRandomItems([
          'Certified Recruiter', 'PHR', 'SHRM-CP', 'Project Management Professional',
          'Agile Certified Practitioner', 'Six Sigma Black Belt'
        ], faker.number.int({ min: 0, max: 3 })),
        specializations: getRandomItems([
          'Technical Recruiting', 'Executive Search', 'Diversity Hiring', 'Campus Recruiting',
          'International Hiring', 'Remote Team Building'
        ], faker.number.int({ min: 1, max: 3 })),
        bio: faker.lorem.paragraph(2),
        linkedInUrl: `https://linkedin.com/in/${employerUser.firstName.toLowerCase()}-${employerUser.lastName.toLowerCase()}`,
        isActive: true
      });

      await employerProfile.save();
      this.createdEmployerProfiles.push(employerProfile);
    }

    console.log(`✅ Created ${DATA_COUNTS.EMPLOYERS} employers`);
  }

  private generateEducationHistory() {
    const educationCount = faker.number.int({ min: 1, max: 3 });
    const education: any[] = [];

    for (let i = 0; i < educationCount; i++) {
      const startDate = faker.date.between({ from: '2000-01-01', to: '2020-01-01' });
      const endDate = faker.date.between({ from: startDate, to: '2024-01-01' });

      education.push({
        institution: getRandomItem(UNIVERSITIES),
        degree: getRandomItem(Object.values(EducationLevel)),
        fieldOfStudy: getRandomItem([
          'Computer Science', 'Software Engineering', 'Information Technology', 'Business Administration',
          'Marketing', 'Finance', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering',
          'Medicine', 'Nursing', 'Psychology', 'Education', 'Law', 'Architecture', 'Graphic Design'
        ]),
        startDate,
        endDate,
        gpa: faker.number.float({ min: 2.5, max: 4.0, fractionDigits: 2 }),
        honors: faker.datatype.boolean(0.3) ? getRandomItems(['Dean\'s List', 'Magna Cum Laude', 'Summa Cum Laude'], 1) : [],
        activities: getRandomItems([
          'Student Government', 'Computer Science Club', 'Debate Team', 'Sports Team',
          'Volunteer Work', 'Research Assistant', 'Teaching Assistant'
        ], faker.number.int({ min: 0, max: 3 })),
        isCurrentlyStudying: i === 0 && faker.datatype.boolean(0.1)
      });
    }

    return education;
  }

  private generateWorkExperience(experienceLevel: string) {
    const experienceYears = {
      'Entry Level': { min: 0, max: 2 },
      'Junior': { min: 2, max: 5 },
      'Mid-Level': { min: 5, max: 8 },
      'Senior': { min: 8, max: 12 },
      'Lead': { min: 12, max: 20 },
      'Executive': { min: 15, max: 30 }
    };

    const years = (experienceYears as any)[experienceLevel] || experienceYears['Mid-Level'];
    const jobCount = Math.min(Math.floor(years.max / 2), faker.number.int({ min: 1, max: 5 }));
    const experience: any[] = [];

    let currentDate = new Date();

    for (let i = 0; i < jobCount; i++) {
      const isCurrentPosition = i === 0 && faker.datatype.boolean(0.7);
      const startDate = faker.date.between({
        from: new Date(currentDate.getFullYear() - 3, 0, 1),
        to: currentDate
      });
      const endDate = isCurrentPosition ? null : faker.date.between({
        from: startDate,
        to: currentDate
      });

      experience.push({
        companyName: getRandomItem(COMPANIES).name,
        title: getRandomItem(JOB_TITLES.technology),
        employmentType: getRandomItem(['Full-time', 'Part-time', 'Contract', 'Internship']),
        location: getRandomItem(CITIES.qatar).name + ', Qatar',
        startDate,
        endDate,
        description: faker.lorem.paragraph(2),
        achievements: getRandomItems([
          'Increased team productivity by 25%',
          'Led successful project delivery',
          'Mentored junior developers',
          'Implemented new technologies',
          'Improved system performance',
          'Reduced costs by 15%'
        ], faker.number.int({ min: 1, max: 3 })),
        technologies: getRandomItems(SKILLS.technical, faker.number.int({ min: 3, max: 8 })),
        isCurrentPosition
      });

      currentDate = startDate;
    }

    return experience;
  }

  async createJobSeekers() {
    console.log('🔍 Creating job seekers...');

    for (let i = 0; i < DATA_COUNTS.JOB_SEEKERS; i++) {
      // Create job seeker user
      const jobSeekerUser = new User({
        email: faker.internet.email().toLowerCase(),
        password: 'jobseeker123456',
        role: UserRole.JobSeeker,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        contact: {
          phoneNumbers: [{
            type: 'Mobile',
            number: generatePhoneNumber(),
            isPrimary: true
          }],
          addresses: [{
            type: 'Home',
            street: faker.location.streetAddress(),
            city: getRandomItem(CITIES.qatar).name,
            country: 'Qatar',
            postalCode: faker.location.zipCode(),
            isPrimary: true
          }]
        },
        nationality: faker.location.country(),
        residencyStatus: getRandomItem(['Citizen', 'Permanent Resident', 'Work Visa', 'Student Visa']),
        languageProficiency: [
          { language: 'English', proficiency: getRandomItem(Object.values(LanguageProficiency)) },
          { language: 'Arabic', proficiency: getRandomItem(Object.values(LanguageProficiency)) }
        ],
        accountStatus: AccountStatus.Active,
        emailVerified: true,
        phoneVerified: faker.datatype.boolean(0.8)
      });

      await jobSeekerUser.save();
      this.createdUsers.push(jobSeekerUser);

      // Create job seeker profile
      const experienceLevel = getRandomItem(Object.values(ExperienceLevel));
      const skills = getRandomItems(SKILLS.technical, faker.number.int({ min: 5, max: 15 }))
        .concat(getRandomItems(SKILLS.soft, faker.number.int({ min: 3, max: 8 })));

      const jobSeekerProfile = new JobSeekerProfile({
        userId: jobSeekerUser._id,
        headline: faker.person.jobTitle(),
        summary: faker.lorem.paragraph(3),
        experienceLevel,
        resumes: [{
          fileName: `${jobSeekerUser.firstName}_${jobSeekerUser.lastName}_Resume.pdf`,
          url: faker.internet.url(),
          uploadDate: faker.date.recent({ days: 30 }),
          isActive: true,
          parsedData: {
            skills: skills.slice(0, 8),
            experience: faker.lorem.paragraph(),
            education: faker.lorem.sentence(),
            summary: faker.lorem.paragraph()
          }
        }],
        education: this.generateEducationHistory(),
        experience: this.generateWorkExperience(experienceLevel),
        skills: skills.map(skill => ({
          name: skill,
          category: SKILLS.technical.includes(skill) ? 'Technical' : 'Soft',
          proficiencyLevel: getRandomItem(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
          yearsOfExperience: faker.number.int({ min: 0, max: 10 }),
          certifications: []
        })),
        jobPreferences: {
          desiredJobTitles: getRandomItems(JOB_TITLES.technology, faker.number.int({ min: 2, max: 5 })),
          preferredLocations: getRandomItems(CITIES.qatar.map(c => c.name), faker.number.int({ min: 1, max: 3 })),
          remoteWorkPreference: getRandomItem(['Remote Only', 'Hybrid', 'On-site', 'No Preference']),
          salaryExpectation: generateSalaryRange(experienceLevel),
          jobSearchStatus: getRandomItem(Object.values(JobSearchStatus)),
          willingToRelocate: faker.datatype.boolean(0.4)
        },
        linkedInUrl: `https://linkedin.com/in/${jobSeekerUser.firstName.toLowerCase()}-${jobSeekerUser.lastName.toLowerCase()}`,
        githubUrl: faker.datatype.boolean(0.6) ? `https://github.com/${jobSeekerUser.firstName.toLowerCase()}${jobSeekerUser.lastName.toLowerCase()}` : undefined,
        careerGoals: faker.lorem.paragraph(),
        isPublic: faker.datatype.boolean(0.8),
        allowRecruiterContact: faker.datatype.boolean(0.9)
      });

      await jobSeekerProfile.save();
      this.createdJobSeekerProfiles.push(jobSeekerProfile);
    }

    console.log(`✅ Created ${DATA_COUNTS.JOB_SEEKERS} job seekers`);
  }

  async createJobs() {
    console.log('💼 Creating jobs...');

    for (let i = 0; i < DATA_COUNTS.JOBS; i++) {
      const employer = getRandomItem(this.createdEmployerProfiles);
      const company = this.createdCompanies.find(c => c._id.equals(employer.companyId));
      const experienceLevel = getRandomItem(Object.values(ExperienceLevel));
      const jobCategory = getRandomItem(Object.values(JobCategory));
      const city = getRandomItem(CITIES.qatar);

      const job = new Job({
        title: getRandomItem(JOB_TITLES.technology),
        description: faker.lorem.paragraphs(4, '\n\n'),
        shortDescription: faker.lorem.paragraph(),
        jobCategory,
        jobType: getRandomItem(Object.values(JobType)),
        workArrangement: getRandomItem(Object.values(WorkArrangement)),
        experienceLevel,
        companyId: company._id,
        employerId: employer._id,
        hiringManagerId: employer.userId,
        locations: [{
          city: city.name,
          country: 'Qatar',
          coordinates: {
            type: 'Point',
            coordinates: generateCoordinates(city.name)
          },
          isRemoteAllowed: faker.datatype.boolean(0.4)
        }],
        salaryRange: {
          ...generateSalaryRange(experienceLevel),
          period: 'Monthly',
          isNegotiable: faker.datatype.boolean(0.7)
        },
        requirements: [
          {
            category: 'Education',
            requirement: `${getRandomItem(Object.values(EducationLevel))} in relevant field`,
            isRequired: true,
            priority: 'Must Have'
          },
          {
            category: 'Experience',
            requirement: `${faker.number.int({ min: 1, max: 8 })}+ years of relevant experience`,
            isRequired: true,
            priority: 'Must Have'
          }
        ],
        requiredSkills: getRandomItems(SKILLS.technical, faker.number.int({ min: 3, max: 8 })),
        preferredSkills: getRandomItems(SKILLS.soft, faker.number.int({ min: 2, max: 5 })),
        benefits: getRandomItems(BENEFITS, faker.number.int({ min: 5, max: 10 })),
        screeningQuestions: [
          {
            question: 'Why are you interested in this position?',
            type: 'Text',
            options: [],
            isRequired: true,
            order: 1
          },
          {
            question: 'Do you have experience with the required technologies?',
            type: 'Yes/No',
            options: ['Yes', 'No'],
            isRequired: true,
            order: 2
          }
        ],
        applicationDeadline: faker.date.future({ years: 0.25 }),
        expectedStartDate: faker.date.future({ years: 0.5 }),
        status: faker.helpers.weightedArrayElement([
          { weight: 70, value: JobStatus.Active },
          { weight: 15, value: JobStatus.Paused },
          { weight: 10, value: JobStatus.Closed },
          { weight: 5, value: JobStatus.Draft }
        ]),
        isUrgent: faker.datatype.boolean(0.2),
        isFeatured: faker.datatype.boolean(0.1),
        analytics: {
          views: faker.number.int({ min: 10, max: 1000 }),
          applications: 0, // Will be updated when creating applications
          saves: faker.number.int({ min: 0, max: 50 }),
          shares: faker.number.int({ min: 0, max: 20 }),
          clickThroughRate: 0,
          applicationRate: 0,
          averageTimeOnPage: faker.number.int({ min: 30, max: 300 }),
          topReferralSources: ['Company Website', 'LinkedIn', 'Job Boards'],
          lastUpdated: new Date()
        },
        tags: getRandomItems([
          'Remote', 'Flexible Hours', 'Growth Opportunity', 'Startup Environment',
          'Enterprise', 'Innovation', 'Team Lead', 'Senior Role'
        ], faker.number.int({ min: 2, max: 5 })),
        keywords: getRandomItems(SKILLS.technical, faker.number.int({ min: 5, max: 10 })),
        postedDate: faker.date.recent({ days: 30 })
      });

      await job.save();
      this.createdJobs.push(job);
    }

    console.log(`✅ Created ${DATA_COUNTS.JOBS} jobs`);
  }

  async createApplications() {
    console.log('📝 Creating applications...');

    const activeJobs = this.createdJobs.filter(job => job.status === JobStatus.Active);

    for (let i = 0; i < DATA_COUNTS.APPLICATIONS; i++) {
      const job = getRandomItem(activeJobs);
      const jobSeeker = getRandomItem(this.createdJobSeekerProfiles);
      const employer = this.createdEmployerProfiles.find(e => e._id.equals(job.employerId));

      // Check if application already exists (prevent duplicates)
      const existingApplication = await Application.findOne({
        jobId: job._id,
        jobSeekerId: jobSeeker._id
      });

      if (existingApplication) {
        continue; // Skip if application already exists
      }

      const status = faker.helpers.weightedArrayElement([
        { weight: 40, value: ApplicationStatus.Applied },
        { weight: 25, value: ApplicationStatus.UnderReview },
        { weight: 15, value: ApplicationStatus.Shortlisted },
        { weight: 10, value: ApplicationStatus.Interviewing },
        { weight: 5, value: ApplicationStatus.Rejected },
        { weight: 3, value: ApplicationStatus.Offered },
        { weight: 2, value: ApplicationStatus.Hired }
      ]);

      const application = new Application({
        jobId: job._id,
        jobSeekerId: jobSeeker._id,
        employerId: employer._id,
        companyId: job.companyId,
        status,
        appliedDate: faker.date.recent({ days: 30 }),
        coverLetter: faker.lorem.paragraphs(2, '\n\n'),
        submittedResume: {
          fileName: `${jobSeeker.userId}_Resume.pdf`,
          url: faker.internet.url(),
          uploadDate: faker.date.recent({ days: 30 })
        },
        screeningAnswers: job.screeningQuestions.map((question: any, index: number) => ({
          questionId: `q${index + 1}`,
          question: question.question,
          answer: question.type === 'Yes/No'
            ? getRandomItem(['Yes', 'No'])
            : faker.lorem.paragraph(),
          score: faker.number.int({ min: 6, max: 10 })
        })),
        source: getRandomItem([
          'Company Website', 'LinkedIn', 'Indeed', 'Glassdoor', 'Referral', 'Job Fair'
        ]),
        employerRating: status === ApplicationStatus.Hired
          ? faker.number.int({ min: 3, max: 5 })
          : undefined,
        candidateRating: [ApplicationStatus.Rejected, ApplicationStatus.Hired].includes(status)
          ? faker.number.int({ min: 2, max: 5 })
          : undefined,
        lastViewedByEmployer: faker.date.recent({ days: 7 }),
        lastViewedByCandidate: faker.date.recent({ days: 3 })
      });

      // Add rejection details if rejected
      if (status === ApplicationStatus.Rejected) {
        application.rejectionReason = getRandomItem(Object.values(RejectionReason));
        application.rejectionNotes = faker.lorem.sentence();
        application.rejectedAt = faker.date.recent({ days: 15 });
        application.rejectedBy = employer.userId;
      }

      // Add interview data for advanced statuses
      if ([ApplicationStatus.Interviewing, ApplicationStatus.Offered, ApplicationStatus.Hired].includes(status)) {
        application.interviews = [{
          type: getRandomItem(Object.values(InterviewType)),
          scheduledDate: faker.date.recent({ days: 10 }),
          duration: 60,
          interviewers: [{
            userId: employer.userId,
            name: `${employer.userId}`, // This would be populated in real scenario
            title: employer.jobTitle,
            email: employer.workEmail
          }],
          location: 'Video Call',
          notes: faker.lorem.paragraph(),
          feedback: {
            technicalSkills: faker.number.int({ min: 3, max: 5 }),
            communicationSkills: faker.number.int({ min: 3, max: 5 }),
            culturalFit: faker.number.int({ min: 3, max: 5 }),
            overallRating: faker.number.int({ min: 3, max: 5 }),
            comments: faker.lorem.paragraph(),
            recommendation: getRandomItem(['Strongly Recommend', 'Recommend', 'Neutral'])
          },
          status: 'Completed',
          completedAt: faker.date.recent({ days: 5 })
        }];
      }

      await application.save();

      // Update job analytics
      job.analytics.applications += 1;
      await job.save();
    }

    console.log(`✅ Created applications for jobs`);
  }
}

// Main execution
const seeder = new DatabaseSeeder();

if (require.main === module) {
  seeder.seed().catch(console.error);
}
