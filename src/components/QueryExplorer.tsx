'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Code as CodeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useQuery } from '../contexts/QueryContext';

const QueryExplorer: React.FC = () => {
  const router = useRouter();
  const { state, fetchQueries } = useQuery();
  const { queries, loading, error } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.mongodbConcepts.some(concept => 
                           concept.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesDifficulty = !difficultyFilter || query.difficulty === difficultyFilter;
    const matchesCategory = !categoryFilter || query.category === categoryFilter;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = Array.from(new Set(queries.map(q => q.category)));
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4caf50';
      case 'Intermediate': return '#ff9800';
      case 'Advanced': return '#f44336';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crud operations': return <CodeIcon />;
      case 'analytics': return <TrendingUpIcon />;
      case 'search': return <SearchIcon />;
      default: return <SchoolIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading queries...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Query Explorer
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover and learn MongoDB queries through interactive examples. Each query includes detailed explanations and educational content.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' } }}>
            <TextField
              fullWidth
              placeholder="Search queries, concepts, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%', md: '1 1 25%' } }}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                {difficulties.map(difficulty => (
                  <MenuItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%', md: '1 1 25%' } }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 10%' } }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('');
                setCategoryFilter('');
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Query Results */}
      <Typography variant="h6" gutterBottom>
        {filteredQueries.length} {filteredQueries.length === 1 ? 'Query' : 'Queries'} Found
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {filteredQueries.map((query) => (
          <Box key={query.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => router.push(`/queries/${query.id}`)}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: getDifficultyColor(query.difficulty) + '15',
                      color: getDifficultyColor(query.difficulty),
                      mr: 2,
                    }}
                  >
                    {getCategoryIcon(query.category)}
                  </Box>
                  <Chip
                    label={query.difficulty}
                    size="small"
                    sx={{
                      backgroundColor: getDifficultyColor(query.difficulty) + '15',
                      color: getDifficultyColor(query.difficulty),
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {query.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {query.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    MongoDB Concepts:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {query.mongodbConcepts.slice(0, 3).map((concept, index) => (
                      <Chip
                        key={index}
                        label={concept}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {query.mongodbConcepts.length > 3 && (
                      <Chip
                        label={`+${query.mongodbConcepts.length - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SchoolIcon />}
                  sx={{ mt: 'auto' }}
                >
                  Learn & Practice
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredQueries.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No queries found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search terms or filters to find relevant queries.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setDifficultyFilter('');
              setCategoryFilter('');
            }}
          >
            Clear All Filters
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default QueryExplorer;
