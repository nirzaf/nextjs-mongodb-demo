import { NextRequest, NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';
import {
  User,
  Company,
  JobSeekerProfile,
  EmployerProfile,
  Job,
  Application
} from '@/lib/models';
import { withApiMiddleware } from '@/lib/middleware';

async function getStatsHandler(request: NextRequest) {
  await connectDatabase();
    
    const [
      totalUsers,
      totalCompanies,
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      totalApplications,
      activeJobs,
      activeCompanies
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      JobSeekerProfile.countDocuments(),
      EmployerProfile.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Company.countDocuments({ isActive: true })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          jobSeekers: totalJobSeekers,
          employers: totalEmployers
        },
        companies: {
          total: totalCompanies,
          active: activeCompanies
        },
        jobs: {
          total: totalJobs,
          active: activeJobs
        },
        applications: {
          total: totalApplications
        },
        lastUpdated: new Date().toISOString()
      }
    });
}

export const GET = withApiMiddleware(getStatsHandler);
