'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useQuery } from '../contexts/QueryContext';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { state, fetchDatabaseStats, fetchQueries } = useQuery();
  const { dbStats, queries, executionHistory, loading, error } = state;

  useEffect(() => {
    fetchDatabaseStats();
    fetchQueries();
  }, []);

  const statsCards = [
    {
      title: 'Users',
      value: dbStats?.users?.total || 0,
      icon: <PeopleIcon />,
      color: '#1976d2',
      description: 'Total registered users',
    },
    {
      title: 'Companies',
      value: dbStats?.companies?.total || 0,
      icon: <BusinessIcon />,
      color: '#388e3c',
      description: 'Active companies',
    },
    {
      title: 'Jobs',
      value: dbStats?.jobs?.total || 0,
      icon: <WorkIcon />,
      color: '#f57c00',
      description: 'Available positions',
    },
    {
      title: 'Applications',
      value: dbStats?.applications?.total || 0,
      icon: <AssignmentIcon />,
      color: '#7b1fa2',
      description: 'Total applications',
    },
  ];

  const learningPaths = [
    {
      title: 'Basic Queries',
      description: 'Learn fundamental find operations and filtering',
      difficulty: 'Beginner',
      queries: queries.filter(q => q.difficulty === 'Beginner').length,
      color: '#4caf50',
    },
    {
      title: 'Advanced Filtering',
      description: 'Master complex conditions and sorting',
      difficulty: 'Intermediate',
      queries: queries.filter(q => q.difficulty === 'Intermediate').length,
      color: '#ff9800',
    },
    {
      title: 'Aggregation Pipelines',
      description: 'Build powerful analytics queries',
      difficulty: 'Advanced',
      queries: queries.filter(q => q.difficulty === 'Advanced').length,
      color: '#f44336',
    },
  ];

  if (loading && !dbStats) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        MongoDB Learning Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to the interactive MongoDB learning platform. Explore queries, understand concepts, and practice with real data.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Database Statistics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Box key={index} sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: stat.color + '15',
                      color: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {stat.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Learning Paths */}
        <Box sx={{ flex: '2 1 600px', minWidth: '600px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Learning Paths
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {learningPaths.map((path, index) => (
                  <Box key={index} sx={{ flex: '1 1 180px', minWidth: '180px' }}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => router.push('/queries')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={path.difficulty}
                          size="small"
                          sx={{
                            backgroundColor: path.color + '15',
                            color: path.color,
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                          {path.queries}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                        {path.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {path.description}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<CodeIcon />}
                  onClick={() => router.push('/queries')}
                  sx={{ mr: 2 }}
                >
                  Start Learning
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SpeedIcon />}
                  onClick={() => router.push('/custom')}
                >
                  Try Custom Query
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Query Executions
                </Typography>
              </Box>
              
              {executionHistory.length > 0 ? (
                <List dense>
                  {executionHistory.slice(0, 5).map((execution, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <StorageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={execution.metadata?.queryId || 'Custom Query'}
                          secondary={`${execution.metadata?.executionTime} • ${execution.metadata?.resultCount} results`}
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                      {index < Math.min(executionHistory.length - 1, 4) && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No queries executed yet. Start exploring!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
