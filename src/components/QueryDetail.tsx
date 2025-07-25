'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Lightbulb as LightbulbIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useQuery } from '../contexts/QueryContext';
import QueryResults from '../components/QueryResults/QueryResults';
import QueryParameters from '../components/QueryParameters/QueryParameters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`query-tabpanel-${index}`}
      aria-labelledby={`query-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const QueryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, fetchQueryById, executeQuery } = useQuery();
  const { currentQuery, queryResult, loading, error } = state;
  
  const [tabValue, setTabValue] = useState(0);
  const [editorValue, setEditorValue] = useState('');
  const [parameters, setParameters] = useState<any>({});
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQueryById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentQuery && currentQuery.queries.length > 0) {
      setEditorValue(currentQuery.queries[0].code);
    }
  }, [currentQuery]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExecuteQuery = async () => {
    if (!id) return;
    
    setExecuting(true);
    try {
      // Map the query ID to the actual executable query ID
      const executableQueryId = getExecutableQueryId(id);
      await executeQuery(executableQueryId, parameters);
    } catch (err) {
      console.error('Failed to execute query:', err);
    } finally {
      setExecuting(false);
    }
  };

  const getExecutableQueryId = (queryId: string): string => {
    // Map the educational query IDs to executable query IDs
    const mapping: { [key: string]: string } = {
      'basic-find': 'basic-find-companies',
      'advanced-filtering': 'advanced-job-search',
      'aggregation': 'salary-analysis',
      'text-search': 'text-search-jobs',
      'geospatial': 'nearby-jobs',
    };
    return mapping[queryId] || queryId;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4caf50';
      case 'Intermediate': return '#ff9800';
      case 'Advanced': return '#f44336';
      default: return '#757575';
    }
  };

  if (loading && !currentQuery) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading query details...</Typography>
      </Box>
    );
  }

  if (!currentQuery) {
    return (
      <Alert severity="error">
        Query not found. Please check the URL and try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/queries')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {currentQuery.title}
            </Typography>
            <Chip
              label={currentQuery.difficulty}
              sx={{
                backgroundColor: getDifficultyColor(currentQuery.difficulty) + '15',
                color: getDifficultyColor(currentQuery.difficulty),
                fontWeight: 600,
              }}
            />
            <Chip label={currentQuery.category} variant="outlined" />
          </Box>
          <Typography variant="body1" color="text.secondary">
            {currentQuery.description}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Left Panel - Educational Content */}
        <Box sx={{ flex: { lg: '1 1 0%' } }}>
          <Card sx={{ height: 'fit-content', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Business Scenario
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {currentQuery.businessScenario}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: 'fit-content', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Learning Objectives
                </Typography>
              </Box>
              <List dense>
                {currentQuery.learningObjectives.map((objective, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LightbulbIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={objective}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  MongoDB Concepts
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentQuery.mongodbConcepts.map((concept, index) => (
                  <Chip
                    key={index}
                    label={concept}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Panel - Interactive Query */}
        <Box sx={{ flex: { lg: '2 1 0%' } }}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Query Editor" />
                <Tab label="Parameters" />
                <Tab label="Results" />
                <Tab label="Explanation" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Interactive Query Editor
                </Typography>
                <Box>
                  <Tooltip title="Copy query">
                    <IconButton onClick={() => copyToClipboard(editorValue)} size="small">
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={handleExecuteQuery}
                    disabled={executing}
                    sx={{ ml: 1 }}
                  >
                    {executing ? 'Executing...' : 'Execute Query'}
                  </Button>
                </Box>
              </Box>
              
              <Paper sx={{ border: 1, borderColor: 'divider' }}>
                <Editor
                  height="400px"
                  defaultLanguage="javascript"
                  value={editorValue}
                  onChange={(value) => setEditorValue(value || '')}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                  }}
                />
              </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <QueryParameters
                queryId={id || ''}
                parameters={parameters}
                onParametersChange={setParameters}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <QueryResults result={queryResult} loading={executing} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              {currentQuery.queries.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {currentQuery.queries[0].name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {currentQuery.queries[0].description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Detailed Explanation
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-line',
                      fontFamily: 'monospace',
                      backgroundColor: 'grey.50',
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    {currentQuery.queries[0].explanation}
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default QueryDetail;
