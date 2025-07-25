export const QUERY_DEFINITIONS = {
  basicFind: {
    id: 'basic-find',
    title: '🔍 Basic Find Operations',
    description: 'Master the fundamentals of MongoDB queries with real-world job search scenarios',
    difficulty: 'Beginner',
    category: 'CRUD Operations',
    estimatedTime: '15 minutes',
    learningObjectives: [
      'Master basic find() syntax and patterns',
      'Learn efficient field selection with select()',
      'Practice filtering with multiple conditions',
      'Implement pagination with limit() and skip()',
      'Understand query performance basics'
    ],
    businessScenario: 'A job seeker wants to find technology companies in Qatar with good ratings for potential applications',
    mongodbConcepts: ['find()', 'select()', 'limit()', 'skip()', 'Basic Filtering', 'AND Logic'],
    prerequisites: ['Basic JavaScript knowledge', 'Understanding of JSON structure'],
    queries: [
      {
        name: 'Find Top Technology Companies',
        description: 'Find highly-rated active technology companies with detailed information',
        code: `Company.find({
  industry: 'Technology',
  isActive: true,
  averageRating: { $gte: 4.0 }
})
.select('companyName industry employeeCount averageRating location description')
.sort({ averageRating: -1, employeeCount: -1 })
.limit(10)`,
        explanation: `🎯 **Real-world Application**: Job seekers want to target the best tech companies

**Query Breakdown**:
• **find()**: Searches documents matching ALL conditions (AND logic)
• **Multiple filters**: industry, isActive, and rating threshold
• **$gte operator**: "greater than or equal" - finds companies with 4+ stars
• **select()**: Returns only relevant fields (saves bandwidth & improves performance)
• **sort()**: Orders by rating first, then company size (both descending)
• **limit()**: Prevents overwhelming results, improves user experience

**Performance Tip**: Create indexes on frequently queried fields like 'industry' and 'averageRating'`,
        expectedResults: 'Returns top 10 technology companies with ratings ≥ 4.0, sorted by rating and size',
        practiceChallenge: 'Modify the query to find Healthcare companies with 100+ employees'
      },
      {
        name: 'Pagination Example',
        description: 'Implement pagination for browsing through company listings',
        code: `// Page 1 (first 5 companies)
Company.find({ isActive: true })
.select('companyName industry averageRating')
.sort({ companyName: 1 })
.limit(5)

// Page 2 (next 5 companies)
Company.find({ isActive: true })
.select('companyName industry averageRating')
.sort({ companyName: 1 })
.skip(5)
.limit(5)`,
        explanation: `📄 **Pagination Pattern**: Essential for user-friendly interfaces

**Key Concepts**:
• **skip()**: Skips the first N documents (for page 2, skip page 1 results)
• **Consistent sorting**: Always use same sort() for predictable pagination
• **Page calculation**: skip = (pageNumber - 1) × pageSize

**Best Practice**: For large datasets, use cursor-based pagination instead of skip()`,
        expectedResults: 'First query returns companies 1-5, second returns companies 6-10',
        practiceChallenge: 'Create a query for page 3 showing companies 11-15'
      }
    ]
  },

  advancedFiltering: {
    id: 'advanced-filtering',
    title: '🎯 Advanced Filtering & Sorting',
    description: 'Master complex queries with logical operators, comparisons, and sophisticated filtering patterns',
    difficulty: 'Intermediate',
    category: 'Querying',
    estimatedTime: '25 minutes',
    learningObjectives: [
      'Master logical operators ($or, $and, $nor, $not)',
      'Apply all comparison operators ($gte, $lte, $in, $nin, $ne)',
      'Implement complex multi-field sorting strategies',
      'Query nested objects and arrays effectively',
      'Combine multiple advanced filter conditions',
      'Understand query optimization techniques'
    ],
    businessScenario: 'A job seeker wants flexible search options: remote work OR Doha location, competitive salary, and specific experience levels',
    mongodbConcepts: ['$or operator', '$and operator', 'Comparison operators', 'Nested queries', 'sort()', 'populate()', 'Complex filtering'],
    prerequisites: ['Basic find operations', 'Understanding of JavaScript objects', 'Basic MongoDB operators'],
    queries: [
      {
        name: 'Flexible Job Search with Multiple Criteria',
        description: 'Find jobs matching complex location, salary, and experience requirements',
        code: `Job.find({
  status: 'Active',
  $or: [
    { workArrangement: 'Remote' },
    { 'locations.city': 'Doha' },
    { 'locations.isRemoteAllowed': true }
  ],
  'salaryRange.min': { $gte: 15000 },
  'salaryRange.max': { $lte: 50000 },
  'salaryRange.currency': 'QAR',
  experienceLevel: { $in: ['Mid-level', 'Senior'] },
  requiredSkills: { $size: { $lte: 8 } } // Not too many requirements
})
.populate('companyId', 'companyName logoUrl industry averageRating')
.sort({
  'salaryRange.max': -1,    // Highest salary first
  postedDate: -1,           // Most recent first
  'companyId.averageRating': -1  // Best companies first
})
.limit(10)`,
        explanation: `🚀 **Advanced Query Techniques**:

**Logical Operators**:
• **$or**: Matches ANY of the location conditions (flexible location requirements)
• **$in**: Matches values within an array (Mid-level OR Senior experience)

**Comparison Operators**:
• **$gte**: Minimum salary threshold (≥ 15,000 QAR)
• **$lte**: Maximum salary cap (≤ 50,000 QAR) - realistic range
• **$size**: Array size constraints (≤ 8 required skills)

**Nested Field Queries**:
• **'locations.city'**: Queries nested object properties
• **'salaryRange.min'**: Accesses nested salary information

**Advanced Sorting**:
• **Multi-field sort**: Primary by salary, secondary by date, tertiary by rating
• **populate() with select**: Joins company data efficiently

**Performance Optimization**:
• Create compound indexes on frequently queried field combinations
• Use projection to limit returned data`,
        expectedResults: 'Returns up to 10 jobs matching flexible location criteria, salary range 15K-50K QAR, for mid/senior levels',
        practiceChallenge: 'Modify to find entry-level positions in Finance industry with salary < 12000 QAR'
      },
      {
        name: 'Complex Array and Date Filtering',
        description: 'Advanced filtering on arrays, dates, and multiple conditions with $and',
        code: `Job.find({
  $and: [
    { status: 'Active' },
    {
      $or: [
        { 'benefits': { $in: ['Health Insurance', 'Flexible Hours'] } },
        { 'perks': { $exists: true, $ne: [] } }
      ]
    },
    {
      postedDate: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    {
      applicationDeadline: {
        $gt: new Date() // Still accepting applications
      }
    }
  ],
  requiredSkills: {
    $all: ['JavaScript'], // Must have JavaScript
    $size: { $gte: 3, $lte: 6 } // 3-6 total skills
  }
})
.populate('companyId', 'companyName industry')
.sort({ applicationDeadline: 1, postedDate: -1 }) // Urgent deadlines first
.limit(15)`,
        explanation: `🔥 **Advanced Array & Date Operations**:

**Complex Logic with $and**:
• Explicitly groups conditions for complex logic
• Ensures ALL conditions must be met

**Array Operations**:
• **$in**: Matches any value in array (benefits include health/flexible hours)
• **$all**: Requires ALL specified values (must have JavaScript skill)
• **$exists**: Checks if field exists and is not empty
• **$ne**: "not equal" - excludes empty arrays

**Date Filtering**:
• **Dynamic dates**: Uses JavaScript Date() for relative time
• **30-day window**: Jobs posted in last month
• **Future dates**: Deadline still in future

**Real-world Application**:
• Job seekers want recent postings with good benefits
• Must have JavaScript skill but not overwhelmed with requirements
• Prioritizes urgent application deadlines

**Pro Tips**:
• Index date fields for better performance
• Use $expr for more complex date calculations`,
        expectedResults: 'Recent jobs (last 30 days) with benefits, requiring JavaScript, sorted by application urgency',
        practiceChallenge: 'Find jobs posted in last 7 days requiring Python OR Java skills'
      }
    ]
  },

  aggregation: {
    id: 'aggregation',
    title: '📊 Aggregation Pipelines Mastery',
    description: 'Build powerful data analytics pipelines for business intelligence and market insights',
    difficulty: 'Advanced',
    category: 'Analytics',
    estimatedTime: '35 minutes',
    learningObjectives: [
      'Master the aggregation pipeline concept and stages',
      'Build complex multi-stage data transformations',
      'Perform advanced joins with $lookup and $unwind',
      'Calculate statistics with $group, $avg, $sum, $max, $min',
      'Create conditional logic with $cond and $switch',
      'Implement data reshaping with $project and $addFields',
      'Optimize aggregation performance'
    ],
    businessScenario: 'HR analytics team needs comprehensive salary benchmarking, hiring trends, and market intelligence across industries and experience levels',
    mongodbConcepts: ['Aggregation Pipeline', '$match', '$group', '$lookup', '$unwind', '$project', '$sort', '$limit', '$avg', '$sum', '$cond'],
    prerequisites: ['Advanced filtering knowledge', 'Understanding of data relationships', 'Basic statistics concepts'],
    queries: [
      {
        name: 'Comprehensive Salary Market Analysis',
        description: 'Generate detailed salary insights across industries, experience levels, and company sizes',
        code: `Job.aggregate([
  // Stage 1: Filter active jobs with salary data
  {
    $match: {
      status: 'Active',
      'salaryRange.currency': 'QAR',
      'salaryRange.min': { $exists: true, $gt: 0 }
    }
  },

  // Stage 2: Join with company data
  {
    $lookup: {
      from: 'companies',
      localField: 'companyId',
      foreignField: '_id',
      as: 'company'
    }
  },

  // Stage 3: Flatten company array
  {
    $unwind: '$company'
  },

  // Stage 4: Add calculated fields
  {
    $addFields: {
      avgSalary: { $avg: ['$salaryRange.min', '$salaryRange.max'] },
      salaryRange: { $subtract: ['$salaryRange.max', '$salaryRange.min'] },
      companySize: {
        $switch: {
          branches: [
            { case: { $lt: ['$company.employeeCount', 50] }, then: 'Startup' },
            { case: { $lt: ['$company.employeeCount', 200] }, then: 'Small' },
            { case: { $lt: ['$company.employeeCount', 1000] }, then: 'Medium' },
            { case: { $gte: ['$company.employeeCount', 1000] }, then: 'Large' }
          ],
          default: 'Unknown'
        }
      }
    }
  },

  // Stage 5: Group by multiple dimensions
  {
    $group: {
      _id: {
        industry: '$company.industry',
        experienceLevel: '$experienceLevel',
        companySize: '$companySize'
      },
      // Salary statistics
      avgSalary: { $avg: '$avgSalary' },
      minSalary: { $min: '$salaryRange.min' },
      maxSalary: { $max: '$salaryRange.max' },
      medianSalary: { $avg: '$avgSalary' }, // Approximation

      // Job market metrics
      totalJobs: { $sum: 1 },
      avgCompanyRating: { $avg: '$company.averageRating' },

      // Skill demand analysis
      topSkills: { $push: '$requiredSkills' },

      // Benefits analysis
      benefitsOffered: { $sum: { $size: { $ifNull: ['$benefits', []] } } }
    }
  },

  // Stage 6: Calculate market competitiveness
  {
    $addFields: {
      marketCompetitiveness: {
        $cond: {
          if: { $and: [
            { $gte: ['$avgSalary', 20000] },
            { $gte: ['$avgCompanyRating', 4.0] },
            { $gte: ['$totalJobs', 5] }
          ]},
          then: 'High',
          else: {
            $cond: {
              if: { $gte: ['$avgSalary', 15000] },
              then: 'Medium',
              else: 'Low'
            }
          }
        }
      }
    }
  },

  // Stage 7: Sort by industry and experience
  {
    $sort: {
      '_id.industry': 1,
      '_id.experienceLevel': 1,
      avgSalary: -1
    }
  },

  // Stage 8: Limit results for performance
  {
    $limit: 50
  }
])`,
        explanation: `🎯 **Advanced Aggregation Techniques**:

**Pipeline Architecture**:
• **8 stages** working together for comprehensive analysis
• Each stage transforms data for the next stage

**Key Stages Explained**:

**$match**: Initial filtering for data quality
• Ensures salary data exists and is valid
• Filters only active jobs

**$lookup + $unwind**: Data joining pattern
• Joins jobs with company information
• Flattens array results for easier processing

**$addFields**: Dynamic field creation
• **avgSalary**: Calculates midpoint of salary range
• **companySize**: Categorizes companies by employee count
• **$switch**: Multi-condition logic (like switch statement)

**$group**: Multi-dimensional analysis
• Groups by industry, experience, and company size
• Calculates multiple statistics simultaneously
• **$push**: Collects arrays for further analysis

**Advanced Calculations**:
• **$avg, $min, $max**: Statistical functions
• **$sum**: Counting and totaling
• **$cond**: Conditional logic for market competitiveness

**Performance Optimization**:
• Early $match reduces data volume
• $limit prevents excessive results
• Indexes on grouping fields improve speed

**Business Value**:
• Salary benchmarking across multiple dimensions
• Market competitiveness scoring
• Skills demand analysis
• Company rating correlation`,
        expectedResults: 'Comprehensive salary analysis grouped by industry, experience level, and company size with market insights',
        practiceChallenge: 'Add a stage to calculate the most in-demand skills by counting skill frequency'
      },
      {
        name: 'Hiring Trends and Time-Series Analysis',
        description: 'Analyze hiring patterns, seasonal trends, and application success rates over time',
        code: `Application.aggregate([
  // Stage 1: Match recent applications
  {
    $match: {
      appliedDate: {
        $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
      }
    }
  },

  // Stage 2: Join with job and company data
  {
    $lookup: {
      from: 'jobs',
      localField: 'jobId',
      foreignField: '_id',
      as: 'job'
    }
  },
  {
    $unwind: '$job'
  },
  {
    $lookup: {
      from: 'companies',
      localField: 'job.companyId',
      foreignField: '_id',
      as: 'company'
    }
  },
  {
    $unwind: '$company'
  },

  // Stage 3: Add time-based grouping fields
  {
    $addFields: {
      month: { $month: '$appliedDate' },
      quarter: { $ceil: { $divide: [{ $month: '$appliedDate' }, 3] } },
      year: { $year: '$appliedDate' },
      dayOfWeek: { $dayOfWeek: '$appliedDate' },
      isSuccessful: { $in: ['$status', ['Hired', 'Offer Extended']] }
    }
  },

  // Stage 4: Group by time periods and industry
  {
    $group: {
      _id: {
        year: '$year',
        quarter: '$quarter',
        industry: '$company.industry'
      },

      // Application metrics
      totalApplications: { $sum: 1 },
      successfulApplications: { $sum: { $cond: ['$isSuccessful', 1, 0] } },

      // Time-to-hire analysis
      avgProcessingTime: {
        $avg: {
          $dateDiff: {
            startDate: '$appliedDate',
            endDate: '$lastUpdated',
            unit: 'day'
          }
        }
      },

      // Industry insights
      uniqueCompanies: { $addToSet: '$company._id' },
      avgCompanyRating: { $avg: '$company.averageRating' },

      // Application patterns
      weekdayApplications: {
        $sum: { $cond: [{ $lte: ['$dayOfWeek', 5] }, 1, 0] }
      },
      weekendApplications: {
        $sum: { $cond: [{ $gt: ['$dayOfWeek', 5] }, 1, 0] }
      }
    }
  },

  // Stage 5: Calculate success rates and trends
  {
    $addFields: {
      successRate: {
        $multiply: [
          { $divide: ['$successfulApplications', '$totalApplications'] },
          100
        ]
      },
      uniqueCompanyCount: { $size: '$uniqueCompanies' },
      weekdayVsWeekendRatio: {
        $divide: ['$weekdayApplications', { $add: ['$weekendApplications', 1] }]
      }
    }
  },

  // Stage 6: Sort by time and success rate
  {
    $sort: {
      '_id.year': -1,
      '_id.quarter': -1,
      successRate: -1
    }
  }
])`,
        explanation: `📈 **Time-Series & Trend Analysis**:

**Advanced Date Operations**:
• **$month, $quarter, $year**: Extract time components
• **$dayOfWeek**: Analyze weekly patterns
• **$dateDiff**: Calculate time differences

**Multi-Collection Joins**:
• **Double $lookup**: Jobs → Companies for complete context
• **$unwind**: Flattens nested arrays

**Conditional Aggregations**:
• **$cond**: Creates boolean logic for calculations
• **$in**: Checks if status indicates success
• **Success rate calculation**: Percentage of successful applications

**Business Intelligence Features**:
• **Seasonal trends**: Quarter-based grouping
• **Processing time**: How long hiring takes
• **Application patterns**: Weekday vs weekend behavior
• **Market competition**: Unique companies per industry

**Advanced Calculations**:
• **$addToSet**: Collects unique values (company IDs)
• **$size**: Counts array elements
• **$multiply + $divide**: Percentage calculations

**Real-World Applications**:
• Identify best times to apply for jobs
• Understand industry hiring cycles
• Benchmark application success rates
• Optimize application timing strategies`,
        expectedResults: 'Quarterly hiring trends by industry with success rates, processing times, and application patterns',
        practiceChallenge: 'Modify to analyze monthly trends and add salary correlation with success rates'
      }
    ]
  },

  textSearch: {
    id: 'text-search',
    title: 'Text Search Queries',
    description: 'Implement full-text search across multiple fields',
    difficulty: 'Intermediate',
    category: 'Search',
    learningObjectives: [
      'Use $text and $search operators',
      'Understand text indexes',
      'Sort by relevance score',
      'Search across multiple fields'
    ],
    businessScenario: 'Job seekers want to search jobs by keywords in titles and descriptions',
    mongodbConcepts: ['Text Indexes', '$text', '$search', 'Text Score'],
    queries: [
      {
        name: 'Job Keyword Search',
        description: 'Search for jobs containing "software developer" keywords',
        code: `Job.find({
  $text: { $search: "software developer" },
  status: 'Active'
})
.select('title description companyId score')
.populate('companyId', 'companyName')
.sort({ score: { $meta: 'textScore' } })
.limit(5)`,
        explanation: `This text search query shows:
• $text operator for full-text search
• $search with multiple keywords
• $meta: 'textScore' for relevance sorting
• Text search combined with other filters
• Requires text index on searchable fields`
      }
    ]
  },

  geospatial: {
    id: 'geospatial',
    title: 'Geospatial Queries',
    description: 'Perform location-based queries using MongoDB geospatial features',
    difficulty: 'Advanced',
    category: 'Location',
    learningObjectives: [
      'Use 2dsphere indexes',
      'Implement $near queries',
      'Calculate distances',
      'Work with GeoJSON format'
    ],
    businessScenario: 'Find jobs within commuting distance of a specific location',
    mongodbConcepts: ['2dsphere Index', '$near', 'GeoJSON', '$maxDistance'],
    queries: [
      {
        name: 'Nearby Jobs Search',
        description: 'Find jobs within 10km of Doha city center',
        code: `Job.find({
  'locations.coordinates': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [51.5310, 25.2854] // [longitude, latitude]
      },
      $maxDistance: 10000 // 10km in meters
    }
  },
  status: 'Active'
})
.populate('companyId', 'companyName')
.limit(5)`,
        explanation: `This geospatial query demonstrates:
• $near operator for proximity search
• GeoJSON Point geometry format
• $maxDistance in meters
• Coordinates in [longitude, latitude] format
• Requires 2dsphere index on coordinates field`
      }
    ]
  }
};
