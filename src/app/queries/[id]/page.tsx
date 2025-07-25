import QueryDetail from '../../../components/QueryDetail';

interface QueryPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dynamic query page component that displays detailed information about a specific query
 * Handles routes like /queries/basic-find, /queries/aggregation, etc.
 */
export default async function QueryPage({ params }: QueryPageProps) {
  // The QueryDetail component gets the id from useParams() internally
  return <QueryDetail />;
}

/**
 * Generate static params for all available queries
 * This enables static generation for better performance
 */
export async function generateStaticParams() {
  // Define the available query IDs that match the ones in executor.ts
  const queryIds = [
    'basic-find-companies',
    'advanced-job-search',
    'salary-analysis',
    'text-search-jobs',
    'nearby-jobs',
    'user-profiles',
    'company-analytics',
    'application-trends',
    'job-seeker-skills',
    'employer-hiring-stats',
    'data-modeling',
    'performance-optimization'
  ];

  return queryIds.map((id) => ({
    id,
  }));
}
