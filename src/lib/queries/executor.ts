import { 
  User, 
  UserRole, 
  Company, 
  Industry,
  JobSeekerProfile, 
  JobSeekerExperienceLevel, 
  EmployerProfile, 
  Job, 
  JobStatus, 
  WorkArrangement, 
  Application, 
  ApplicationStatus 
} from '../models';

export interface QueryParameters {
  [key: string]: any;
}

export interface QueryResult {
  data: any;
  executionTime: number;
  count: number;
}

export class QueryExecutor {
  static async executeQuery(queryId: string, parameters: QueryParameters = {}): Promise<QueryResult> {
    const startTime = Date.now();
    let result;
    
    try {
      switch (queryId) {
        case 'basic-find-companies':
          result = await Company.find({ 
            industry: parameters.industry || Industry.Technology,
            isActive: true 
          })
          .select('companyName industry employeeCount averageRating')
          .limit(parameters.limit || 5);
          break;

        case 'advanced-job-search':
          result = await Job.find({
            status: 'Active',
            'locations.city': parameters.city || 'Doha',
            $or: [
              { workArrangement: 'Remote' },
              { 'locations.isRemoteAllowed': true }
            ],
            'salaryRange.min': { $gte: parameters.minSalary || 15000 },
            'salaryRange.currency': parameters.currency || 'QAR'
          })
          .populate('companyId', 'companyName logoUrl')
          .sort({ postedDate: -1, 'salaryRange.max': -1 })
          .limit(parameters.limit || 5);
          break;

        case 'salary-analysis':
          result = await Job.aggregate([
            {
              $match: {
                status: 'Active',
                'salaryRange.currency': parameters.currency || 'QAR'
              }
            },
            {
              $lookup: {
                from: 'companies',
                localField: 'companyId',
                foreignField: '_id',
                as: 'company'
              }
            },
            {
              $unwind: '$company'
            },
            {
              $group: {
                _id: {
                  experienceLevel: '$experienceLevel',
                  industry: '$company.industry'
                },
                avgMinSalary: { $avg: '$salaryRange.min' },
                avgMaxSalary: { $avg: '$salaryRange.max' },
                jobCount: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.industry': 1, '_id.experienceLevel': 1 }
            },
            {
              $limit: parameters.limit || 20
            }
          ]);
          break;

        case 'text-search-jobs':
          try {
            // Try text search first
            result = await Job.find({
              $text: { $search: parameters.keywords || "software developer" },
              status: 'Active'
            })
            .select('title description companyId shortDescription requiredSkills')
            .populate('companyId', 'companyName')
            .sort({ score: { $meta: 'textScore' } })
            .limit(parameters.limit || 5)
            .lean(); // Use lean() to avoid virtual field issues
          } catch (textSearchError) {
            // Fallback to regex search if text index doesn't exist
            const keywords = parameters.keywords || "software developer";
            const keywordRegex = new RegExp(keywords.split(' ').join('|'), 'i');

            result = await Job.find({
              $or: [
                { title: keywordRegex },
                { description: keywordRegex },
                { shortDescription: keywordRegex },
                { requiredSkills: { $in: [keywordRegex] } }
              ],
              status: 'Active'
            })
            .select('title description companyId shortDescription requiredSkills')
            .populate('companyId', 'companyName')
            .limit(parameters.limit || 5)
            .lean(); // Use lean() to avoid virtual field issues
          }
          break;

        case 'nearby-jobs':
          const coordinates = parameters.coordinates || [51.5310, 25.2854]; // Doha
          const maxDistance = parameters.maxDistance || 10000; // 10km

          try {
            // Try geospatial search first
            result = await Job.find({
              'locations.coordinates': {
                $near: {
                  $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                  },
                  $maxDistance: maxDistance
                }
              },
              status: 'Active'
            })
            .populate('companyId', 'companyName')
            .limit(parameters.limit || 5)
            .lean(); // Use lean() to avoid virtual field issues
          } catch (geoError) {
            // Fallback to regular search if geospatial index doesn't exist
            result = await Job.find({
              status: 'Active'
            })
            .populate('companyId', 'companyName')
            .limit(parameters.limit || 5)
            .lean(); // Use lean() to avoid virtual field issues
          }
          break;

        case 'user-profiles':
          result = await User.find({
            role: parameters.role || UserRole.JobSeeker,
            accountStatus: 'Active'
          })
          .select('firstName lastName email role profileCompleteness lastLoginAt')
          .sort({ lastLoginAt: -1 })
          .limit(parameters.limit || 10);
          break;

        case 'company-analytics':
          result = await Company.aggregate([
            {
              $match: {
                isActive: true
              }
            },
            {
              $group: {
                _id: '$industry',
                companyCount: { $sum: 1 },
                avgEmployeeCount: { $avg: '$employeeCount' },
                avgRating: { $avg: '$averageRating' }
              }
            },
            {
              $sort: { companyCount: -1 }
            },
            {
              $limit: parameters.limit || 10
            }
          ]);
          break;

        case 'application-trends':
          result = await Application.aggregate([
            {
              $group: {
                _id: {
                  status: '$status',
                  month: { $month: '$appliedAt' },
                  year: { $year: '$appliedAt' }
                },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
              $limit: parameters.limit || 20
            }
          ]);
          break;

        case 'job-seeker-skills':
          result = await JobSeekerProfile.aggregate([
            {
              $unwind: '$skills'
            },
            {
              $group: {
                _id: '$skills.name',
                count: { $sum: 1 },
                avgProficiency: { $avg: '$skills.proficiencyLevel' }
              }
            },
            {
              $sort: { count: -1 }
            },
            {
              $limit: parameters.limit || 15
            }
          ]);
          break;

        case 'employer-hiring-stats':
          result = await EmployerProfile.aggregate([
            {
              $lookup: {
                from: 'jobs',
                localField: 'userId',
                foreignField: 'postedBy',
                as: 'postedJobs'
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                department: 1,
                hiringAuthority: 1,
                totalJobsPosted: { $size: '$postedJobs' },
                activeJobs: {
                  $size: {
                    $filter: {
                      input: '$postedJobs',
                      cond: { $eq: ['$$this.status', 'Active'] }
                    }
                  }
                }
              }
            },
            {
              $sort: { totalJobsPosted: -1 }
            },
            {
              $limit: parameters.limit || 10
            }
          ]);
          break;

        case 'data-modeling':
          // Return schema examples and patterns for data modeling learning
          result = {
            embeddedPattern: {
              _id: "embedded_example",
              title: "Embedded Application Schema",
              description: "Application with embedded user and job data",
              example: {
                _id: "app123",
                status: "Applied",
                appliedDate: new Date(),
                user: {
                  name: "John Doe",
                  email: "john@example.com",
                  skills: ["JavaScript", "React", "Node.js"]
                },
                job: {
                  title: "Frontend Developer",
                  company: "Tech Corp",
                  salaryRange: { min: 50000, max: 70000, currency: "USD" }
                }
              },
              benefits: ["Single query access", "Atomic updates", "Better performance"],
              drawbacks: ["Data duplication", "Document size limits", "Update complexity"]
            },
            referencedPattern: {
              _id: "referenced_example",
              title: "Referenced Application Schema",
              description: "Application with references to user and job collections",
              example: {
                _id: "app456",
                userId: "user123",
                jobId: "job789",
                companyId: "company456",
                status: "Applied",
                appliedDate: new Date()
              },
              benefits: ["No data duplication", "Easier updates", "Smaller documents"],
              drawbacks: ["Multiple queries needed", "Complex joins", "Potential inconsistency"]
            },
            hybridPattern: {
              _id: "hybrid_example",
              title: "Hybrid Application Schema",
              description: "Application with critical embedded data and references",
              example: {
                _id: "app789",
                userId: "user123",
                jobId: "job789",
                status: "Applied",
                appliedDate: new Date(),
                snapshot: {
                  userSkills: ["JavaScript", "React"],
                  jobTitle: "Frontend Developer",
                  salaryOffered: 60000
                }
              },
              benefits: ["Best of both worlds", "Performance + consistency", "Historical data preservation"]
            }
          };
          break;

        case 'performance-optimization':
          // Return performance optimization examples and techniques
          result = {
            indexingStrategies: {
              title: "Database Indexing Strategies",
              examples: [
                {
                  type: "Single Field Index",
                  query: "db.jobs.createIndex({ status: 1 })",
                  useCase: "Fast filtering by job status",
                  performance: "O(log n) lookup time"
                },
                {
                  type: "Compound Index",
                  query: "db.jobs.createIndex({ status: 1, postedDate: -1 })",
                  useCase: "Filter by status and sort by date",
                  performance: "Optimal for combined queries"
                },
                {
                  type: "Text Index",
                  query: "db.jobs.createIndex({ title: 'text', description: 'text' })",
                  useCase: "Full-text search capabilities",
                  performance: "Efficient text search"
                },
                {
                  type: "Geospatial Index",
                  query: "db.jobs.createIndex({ 'locations.coordinates': '2dsphere' })",
                  useCase: "Location-based queries",
                  performance: "Fast proximity searches"
                }
              ]
            },
            queryOptimization: {
              title: "Query Optimization Techniques",
              techniques: [
                {
                  name: "Use Projection",
                  example: "db.jobs.find({}, { title: 1, company: 1 })",
                  benefit: "Reduces network transfer and memory usage"
                },
                {
                  name: "Limit Results",
                  example: "db.jobs.find().limit(10)",
                  benefit: "Prevents loading unnecessary documents"
                },
                {
                  name: "Use Lean Queries",
                  example: "Job.find().lean()",
                  benefit: "Returns plain objects, faster processing"
                },
                {
                  name: "Efficient Sorting",
                  example: "db.jobs.find().sort({ postedDate: -1 }).limit(10)",
                  benefit: "Index-supported sorting with limits"
                }
              ]
            },
            aggregationOptimization: {
              title: "Aggregation Pipeline Optimization",
              tips: [
                {
                  rule: "Match Early",
                  example: "{ $match: { status: 'Active' } }",
                  reason: "Filter documents before expensive operations"
                },
                {
                  rule: "Project Late",
                  example: "{ $project: { title: 1, salary: 1 } }",
                  reason: "Reduce document size in final stages"
                },
                {
                  rule: "Use Indexes",
                  example: "{ $match: { indexedField: value } }",
                  reason: "Leverage existing indexes for performance"
                }
              ]
            }
          };
          break;

        default:
          throw new Error(`Unknown query ID: ${queryId}`);
      }

      const executionTime = Date.now() - startTime;
      const count = Array.isArray(result) ? result.length : (result ? 1 : 0);

      return {
        data: result,
        executionTime,
        count
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      throw new Error(`Query execution failed after ${executionTime}ms: ${error}`);
    }
  }
}
