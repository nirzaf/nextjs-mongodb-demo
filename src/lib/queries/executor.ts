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
            .limit(parameters.limit || 5);
          } catch (geoError) {
            // Fallback to regular search if geospatial index doesn't exist
            result = await Job.find({
              status: 'Active'
            })
            .populate('companyId', 'companyName')
            .limit(parameters.limit || 5);
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
