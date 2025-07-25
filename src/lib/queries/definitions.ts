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
    title: '🔎 Advanced Text Search & Full-Text Queries',
    description: 'Master MongoDB\'s powerful text search capabilities for building intelligent search experiences',
    difficulty: 'Intermediate',
    category: 'Search',
    estimatedTime: '20 minutes',
    learningObjectives: [
      'Implement full-text search with $text and $search',
      'Create and optimize text indexes for performance',
      'Use relevance scoring and $meta textScore',
      'Build fuzzy search and phrase matching',
      'Combine text search with other filters',
      'Handle multilingual search scenarios',
      'Implement search suggestions and autocomplete'
    ],
    businessScenario: 'Build a smart job search engine that understands natural language queries and ranks results by relevance',
    mongodbConcepts: ['Text Indexes', '$text', '$search', 'Text Score', '$meta', 'Phrase Search', 'Language Support'],
    prerequisites: ['Basic find operations', 'Understanding of indexes', 'Text search concepts'],
    queries: [
      {
        name: 'Intelligent Job Search Engine',
        description: 'Advanced text search with relevance scoring, phrase matching, and filters',
        code: `// First, create the text index (run once):
// db.jobs.createIndex({
//   title: "text",
//   description: "text",
//   requiredSkills: "text",
//   "company.companyName": "text"
// }, {
//   weights: {
//     title: 10,           // Title matches are most important
//     requiredSkills: 5,   // Skills are very relevant
//     description: 2,      // Description has medium weight
//     "company.companyName": 3  // Company name is important
//   },
//   name: "job_search_index"
// })

Job.aggregate([
  // Stage 1: Text search with multiple techniques
  {
    $match: {
      $and: [
        {
          $text: {
            $search: '"software engineer" javascript react',
            $language: 'english',
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        },
        { status: 'Active' },
        { 'salaryRange.min': { $gte: 10000 } }
      ]
    }
  },

  // Stage 2: Add relevance score
  {
    $addFields: {
      searchScore: { $meta: 'textScore' },
      titleMatch: {
        $cond: {
          if: { $regexMatch: { input: '$title', regex: 'software engineer', options: 'i' } },
          then: 5,
          else: 0
        }
      }
    }
  },

  // Stage 3: Join with company data
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

  // Stage 4: Calculate final relevance score
  {
    $addFields: {
      finalScore: {
        $add: [
          '$searchScore',
          '$titleMatch',
          { $multiply: ['$company.averageRating', 0.5] }, // Boost good companies
          { $cond: [{ $eq: ['$workArrangement', 'Remote'] }, 1, 0] } // Boost remote jobs
        ]
      }
    }
  },

  // Stage 5: Project relevant fields
  {
    $project: {
      title: 1,
      description: { $substr: ['$description', 0, 200] }, // Truncate for preview
      requiredSkills: 1,
      workArrangement: 1,
      'salaryRange.min': 1,
      'salaryRange.max': 1,
      'salaryRange.currency': 1,
      'company.companyName': 1,
      'company.logoUrl': 1,
      'company.averageRating': 1,
      searchScore: 1,
      finalScore: 1,
      postedDate: 1
    }
  },

  // Stage 6: Sort by relevance and recency
  {
    $sort: {
      finalScore: -1,
      postedDate: -1
    }
  },

  {
    $limit: 20
  }
])`,
        explanation: `🚀 **Advanced Text Search Architecture**:

**Text Index Strategy**:
• **Weighted fields**: Title (10x), Skills (5x), Description (2x)
• **Multi-field indexing**: Searches across multiple fields simultaneously
• **Language support**: English language rules for stemming

**Search Techniques**:
• **Phrase search**: "software engineer" (exact phrase)
• **Keyword search**: javascript react (individual terms)
• **Case/diacritic insensitive**: Flexible matching

**Relevance Scoring System**:
• **$meta textScore**: MongoDB's built-in relevance
• **Title boost**: Extra points for title matches
• **Company rating**: Higher-rated companies get boost
• **Feature preferences**: Remote work gets bonus points

**Advanced Features**:
• **$regexMatch**: Additional pattern matching
• **$substr**: Text truncation for previews
• **Multi-stage scoring**: Combines multiple relevance factors

**Performance Optimizations**:
• **Early filtering**: Status and salary filters reduce dataset
• **Projection**: Returns only needed fields
• **Index utilization**: Text index enables fast search

**Real-World Applications**:
• Job search engines
• E-commerce product search
• Content management systems
• Knowledge bases`,
        expectedResults: 'Ranked job results matching "software engineer javascript react" with intelligent relevance scoring',
        practiceChallenge: 'Create a search for "data scientist python" with location-based boosting'
      },
      {
        name: 'Search Suggestions and Autocomplete',
        description: 'Build intelligent search suggestions based on user input and popular searches',
        code: `// Autocomplete for job titles and skills
Job.aggregate([
  // Stage 1: Match partial input
  {
    $match: {
      status: 'Active',
      $or: [
        { title: { $regex: '^soft', $options: 'i' } }, // Starts with "soft"
        { requiredSkills: { $regex: 'soft', $options: 'i' } }
      ]
    }
  },

  // Stage 2: Extract and process suggestions
  {
    $project: {
      titleSuggestions: {
        $regexFindAll: {
          input: '$title',
          regex: '\\\\b\\\\w*soft\\\\w*\\\\b',
          options: 'i'
        }
      },
      skillSuggestions: {
        $filter: {
          input: '$requiredSkills',
          cond: { $regexMatch: { input: '$$this', regex: 'soft', options: 'i' } }
        }
      }
    }
  },

  // Stage 3: Flatten and count suggestions
  {
    $project: {
      suggestions: {
        $concatArrays: [
          { $map: { input: '$titleSuggestions', as: 'match', in: '$$match.match' } },
          '$skillSuggestions'
        ]
      }
    }
  },

  // Stage 4: Unwind for counting
  {
    $unwind: '$suggestions'
  },

  // Stage 5: Group and count frequency
  {
    $group: {
      _id: { $toLower: '$suggestions' },
      count: { $sum: 1 },
      examples: { $addToSet: '$suggestions' }
    }
  },

  // Stage 6: Sort by popularity
  {
    $sort: { count: -1 }
  },

  {
    $limit: 10
  },

  // Stage 7: Format output
  {
    $project: {
      suggestion: { $arrayElemAt: ['$examples', 0] },
      frequency: '$count',
      _id: 0
    }
  }
])`,
        explanation: `🎯 **Autocomplete & Suggestions System**:

**Pattern Matching**:
• **$regex with ^**: Matches terms starting with input
• **Word boundaries**: \\\\b ensures complete word matching
• **Case insensitive**: 'i' option for flexible matching

**Data Extraction**:
• **$regexFindAll**: Extracts all matching patterns
• **$filter**: Selects array elements matching criteria
• **$concatArrays**: Combines multiple suggestion sources

**Frequency Analysis**:
• **$unwind**: Converts arrays to individual documents
• **$group**: Counts suggestion frequency
• **$addToSet**: Collects unique examples

**Smart Ranking**:
• **Popularity-based**: Most frequent suggestions first
• **Real-time data**: Based on current job postings
• **Multi-source**: Combines titles and skills

**Production Features**:
• **Caching**: Store popular suggestions in Redis
• **Debouncing**: Limit API calls on frontend
• **Fuzzy matching**: Handle typos and variations`,
        expectedResults: 'Top 10 autocomplete suggestions for "soft" with frequency counts',
        practiceChallenge: 'Build suggestions for company names with minimum frequency threshold'
      }
    ]
  },

  geospatial: {
    id: 'geospatial',
    title: '🌍 Geospatial Queries & Location Intelligence',
    description: 'Master location-based queries, spatial analysis, and geographic data processing',
    difficulty: 'Advanced',
    category: 'Location',
    estimatedTime: '30 minutes',
    learningObjectives: [
      'Master 2dsphere indexes and GeoJSON format',
      'Implement proximity searches with $near and $nearSphere',
      'Build geofencing with $geoWithin and $geoIntersects',
      'Calculate distances and areas with $geoNear aggregation',
      'Handle complex geographic shapes and polygons',
      'Optimize geospatial query performance',
      'Build location-aware applications'
    ],
    businessScenario: 'Create a location-intelligent job platform that matches candidates with nearby opportunities and analyzes geographic hiring patterns',
    mongodbConcepts: ['2dsphere Index', '$near', '$geoWithin', '$geoNear', 'GeoJSON', 'Polygon queries', 'Distance calculations'],
    prerequisites: ['Understanding of coordinates', 'Basic aggregation knowledge', 'GeoJSON format familiarity'],
    queries: [
      {
        name: 'Advanced Proximity Job Search',
        description: 'Find jobs within commuting distance with travel time estimation and route optimization',
        code: `// First create the geospatial index:
// db.jobs.createIndex({ "locations.coordinates": "2dsphere" })

Job.aggregate([
  // Stage 1: Geospatial proximity search
  {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [51.5310, 25.2854] // Doha city center [lng, lat]
      },
      distanceField: 'distanceFromUser',
      maxDistance: 25000, // 25km radius
      spherical: true,
      query: {
        status: 'Active',
        'locations.coordinates': { $exists: true }
      }
    }
  },

  // Stage 2: Add travel time estimation
  {
    $addFields: {
      estimatedTravelTime: {
        $switch: {
          branches: [
            { case: { $lte: ['$distanceFromUser', 5000] }, then: '15-20 min' },
            { case: { $lte: ['$distanceFromUser', 10000] }, then: '25-35 min' },
            { case: { $lte: ['$distanceFromUser', 15000] }, then: '35-45 min' },
            { case: { $lte: ['$distanceFromUser', 25000] }, then: '45-60 min' }
          ],
          default: '60+ min'
        }
      },
      distanceKm: { $round: [{ $divide: ['$distanceFromUser', 1000] }, 1] },
      isWalkable: { $lte: ['$distanceFromUser', 1500] }, // Within 1.5km
      isBikeable: { $lte: ['$distanceFromUser', 8000] }   // Within 8km
    }
  },

  // Stage 3: Join with company data
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

  // Stage 4: Calculate location score
  {
    $addFields: {
      locationScore: {
        $add: [
          // Closer is better (inverse distance scoring)
          { $multiply: [{ $divide: [25000, { $add: ['$distanceFromUser', 1000] }] }, 10] },

          // Bonus for walkable/bikeable
          { $cond: ['$isWalkable', 15, 0] },
          { $cond: ['$isBikeable', 8, 0] },

          // Bonus for good company rating
          { $multiply: ['$company.averageRating', 2] },

          // Bonus for remote work option
          { $cond: [{ $eq: ['$workArrangement', 'Hybrid'] }, 10, 0] },
          { $cond: [{ $eq: ['$workArrangement', 'Remote'] }, 20, 0] }
        ]
      }
    }
  },

  // Stage 5: Filter and sort by location intelligence
  {
    $match: {
      $or: [
        { distanceKm: { $lte: 20 } }, // Within 20km
        { workArrangement: { $in: ['Remote', 'Hybrid'] } } // Or flexible work
      ]
    }
  },

  {
    $sort: {
      locationScore: -1,
      'company.averageRating': -1,
      postedDate: -1
    }
  },

  // Stage 6: Project useful fields
  {
    $project: {
      title: 1,
      'company.companyName': 1,
      'company.averageRating': 1,
      workArrangement: 1,
      'salaryRange.min': 1,
      'salaryRange.max': 1,
      'locations.address': 1,
      distanceKm: 1,
      estimatedTravelTime: 1,
      isWalkable: 1,
      isBikeable: 1,
      locationScore: 1,
      postedDate: 1
    }
  },

  {
    $limit: 15
  }
])`,
        explanation: `🗺️ **Advanced Geospatial Intelligence**:

**$geoNear Aggregation**:
• **Proximity search**: Finds documents near a point
• **Distance calculation**: Automatically calculates distances
• **Spherical geometry**: Accounts for Earth's curvature
• **Query integration**: Combines location with other filters

**Travel Intelligence**:
• **Distance-based time estimation**: Realistic commute times
• **Multi-modal transport**: Walking, biking, driving options
• **Urban planning awareness**: Different speeds for different distances

**Location Scoring Algorithm**:
• **Inverse distance**: Closer locations score higher
• **Walkability bonus**: Extra points for pedestrian-friendly distances
• **Work flexibility**: Remote/hybrid options get significant boosts
• **Company quality**: Integrates business ratings

**Real-World Applications**:
• **Commute optimization**: Helps users find convenient jobs
• **Urban mobility**: Considers different transportation modes
• **Work-life balance**: Factors in travel time impact
• **Smart recommendations**: Combines location with job quality

**Performance Considerations**:
• **2dsphere index**: Essential for geospatial performance
• **Early filtering**: Reduces dataset before complex calculations
• **Reasonable limits**: Prevents excessive computation`,
        expectedResults: 'Jobs within 25km of Doha center, ranked by location convenience and job quality',
        practiceChallenge: 'Add public transport accessibility scoring based on nearby metro stations'
      },
      {
        name: 'Geographic Market Analysis',
        description: 'Analyze hiring patterns, salary distributions, and job density across different areas',
        code: `Job.aggregate([
  // Stage 1: Filter active jobs with location data
  {
    $match: {
      status: 'Active',
      'locations.coordinates': { $exists: true },
      'salaryRange.min': { $exists: true }
    }
  },

  // Stage 2: Define geographic regions (Qatar districts)
  {
    $addFields: {
      region: {
        $switch: {
          branches: [
            // Doha Central Business District
            {
              case: {
                $geoWithin: {
                  $geometry: {
                    type: 'Polygon',
                    coordinates: [[
                      [51.520, 25.280], [51.540, 25.280],
                      [51.540, 25.300], [51.520, 25.300],
                      [51.520, 25.280]
                    ]]
                  }
                }
              },
              then: 'Doha CBD'
            },
            // West Bay Financial District
            {
              case: {
                $geoWithin: {
                  $geometry: {
                    type: 'Polygon',
                    coordinates: [[
                      [51.510, 25.320], [51.530, 25.320],
                      [51.530, 25.340], [51.510, 25.340],
                      [51.510, 25.320]
                    ]]
                  }
                }
              },
              then: 'West Bay'
            },
            // Al Sadd Area
            {
              case: {
                $geoWithin: {
                  $geometry: {
                    type: 'Polygon',
                    coordinates: [[
                      [51.440, 25.270], [51.470, 25.270],
                      [51.470, 25.290], [51.440, 25.290],
                      [51.440, 25.270]
                    ]]
                  }
                }
              },
              then: 'Al Sadd'
            }
          ],
          default: 'Other Areas'
        }
      }
    }
  },

  // Stage 3: Join with company data
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

  // Stage 4: Group by region and analyze
  {
    $group: {
      _id: {
        region: '$region',
        industry: '$company.industry',
        experienceLevel: '$experienceLevel'
      },

      // Job market metrics
      totalJobs: { $sum: 1 },
      uniqueCompanies: { $addToSet: '$companyId' },

      // Salary analysis
      avgMinSalary: { $avg: '$salaryRange.min' },
      avgMaxSalary: { $avg: '$salaryRange.max' },
      medianSalary: { $avg: { $avg: ['$salaryRange.min', '$salaryRange.max'] } },

      // Company quality
      avgCompanyRating: { $avg: '$company.averageRating' },

      // Work arrangements
      remoteJobs: { $sum: { $cond: [{ $eq: ['$workArrangement', 'Remote'] }, 1, 0] } },
      hybridJobs: { $sum: { $cond: [{ $eq: ['$workArrangement', 'Hybrid'] }, 1, 0] } },
      onsiteJobs: { $sum: { $cond: [{ $eq: ['$workArrangement', 'On-site'] }, 1, 0] } },

      // Skills demand
      topSkills: { $push: '$requiredSkills' },

      // Geographic center calculation
      avgLongitude: { $avg: { $arrayElemAt: ['$locations.coordinates', 0] } },
      avgLatitude: { $avg: { $arrayElemAt: ['$locations.coordinates', 1] } }
    }
  },

  // Stage 5: Calculate market insights
  {
    $addFields: {
      companyCount: { $size: '$uniqueCompanies' },
      jobDensity: { $divide: ['$totalJobs', { $size: '$uniqueCompanies' }] },
      remoteFlexibility: {
        $multiply: [
          { $divide: [{ $add: ['$remoteJobs', '$hybridJobs'] }, '$totalJobs'] },
          100
        ]
      },
      salaryCompetitiveness: {
        $cond: {
          if: { $gte: ['$medianSalary', 25000] },
          then: 'High',
          else: {
            $cond: {
              if: { $gte: ['$medianSalary', 18000] },
              then: 'Medium',
              else: 'Low'
            }
          }
        }
      },
      marketHotness: {
        $add: [
          { $cond: [{ $gte: ['$totalJobs', 20] }, 3, 0] },
          { $cond: [{ $gte: ['$avgCompanyRating', 4.0] }, 2, 0] },
          { $cond: [{ $gte: ['$medianSalary', 20000] }, 2, 0] },
          { $cond: [{ $gte: ['$remoteFlexibility', 30] }, 1, 0] }
        ]
      }
    }
  },

  // Stage 6: Sort by market attractiveness
  {
    $sort: {
      marketHotness: -1,
      medianSalary: -1,
      totalJobs: -1
    }
  },

  {
    $limit: 25
  }
])`,
        explanation: `🏙️ **Geographic Market Intelligence**:

**Spatial Region Definition**:
• **$geoWithin**: Defines geographic boundaries using polygons
• **Polygon coordinates**: Creates custom business districts
• **Hierarchical regions**: CBD, Financial District, Residential areas

**Multi-Dimensional Analysis**:
• **Region × Industry × Experience**: Three-way market segmentation
• **Job density**: Jobs per company ratio indicates market saturation
• **Salary competitiveness**: Benchmarks compensation levels

**Market Metrics**:
• **Company diversity**: Unique companies per region
• **Work flexibility**: Remote/hybrid job percentage
• **Geographic center**: Average coordinates for region mapping

**Business Intelligence**:
• **Market hotness score**: Combines multiple attractiveness factors
• **Salary competitiveness tiers**: High/Medium/Low classifications
• **Skills demand mapping**: Popular skills by geographic area

**Urban Planning Applications**:
• **Commercial real estate**: Identify high-demand business areas
• **Transportation planning**: Understand commute patterns
• **Economic development**: Target growth areas for investment

**Advanced Features**:
• **Dynamic regions**: Polygons can be updated based on city development
• **Seasonal analysis**: Can be extended with time-based grouping
• **Competitive analysis**: Compare regions for business expansion`,
        expectedResults: 'Market analysis by geographic region showing job density, salary levels, and market attractiveness',
        practiceChallenge: 'Add analysis of job posting trends over time by region'
      }
    ]
  },

  // New learning modules for comprehensive coverage
  dataModeling: {
    id: 'data-modeling',
    title: '🏗️ Data Modeling & Schema Design',
    description: 'Learn MongoDB schema design patterns, relationships, and data modeling best practices',
    difficulty: 'Intermediate',
    category: 'Schema Design',
    estimatedTime: '25 minutes',
    learningObjectives: [
      'Understand document-oriented data modeling',
      'Design efficient schemas for different use cases',
      'Implement embedding vs referencing strategies',
      'Handle one-to-many and many-to-many relationships',
      'Optimize schema for query patterns',
      'Use schema validation and design patterns'
    ],
    businessScenario: 'Design a scalable job platform schema that handles complex relationships between users, companies, jobs, and applications',
    mongodbConcepts: ['Document Design', 'Embedding', 'Referencing', 'Schema Validation', 'Indexes', 'Relationships'],
    prerequisites: ['Basic MongoDB knowledge', 'Understanding of relational concepts', 'JSON structure familiarity'],
    queries: [
      {
        name: 'Embedded vs Referenced Design Patterns',
        description: 'Compare different approaches to modeling job applications with user and job data',
        code: `// Pattern 1: Embedded Design (for frequently accessed, small datasets)
const embeddedApplicationSchema = {
  _id: ObjectId("..."),
  status: "Applied",
  appliedDate: new Date(),

  // Embedded user data (snapshot at time of application)
  applicant: {
    _id: ObjectId("user123"),
    name: "John Doe",
    email: "john@example.com",
    resumeUrl: "https://...",
    skills: ["JavaScript", "React", "Node.js"]
  },

  // Embedded job data (snapshot)
  job: {
    _id: ObjectId("job456"),
    title: "Senior Developer",
    company: "Tech Corp",
    salaryRange: { min: 25000, max: 35000, currency: "QAR" },
    location: "Doha, Qatar"
  },

  // Application-specific data
  coverLetter: "I am excited to apply...",
  customAnswers: [
    { question: "Why do you want this role?", answer: "Because..." }
  ],

  // Tracking data
  viewedByEmployer: true,
  lastUpdated: new Date()
}

// Pattern 2: Referenced Design (for large, frequently changing data)
const referencedApplicationSchema = {
  _id: ObjectId("..."),
  userId: ObjectId("user123"),      // Reference to User collection
  jobId: ObjectId("job456"),        // Reference to Job collection
  companyId: ObjectId("company789"), // Reference to Company collection

  status: "Applied",
  appliedDate: new Date(),

  // Only application-specific data stored here
  coverLetter: "I am excited to apply...",
  customAnswers: [
    { question: "Why do you want this role?", answer: "Because..." }
  ],

  // Metadata
  source: "website", // How they found the job
  referralCode: "REF123",

  // Tracking
  statusHistory: [
    { status: "Applied", date: new Date(), note: "Initial application" },
    { status: "Reviewed", date: new Date(), note: "HR review completed" }
  ]
}

// Query comparison - Embedded approach
Application.find({ "applicant.skills": "JavaScript" })

// Query comparison - Referenced approach
Application.find({ userId: { $in: userIdsWithJavaScript } })
  .populate('userId', 'name email skills')
  .populate('jobId', 'title company salaryRange')`,
        explanation: `🏗️ **Schema Design Decision Framework**:

**Embedded Design Benefits**:
• **Single query access**: All data in one document
• **Atomic updates**: Consistent data snapshots
• **Better performance**: No joins needed
• **Historical accuracy**: Preserves data at application time

**Referenced Design Benefits**:
• **Data consistency**: Single source of truth
• **Storage efficiency**: No data duplication
• **Flexible updates**: Changes reflect everywhere
• **Better for large datasets**: Smaller document sizes

**When to Embed**:
• Data doesn't change frequently
• Small, bounded datasets
• Always accessed together
• Historical snapshots needed

**When to Reference**:
• Large documents (>16MB limit)
• Frequently changing data
• Many-to-many relationships
• Independent data lifecycle

**Hybrid Approach**:
• Store critical snapshot data (embedded)
• Reference full records for updates
• Best of both worlds for applications`,
        expectedResults: 'Understanding of when to use embedded vs referenced patterns',
        practiceChallenge: 'Design a schema for job bookmarks that users can organize into folders'
      }
    ]
  },

  performanceOptimization: {
    id: 'performance-optimization',
    title: '⚡ Performance Optimization & Indexing',
    description: 'Master MongoDB performance tuning, indexing strategies, and query optimization techniques',
    difficulty: 'Advanced',
    category: 'Performance',
    estimatedTime: '40 minutes',
    learningObjectives: [
      'Design optimal index strategies for different query patterns',
      'Use explain() to analyze query performance',
      'Implement compound indexes and index intersection',
      'Optimize aggregation pipelines for speed',
      'Handle large dataset queries efficiently',
      'Monitor and troubleshoot performance issues'
    ],
    businessScenario: 'Optimize a job platform handling millions of jobs and applications with complex search requirements',
    mongodbConcepts: ['Indexes', 'Query Plans', 'explain()', 'Compound Indexes', 'Pipeline Optimization', 'Performance Monitoring'],
    prerequisites: ['Advanced querying knowledge', 'Understanding of database concepts', 'Aggregation pipeline experience'],
    queries: [
      {
        name: 'Index Strategy for Job Search Platform',
        description: 'Design and implement optimal indexes for common job search patterns',
        code: `// 1. Analyze current query patterns
db.jobs.find({ status: "Active", industry: "Technology" }).explain("executionStats")

// 2. Create compound indexes for common query combinations
db.jobs.createIndex({
  status: 1,
  industry: 1,
  "salaryRange.min": 1
}, {
  name: "job_search_compound",
  background: true
})

// 3. Text search index with weights
db.jobs.createIndex({
  title: "text",
  description: "text",
  requiredSkills: "text"
}, {
  weights: { title: 10, requiredSkills: 5, description: 1 },
  name: "job_text_search"
})

// 4. Geospatial index for location queries
db.jobs.createIndex({ "locations.coordinates": "2dsphere" })

// 5. Sparse index for optional fields
db.jobs.createIndex({
  applicationDeadline: 1
}, {
  sparse: true,
  name: "deadline_sparse"
})

// 6. Partial index for active jobs only
db.jobs.createIndex({
  postedDate: -1,
  "salaryRange.max": -1
}, {
  partialFilterExpression: { status: "Active" },
  name: "active_jobs_optimized"
})

// Performance-optimized job search query
Job.find({
  status: "Active",                    // Uses compound index
  industry: "Technology",              // Uses compound index
  "salaryRange.min": { $gte: 15000 },  // Uses compound index
  $text: { $search: "javascript react" } // Uses text index
})
.hint("job_search_compound")           // Force specific index
.sort({ postedDate: -1 })             // Uses partial index
.limit(20)                            // Limit results
.lean()                               // Skip Mongoose overhead
.explain("executionStats")            // Analyze performance`,
        explanation: `⚡ **Advanced Indexing Strategies**:

**Compound Index Design**:
• **Field order matters**: Most selective fields first
• **Equality, Range, Sort**: ESR rule for optimal performance
• **Query pattern analysis**: Design indexes for actual usage

**Specialized Index Types**:
• **Text indexes**: Full-text search with relevance scoring
• **2dsphere**: Geospatial queries with spherical geometry
• **Sparse indexes**: Only index documents with the field
• **Partial indexes**: Index subset of documents

**Performance Optimization Techniques**:
• **hint()**: Force specific index usage
• **lean()**: Return plain JavaScript objects (faster)
• **limit()**: Reduce result set size
• **explain()**: Analyze query execution

**Index Maintenance**:
• **Background creation**: Doesn't block operations
• **Index monitoring**: Track usage and performance
• **Regular optimization**: Remove unused indexes

**Query Plan Analysis**:
• **executionStats**: Detailed performance metrics
• **totalDocsExamined**: Should be close to totalDocsReturned
• **executionTimeMillis**: Target <100ms for user queries`,
        expectedResults: 'Optimized query execution with proper index utilization and sub-100ms response times',
        practiceChallenge: 'Create indexes for a complex aggregation pipeline with multiple $match stages'
      }
    ]
  }
};
