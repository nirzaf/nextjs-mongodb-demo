export const QUERY_DEFINITIONS = {
  basicFind: {
    id: 'basic-find',
    title: 'Basic Find Operations',
    description: 'Learn fundamental MongoDB find operations with filtering and selection',
    difficulty: 'Beginner',
    category: 'CRUD Operations',
    learningObjectives: [
      'Understand basic find() syntax',
      'Learn field selection with select()',
      'Practice simple filtering conditions',
      'Use limit() for result pagination'
    ],
    businessScenario: 'HR wants to find all technology companies for industry-specific job searches',
    mongodbConcepts: ['find()', 'select()', 'limit()', 'Basic Filtering'],
    queries: [
      {
        name: 'Find Technology Companies',
        description: 'Find all active companies in the Technology industry',
        code: `Company.find({ 
  industry: 'Technology',
  isActive: true 
})
.select('companyName industry employeeCount averageRating')
.limit(5)`,
        explanation: `This query demonstrates:
• find() with multiple conditions using AND logic
• select() to return only specific fields
• limit() to control result size
• Filtering by enum values and boolean fields`
      }
    ]
  },
  
  advancedFiltering: {
    id: 'advanced-filtering',
    title: 'Advanced Filtering & Sorting',
    description: 'Master complex filtering with multiple conditions, operators, and sorting',
    difficulty: 'Intermediate',
    category: 'Querying',
    learningObjectives: [
      'Use logical operators ($or, $and)',
      'Apply comparison operators ($gte, $lte)',
      'Implement complex sorting strategies',
      'Combine multiple filter conditions'
    ],
    businessScenario: 'Job seekers want to filter jobs by location, salary, and work arrangement',
    mongodbConcepts: ['$or operator', 'Comparison operators', 'sort()', 'Complex filtering'],
    queries: [
      {
        name: 'Advanced Job Search',
        description: 'Find remote jobs in Doha with salary > 15000 QAR',
        code: `Job.find({
  status: 'Active',
  'locations.city': 'Doha',
  $or: [
    { workArrangement: 'Remote' },
    { 'locations.isRemoteAllowed': true }
  ],
  'salaryRange.min': { $gte: 15000 },
  'salaryRange.currency': 'QAR'
})
.populate('companyId', 'companyName logoUrl')
.sort({ postedDate: -1, 'salaryRange.max': -1 })
.limit(5)`,
        explanation: `This query showcases:
• $or operator for alternative conditions
• Nested field querying ('locations.city')
• $gte comparison operator
• populate() for joining related data
• Multi-field sorting with different directions`
      }
    ]
  },

  aggregation: {
    id: 'aggregation',
    title: 'Aggregation Pipelines',
    description: 'Learn powerful data aggregation for analytics and reporting',
    difficulty: 'Advanced',
    category: 'Analytics',
    learningObjectives: [
      'Build aggregation pipelines',
      'Use $match, $group, $sort stages',
      'Perform $lookup for joins',
      'Calculate averages and counts'
    ],
    businessScenario: 'Generate market insights for salary benchmarking across industries',
    mongodbConcepts: ['Aggregation Pipeline', '$match', '$group', '$lookup', '$avg'],
    queries: [
      {
        name: 'Salary Analysis by Industry',
        description: 'Calculate average salaries by experience level and industry',
        code: `Job.aggregate([
  {
    $match: {
      status: 'Active',
      'salaryRange.currency': 'QAR'
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
  }
])`,
        explanation: `This aggregation pipeline demonstrates:
• $match stage for initial filtering
• $lookup for joining collections (like SQL JOIN)
• $unwind to flatten array results
• $group with complex _id and calculations
• $avg aggregation operator
• $sort for organized output`
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
