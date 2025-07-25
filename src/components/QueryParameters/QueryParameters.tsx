import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface QueryParametersProps {
  queryId: string;
  parameters: any;
  onParametersChange: (parameters: any) => void;
}

const QueryParameters: React.FC<QueryParametersProps> = ({
  queryId,
  parameters,
  onParametersChange,
}) => {
  const handleParameterChange = (key: string, value: any) => {
    onParametersChange({
      ...parameters,
      [key]: value,
    });
  };

  const getParameterConfig = (queryId: string) => {
    const configs: { [key: string]: any } = {
      'basic-find': [
        {
          key: 'industry',
          label: 'Industry',
          type: 'select',
          options: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail'],
          default: 'Technology',
          description: 'Filter companies by industry type',
        },
        {
          key: 'limit',
          label: 'Result Limit',
          type: 'number',
          default: 5,
          min: 1,
          max: 50,
          description: 'Maximum number of results to return',
        },
      ],
      'advanced-filtering': [
        {
          key: 'city',
          label: 'City',
          type: 'text',
          default: 'Doha',
          description: 'Filter jobs by city location',
        },
        {
          key: 'minSalary',
          label: 'Minimum Salary',
          type: 'number',
          default: 15000,
          min: 0,
          description: 'Minimum salary requirement in QAR',
        },
        {
          key: 'currency',
          label: 'Currency',
          type: 'select',
          options: ['QAR', 'USD', 'EUR'],
          default: 'QAR',
          description: 'Salary currency',
        },
        {
          key: 'workArrangement',
          label: 'Work Arrangement',
          type: 'select',
          options: ['Remote', 'Hybrid', 'On-site'],
          default: 'Remote',
          description: 'Preferred work arrangement',
        },
        {
          key: 'remoteAllowed',
          label: 'Remote Work Allowed',
          type: 'boolean',
          default: true,
          description: 'Include jobs that allow remote work',
        },
      ],
      'aggregation': [
        {
          key: 'currency',
          label: 'Currency',
          type: 'select',
          options: ['QAR', 'USD', 'EUR'],
          default: 'QAR',
          description: 'Currency for salary analysis',
        },
        {
          key: 'minJobCount',
          label: 'Minimum Job Count',
          type: 'number',
          default: 2,
          min: 1,
          description: 'Minimum number of jobs required for analysis',
        },
      ],
      'text-search': [
        {
          key: 'searchText',
          label: 'Search Keywords',
          type: 'text',
          default: 'software developer',
          description: 'Keywords to search for in job titles and descriptions',
        },
        {
          key: 'limit',
          label: 'Result Limit',
          type: 'number',
          default: 5,
          min: 1,
          max: 20,
          description: 'Maximum number of results to return',
        },
      ],
      'geospatial': [
        {
          key: 'coordinates',
          label: 'Coordinates (Longitude, Latitude)',
          type: 'coordinates',
          default: [51.5310, 25.2854],
          description: 'Center point for location search (Doha by default)',
        },
        {
          key: 'maxDistance',
          label: 'Max Distance (meters)',
          type: 'number',
          default: 10000,
          min: 1000,
          max: 100000,
          description: 'Maximum distance from center point in meters',
        },
      ],
    };

    return configs[queryId] || [];
  };

  const renderParameter = (param: any) => {
    const value = parameters[param.key] ?? param.default;

    switch (param.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={param.label}
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            helperText={param.description}
            size="small"
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            label={param.label}
            type="number"
            value={value || param.default}
            onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
            helperText={param.description}
            inputProps={{
              min: param.min,
              max: param.max,
            }}
            size="small"
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={value || param.default}
              label={param.label}
              onChange={(e) => handleParameterChange(param.key, e.target.value)}
            >
              {param.options.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {param.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                {param.description}
              </Typography>
            )}
          </FormControl>
        );

      case 'boolean':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={value ?? param.default}
                  onChange={(e) => handleParameterChange(param.key, e.target.checked)}
                />
              }
              label={param.label}
            />
            {param.description && (
              <Typography variant="caption" color="text.secondary" display="block">
                {param.description}
              </Typography>
            )}
          </Box>
        );

      case 'coordinates':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {param.label}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={value ? value[0] : param.default[0]}
                  onChange={(e) => {
                    const newCoords = [...(value || param.default)];
                    newCoords[0] = Number(e.target.value);
                    handleParameterChange(param.key, newCoords);
                  }}
                  size="small"
                  inputProps={{ step: 0.0001 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={value ? value[1] : param.default[1]}
                  onChange={(e) => {
                    const newCoords = [...(value || param.default)];
                    newCoords[1] = Number(e.target.value);
                    handleParameterChange(param.key, newCoords);
                  }}
                  size="small"
                  inputProps={{ step: 0.0001 }}
                />
              </Box>
            </Box>
            {param.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {param.description}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const parameterConfig = getParameterConfig(queryId);

  if (parameterConfig.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Parameters Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This query doesn&apos;t have configurable parameters.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Query Parameters
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            Modify these parameters to customize the query behavior and explore different results.
          </Typography>
        </Box>
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        {parameterConfig.map((param: any, index: number) => (
          <Box key={param.key}>
            <Paper sx={{ p: 2 }}>
              {renderParameter(param)}
            </Paper>
          </Box>
        ))}
      </Box>

      {Object.keys(parameters).length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Parameters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(parameters).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${JSON.stringify(value)}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QueryParameters;
