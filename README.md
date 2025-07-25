# MongoDB Demo - Next.js Fullstack Application

A comprehensive MongoDB demonstration application built with Next.js, featuring a complete job portal with advanced querying capabilities, educational content, and real-time data visualization.

## 🚀 Features

### Core Functionality
- **Full-Stack Next.js Application** - Unified frontend and backend in a single codebase
- **MongoDB Integration** - Complete CRUD operations with Mongoose ODM
- **Educational Query System** - 12+ predefined MongoDB queries with explanations
- **Custom Query Executor** - Safe execution of user-defined MongoDB queries
- **Real-time Analytics** - Database statistics and insights
- **Material-UI Interface** - Modern, responsive design

### Database Models
- **Users** - Admin, Job Seekers, and Employers with role-based access
- **Companies** - Comprehensive company profiles with locations and ratings
- **Jobs** - Detailed job postings with salary ranges and requirements
- **Applications** - Complete application tracking system
- **Profiles** - Separate job seeker and employer profile systems

### API Endpoints
- **Health Check** - `/api/health`
- **Query Management** - `/api/queries` and `/api/queries/[id]`
- **Data Execution** - `/api/data/execute/[queryId]`
- **Custom Queries** - `/api/data/execute-custom/[collection]`
- **Statistics** - `/api/data/stats`

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Material-UI, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Material-UI with custom theme
- **Development**: TypeScript, ESLint, Hot Reload

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-mongodb-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODBURI=your_mongodb_connection_string
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data
- `npm run seed:destroy` - Clear all database data
- `npm run type-check` - Run TypeScript type checking

## 📊 Database Schema

### Collections Overview
- **users** - User accounts and authentication
- **companies** - Company information and profiles
- **jobseekerprofiles** - Job seeker details and preferences
- **employerprofiles** - Employer information and hiring authority
- **jobs** - Job postings and requirements
- **applications** - Application tracking and status

## 🔍 Query Examples

### Basic Find Operations
```javascript
// Find technology companies
Company.find({
  industry: 'Technology',
  isActive: true
})
.select('companyName industry employeeCount averageRating')
.limit(5)
```

### Advanced Filtering
```javascript
// Find remote jobs in Doha with salary > 15000 QAR
Job.find({
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
.limit(5)
```

### Aggregation Pipeline
```javascript
// Salary analysis by industry and experience level
Job.aggregate([
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
    $group: {
      _id: {
        experienceLevel: '$experienceLevel',
        industry: '$company.industry'
      },
      avgMinSalary: { $avg: '$salaryRange.min' },
      avgMaxSalary: { $avg: '$salaryRange.max' },
      jobCount: { $sum: 1 }
    }
  }
])
```

## 🔒 Security Features

- **Read-Only Operations** - Custom queries are restricted to read operations only
- **Query Validation** - Input sanitization and validation
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Cross-origin request handling
- **Environment Variables** - Secure configuration management

## 📱 Pages and Routes

- **Dashboard** (`/`) - Overview and statistics
- **Query Explorer** (`/queries`) - Browse predefined queries
- **Query Details** (`/queries/[id]`) - Detailed query information
- **Custom Query** (`/custom`) - Execute custom MongoDB queries

## 🧪 Testing

The application includes comprehensive HTTP test files for all API endpoints:

```bash
# Test all endpoints
npm run test:http

# Test specific endpoint
curl http://localhost:3000/api/health
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
npm run build
npm run start
```

## 📈 Performance Considerations

- **Database Indexing** - Optimized indexes for common queries
- **Connection Pooling** - Efficient MongoDB connection management
- **Caching** - Next.js built-in caching mechanisms
- **Code Splitting** - Automatic code splitting with Next.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the example queries

---

**Built with ❤️ using Next.js and MongoDB**
