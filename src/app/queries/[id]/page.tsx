import QueryDetail from '../../../components/QueryDetail';

interface QueryPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dynamic query page component that displays detailed information about a specific query
 * Handles routes like /queries/basic-find, /queries/aggregation, etc.
 */
export default async function QueryPage({ params }: QueryPageProps) {
  const { id } = await params;
  
  return <QueryDetail id={id} />;
}

/**
 * Generate static params for all available queries
 * This enables static generation for better performance
 */
export async function generateStaticParams() {
  // Define the available query IDs that match the ones in definitions.ts
  const queryIds = [
    'basic-find',
    'advanced-filtering', 
    'aggregation',
    'text-search',
    'geospatial',
    'data-modeling',
    'performance-optimization'
  ];

  return queryIds.map((id) => ({
    id,
  }));
}
