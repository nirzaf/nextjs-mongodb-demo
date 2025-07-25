import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  DataObject as DataIcon,
  TableChart as TableIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { QueryResult } from '../../contexts/QueryContext';

interface QueryResultsProps {
  result: QueryResult | null;
  loading: boolean;
}

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
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const QueryResults: React.FC<QueryResultsProps> = ({ result, loading }) => {
  const [tabValue, setTabValue] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Utility function to determine if data is suitable for table display
  const isTableDisplayable = (data: any): boolean => {
    if (!data) return false;

    // Must be an array
    if (!Array.isArray(data)) return false;

    // Empty arrays can't be displayed as tables
    if (data.length === 0) return false;

    // Check if all items are objects with similar structure
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) return false;

    // Check if it's a complex nested structure that's better shown as JSON
    const hasComplexNesting = data.some(item => {
      return Object.values(item).some(value => {
        if (Array.isArray(value) && value.length > 0) {
          // Arrays of objects are complex
          return typeof value[0] === 'object';
        }
        if (typeof value === 'object' && value !== null) {
          // Deep nested objects are complex
          return Object.keys(value).length > 3;
        }
        return false;
      });
    });

    if (hasComplexNesting) return false;

    // Check if items have reasonably consistent structure
    const firstKeys = Object.keys(firstItem);
    const hasConsistentStructure = data.every(item => {
      const itemKeys = Object.keys(item);
      // Allow some variation but require at least 50% key overlap
      const overlap = firstKeys.filter(key => itemKeys.includes(key)).length;
      return overlap >= Math.min(firstKeys.length * 0.5, 3);
    });

    return hasConsistentStructure;
  };

  const renderTableView = (data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No data to display
        </Typography>
      );
    }

    // Get all unique keys from the data
    const allKeys = Array.from(
      new Set(data.flatMap(item => Object.keys(item)))
    ).filter(key => key !== '__v'); // Exclude mongoose version key

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}>#</TableCell>
              {allKeys.slice(0, 6).map(key => (
                <TableCell key={key} sx={{ fontWeight: 600 }}>
                  {key}
                </TableCell>
              ))}
              {allKeys.length > 6 && (
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <React.Fragment key={index}>
                <TableRow hover>
                  <TableCell>{index + 1}</TableCell>
                  {allKeys.slice(0, 6).map(key => (
                    <TableCell key={key}>
                      <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formatValue(row[key])}
                      </Box>
                    </TableCell>
                  ))}
                  {allKeys.length > 6 && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(index)}
                      >
                        {expandedRows.has(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
                {allKeys.length > 6 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 0 }}>
                      <Collapse in={expandedRows.has(index)}>
                        <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Complete Record:
                          </Typography>
                          <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                            {JSON.stringify(row, null, 2)}
                          </pre>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderJsonView = (data: any) => {
    return (
      <Paper sx={{ p: 2, backgroundColor: 'grey.50', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Tooltip title="Copy JSON">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
            >
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <pre style={{ 
          fontSize: '0.875rem', 
          overflow: 'auto', 
          maxHeight: '500px',
          margin: 0,
          paddingTop: '32px'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Executing query...
        </Typography>
      </Box>
    );
  }

  if (!result) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <DataIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Results Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Execute a query to see the results here.
        </Typography>
      </Paper>
    );
  }

  if (!result.success) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle2" gutterBottom>
          Query Execution Failed
        </Typography>
        <Typography variant="body2">
          {result.error || 'An unknown error occurred'}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Metadata */}
      {result.metadata && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <SpeedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Execution Summary
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<SpeedIcon />}
                label={`${result.metadata.executionTime}ms`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<DataIcon />}
                label={`${result.metadata.resultCount || 0} results`}
                color="success"
                variant="outlined"
              />
              {result.metadata.queryId && (
                <Chip
                  icon={<CodeIcon />}
                  label={result.metadata.queryId}
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Paper>
        {isTableDisplayable(result.data) ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab icon={<TableIcon />} label="Table View" />
                <Tab icon={<CodeIcon />} label="JSON View" />
              </Tabs>
            </Box>

            <Box sx={{ p: 2 }}>
              <TabPanel value={tabValue} index={0}>
                {renderTableView(result.data)}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {renderJsonView(result.data)}
              </TabPanel>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={0} onChange={() => {}}>
                <Tab icon={<CodeIcon />} label="JSON View" />
              </Tabs>
            </Box>

            <Box sx={{ p: 2 }}>
              <TabPanel value={0} index={0}>
                {renderJsonView(result.data)}
              </TabPanel>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default QueryResults;
