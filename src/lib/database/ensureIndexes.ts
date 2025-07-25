import { connectDatabase } from '@/lib/database';
import { Job, Company, User, JobSeekerProfile, EmployerProfile, Application } from '@/lib/models';

/**
 * Ensures all database indexes are created
 * This should be called during application startup or deployment
 */
export async function ensureIndexes() {
  try {
    await connectDatabase();
    
    console.log('Creating database indexes...');
    
    // Create indexes for all models
    await Promise.all([
      Job.createIndexes(),
      Company.createIndexes(),
      User.createIndexes(),
      JobSeekerProfile.createIndexes(),
      EmployerProfile.createIndexes(),
      Application.createIndexes()
    ]);
    
    console.log('Database indexes created successfully');
    
    // Verify text index exists on Job collection
    const jobIndexes = await Job.collection.getIndexes();
    const hasTextIndex = Object.keys(jobIndexes).some(indexName => 
      indexName.includes('text') || jobIndexes[indexName].some((field: any) => field[1] === 'text')
    );
    
    if (hasTextIndex) {
      console.log('✓ Text search index found on Job collection');
    } else {
      console.warn('⚠ Text search index not found on Job collection');
    }
    
    // Verify geospatial index exists
    const hasGeoIndex = Object.keys(jobIndexes).some(indexName => 
      indexName.includes('2dsphere') || indexName.includes('coordinates')
    );
    
    if (hasGeoIndex) {
      console.log('✓ Geospatial index found on Job collection');
    } else {
      console.warn('⚠ Geospatial index not found on Job collection');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating database indexes:', error);
    return false;
  }
}

/**
 * Drops and recreates all indexes
 * Use with caution - only for development/testing
 */
export async function recreateIndexes() {
  try {
    await connectDatabase();
    
    console.log('Dropping existing indexes...');
    
    // Drop all indexes except _id (which cannot be dropped)
    await Promise.all([
      Job.collection.dropIndexes(),
      Company.collection.dropIndexes(),
      User.collection.dropIndexes(),
      JobSeekerProfile.collection.dropIndexes(),
      EmployerProfile.collection.dropIndexes(),
      Application.collection.dropIndexes()
    ]);
    
    console.log('Recreating indexes...');
    
    // Recreate all indexes
    await ensureIndexes();
    
    console.log('Indexes recreated successfully');
    return true;
  } catch (error) {
    console.error('Error recreating indexes:', error);
    return false;
  }
}
