'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Help as HelpIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useQuery } from '../contexts/QueryContext';
import QueryResults from '../components/QueryResults/QueryResults';

const CustomQuery: React.FC = () => {
  const { state, executeCustomQuery } = useQuery();
  const { queryResult, loading } = state;
  
  const [tabValue, setTabValue] = useState(0);
  const [query, setQuery] = useState('{\n  "status": "Active"\n}');
  const [collection, setCollection] = useState('jobs');
  const [operation, setOperation] = useState('find');
  const [executing, setExecuting] = useState(false);

  const collections = [
    { value: 'users', label: 'Users', description: 'User accounts and profiles' },
    { value: 'companies', label: 'Companies', description: 'Company information and details' },
    { value: 'jobseekerprofiles', label: 'Job Seeker Profiles', description: 'Candidate profiles and preferences' },
    { value: 'employerprofiles', label: 'Employer Profiles', description: 'Recruiter and HR profiles' },
    { value: 'jobs', label: 'Jobs', description: 'Job postings and requirements' },
    { value: 'applications', label: 'Applications', description: 'Job applications and status' },
  ];

  const operations = [
    { value: 'find', label: 'find()', description: 'Find documents matching criteria' },
    { value: 'findOne', label: 'findOne()', description: 'Find a single document' },
    { value: 'aggregate', label: 'aggregate()', description: 'Run aggregation pipeline' },
    { value: 'countDocuments', label: 'countDocuments()', description: 'Count matching documents' },
  ];

  const examples = [
    {
      title: 'Find Active Jobs',
      collection: 'jobs',
      operation: 'find',
      query: '{\n  "status": "Active",\n  "workArrangement": "Remote"\n}',
    },
    {
      title: 'Count Applications by Status',
      collection: 'applications',
      operation: 'aggregate',
      query: '[\n  {\n    "$group": {\n      "_id": "$status",\n      "count": { "$sum": 1 }\n    }\n  },\n  {\n    "$sort": { "count": -1 }\n  }\n]',
    },
    {
      title: 'Find Senior Developers',
      collection: 'jobseekerprofiles',
      operation: 'find',
      query: '{\n  "experienceLevel": "Senior",\n  "skills.name": { "$in": ["JavaScript", "React"] }\n}',
    },
    {
      title: 'Technology Companies',
      collection: 'companies',
      operation: 'find',
      query: '{\n  "industry": "Technology",\n  "isActive": true\n}',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExecuteQuery = async () => {
    setExecuting(true);
    try {
      let parsedQuery;
      try {
        parsedQuery = JSON.parse(query);
      } catch (err) {
        throw new Error('Invalid JSON syntax in query');
      }
      
      await executeCustomQuery(parsedQuery, collection, operation);
    } catch (err) {
      console.error('Failed to execute custom query:', err);
    } finally {
      setExecuting(false);
    }
  };

  const loadExample = (example: { title: string; collection: string; operation: string; query: string }) => {
    setQuery(example.query);
    setCollection(example.collection);
    setOperation(example.operation);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Custom Query Builder
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Write and execute your own MongoDB queries. Experiment with different collections and operations to learn MongoDB syntax.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Left Panel - Query Builder */}
        <Box sx={{ flex: { lg: '2 1 0%' } }}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Query Builder" />
                <Tab label="Results" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <CardContent>
                {/* Security Warning */}
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SecurityIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Read-Only Mode:</strong> Only read operations (find, aggregate, count) are allowed for security.
                    </Typography>
                  </Box>
                </Alert>

                {/* Collection and Operation Selection */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel>Collection</InputLabel>
                      <Select
                        value={collection}
                        label="Collection"
                        onChange={(e) => setCollection(e.target.value)}
                      >
                        {collections.map((col) => (
                          <MenuItem key={col.value} value={col.value}>
                            <Box>
                              <Typography variant="body2">{col.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {col.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel>Operation</InputLabel>
                      <Select
                        value={operation}
                        label="Operation"
                        onChange={(e) => setOperation(e.target.value)}
                      >
                        {operations.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            <Box>
                              <Typography variant="body2">{op.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {op.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Query Editor */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Query JSON
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      onClick={handleExecuteQuery}
                      disabled={executing}
                    >
                      {executing ? 'Executing...' : 'Execute Query'}
                    </Button>
                  </Box>
                  
                  <Paper sx={{ border: 1, borderColor: 'divider' }}>
                    <Editor
                      height="300px"
                      defaultLanguage="json"
                      value={query}
                      onChange={(value) => setQuery(value || '')}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                    />
                  </Paper>
                </Box>

                {/* Generated Query Preview */}
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Generated Query:</strong> {collection}.{operation}({query.replace(/\s+/g, ' ')})
                  </Typography>
                </Alert>
              </CardContent>
            )}

            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <QueryResults result={queryResult} loading={executing} />
              </Box>
            )}
          </Card>
        </Box>

        {/* Right Panel - Examples and Help */}
        <Box sx={{ flex: { lg: '1 1 0%' } }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Query Examples
                </Typography>
              </Box>
              
              <List dense>
                {examples.map((example, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      component="div"
                      onClick={() => loadExample(example)}
                      sx={{ borderRadius: 1, mb: 1, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <ListItemIcon>
                        <StorageIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={example.title}
                        secondary={`${example.collection}.${example.operation}()`}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                    {index < examples.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Quick Tips
                </Typography>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="JSON Syntax"
                    secondary="Use valid JSON format for queries. Strings must be in double quotes."
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Aggregation Pipelines"
                    secondary="Use arrays for aggregation operations with multiple stages."
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Field References"
                    secondary="Use dot notation for nested fields like 'user.profile.name'."
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomQuery;
