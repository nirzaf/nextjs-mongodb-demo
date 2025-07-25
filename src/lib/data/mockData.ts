import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

// Static data arrays for consistent and realistic data generation
export const SKILLS = {
  technical: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Django', 'Flask',
    'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Redis', 'Elasticsearch', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Jenkins', 'GitLab CI', 'Terraform', 'Ansible', 'Linux', 'Git', 'GraphQL', 'REST APIs',
    'Microservices', 'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas',
    'NumPy', 'Scikit-learn', 'Tableau', 'Power BI', 'Figma', 'Adobe Creative Suite',
    'Unity', 'Unreal Engine', 'Blockchain', 'Solidity', 'Ethereum', 'Smart Contracts'
  ],
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Critical Thinking', 'Teamwork',
    'Project Management', 'Time Management', 'Adaptability', 'Creativity', 'Analytical Thinking',
    'Negotiation', 'Public Speaking', 'Mentoring', 'Strategic Planning', 'Decision Making',
    'Conflict Resolution', 'Emotional Intelligence', 'Customer Service', 'Sales',
    'Marketing', 'Business Development', 'Financial Analysis', 'Risk Management'
  ],
  languages: [
    'English', 'Arabic', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean',
    'Portuguese', 'Italian', 'Russian', 'Hindi', 'Urdu', 'Turkish', 'Dutch', 'Swedish'
  ]
};

export const JOB_TITLES = {
  technology: [
    'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer', 'Principal Software Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
    'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect', 'Solutions Architect',
    'Data Scientist', 'Data Engineer', 'Machine Learning Engineer', 'AI Research Scientist',
    'Product Manager', 'Technical Product Manager', 'Engineering Manager', 'CTO',
    'QA Engineer', 'Test Automation Engineer', 'Security Engineer', 'Cybersecurity Analyst',
    'UI/UX Designer', 'Product Designer', 'System Administrator', 'Database Administrator'
  ],
  marketing: [
    'Marketing Manager', 'Digital Marketing Specialist', 'Content Marketing Manager',
    'Social Media Manager', 'SEO Specialist', 'PPC Specialist', 'Brand Manager',
    'Marketing Analyst', 'Growth Marketing Manager', 'Email Marketing Specialist',
    'Marketing Director', 'CMO', 'Public Relations Manager', 'Event Marketing Manager'
  ],
  sales: [
    'Sales Representative', 'Account Executive', 'Sales Manager', 'Business Development Manager',
    'Inside Sales Representative', 'Outside Sales Representative', 'Sales Director',
    'VP of Sales', 'Customer Success Manager', 'Account Manager', 'Sales Engineer',
    'Regional Sales Manager', 'Enterprise Sales Manager', 'Channel Partner Manager'
  ],
  finance: [
    'Financial Analyst', 'Senior Financial Analyst', 'Finance Manager', 'Controller',
    'CFO', 'Accountant', 'Senior Accountant', 'Tax Specialist', 'Audit Manager',
    'Investment Analyst', 'Risk Analyst', 'Treasury Analyst', 'Budget Analyst',
    'Financial Planning & Analysis Manager', 'Corporate Development Manager'
  ],
  hr: [
    'HR Generalist', 'HR Manager', 'Talent Acquisition Specialist', 'Recruiter',
    'Senior Recruiter', 'HR Business Partner', 'Compensation & Benefits Analyst',
    'Training & Development Manager', 'Employee Relations Specialist', 'HR Director',
    'Chief People Officer', 'Organizational Development Manager', 'HR Analytics Specialist'
  ]
};

export const COMPANIES = [
  // Technology Companies
  { name: 'TechVision Solutions', industry: 'Technology', size: 'Large' },
  { name: 'DataFlow Systems', industry: 'Technology', size: 'Medium' },
  { name: 'CloudNine Technologies', industry: 'Technology', size: 'Large' },
  { name: 'InnovateLab', industry: 'Technology', size: 'Small' },
  { name: 'QuantumSoft', industry: 'Technology', size: 'Medium' },
  { name: 'NextGen Analytics', industry: 'Technology', size: 'Startup' },
  { name: 'CyberShield Security', industry: 'Technology', size: 'Medium' },
  { name: 'AI Dynamics', industry: 'Technology', size: 'Small' },
  
  // Finance Companies
  { name: 'Global Finance Corp', industry: 'Finance', size: 'Enterprise' },
  { name: 'Investment Partners LLC', industry: 'Finance', size: 'Large' },
  { name: 'Capital Growth Advisors', industry: 'Finance', size: 'Medium' },
  { name: 'FinTech Innovations', industry: 'Finance', size: 'Small' },
  { name: 'Wealth Management Solutions', industry: 'Finance', size: 'Medium' },
  
  // Healthcare Companies
  { name: 'MedCare Systems', industry: 'Healthcare', size: 'Large' },
  { name: 'HealthTech Solutions', industry: 'Healthcare', size: 'Medium' },
  { name: 'BioResearch Labs', industry: 'Healthcare', size: 'Small' },
  { name: 'Digital Health Platform', industry: 'Healthcare', size: 'Startup' },
  
  // Other Industries
  { name: 'EduLearn Academy', industry: 'Education', size: 'Medium' },
  { name: 'RetailMax Group', industry: 'Retail', size: 'Large' },
  { name: 'GreenEnergy Solutions', industry: 'Energy', size: 'Medium' },
  { name: 'ConstructPro Inc', industry: 'Construction', size: 'Large' },
  { name: 'MediaWorks Studio', industry: 'Media', size: 'Small' },
  { name: 'HospitalityPlus', industry: 'Hospitality', size: 'Medium' },
  { name: 'TransLogistics', industry: 'Transportation', size: 'Large' }
];

export const UNIVERSITIES = [
  'Qatar University', 'Carnegie Mellon University in Qatar', 'Georgetown University in Qatar',
  'Northwestern University in Qatar', 'Texas A&M University at Qatar', 'Virginia Commonwealth University in Qatar',
  'Weill Cornell Medicine-Qatar', 'HEC Paris in Qatar', 'University College London Qatar',
  'Stanford University', 'MIT', 'Harvard University', 'University of California Berkeley',
  'University of Oxford', 'University of Cambridge', 'Imperial College London',
  'ETH Zurich', 'National University of Singapore', 'University of Toronto',
  'Australian National University', 'University of Melbourne', 'King Abdulaziz University',
  'American University of Beirut', 'Cairo University', 'University of Jordan'
];

export const CITIES = {
  qatar: [
    { name: 'Doha', coordinates: [51.5310, 25.2854] },
    { name: 'Al Rayyan', coordinates: [51.4240, 25.2919] },
    { name: 'Al Wakrah', coordinates: [51.6067, 25.1654] },
    { name: 'Lusail', coordinates: [51.5264, 25.3547] },
    { name: 'Al Khor', coordinates: [51.4969, 25.6851] }
  ],
  international: [
    { name: 'Dubai', country: 'UAE', coordinates: [55.2708, 25.2048] },
    { name: 'Riyadh', country: 'Saudi Arabia', coordinates: [46.6753, 24.7136] },
    { name: 'Kuwait City', country: 'Kuwait', coordinates: [47.9774, 29.3759] },
    { name: 'Manama', country: 'Bahrain', coordinates: [50.5577, 26.0667] },
    { name: 'London', country: 'UK', coordinates: [-0.1276, 51.5074] },
    { name: 'New York', country: 'USA', coordinates: [-74.0060, 40.7128] },
    { name: 'Singapore', country: 'Singapore', coordinates: [103.8198, 1.3521] },
    { name: 'Toronto', country: 'Canada', coordinates: [-79.3832, 43.6532] }
  ]
};

export const BENEFITS = [
  { category: 'Health', benefit: 'Medical Insurance', description: 'Comprehensive health coverage' },
  { category: 'Health', benefit: 'Dental Insurance', description: 'Full dental care coverage' },
  { category: 'Health', benefit: 'Vision Insurance', description: 'Eye care and glasses coverage' },
  { category: 'Retirement', benefit: '401(k) Plan', description: 'Company-matched retirement savings' },
  { category: 'Retirement', benefit: 'Pension Plan', description: 'Defined benefit retirement plan' },
  { category: 'Time Off', benefit: 'Paid Time Off', description: '25+ days annual leave' },
  { category: 'Time Off', benefit: 'Sick Leave', description: 'Paid sick days' },
  { category: 'Time Off', benefit: 'Parental Leave', description: 'Extended maternity/paternity leave' },
  { category: 'Professional Development', benefit: 'Training Budget', description: 'Annual learning and development allowance' },
  { category: 'Professional Development', benefit: 'Conference Attendance', description: 'Sponsored industry conference participation' },
  { category: 'Wellness', benefit: 'Gym Membership', description: 'Fitness center membership' },
  { category: 'Wellness', benefit: 'Mental Health Support', description: 'Counseling and wellness programs' },
  { category: 'Financial', benefit: 'Stock Options', description: 'Equity participation in company growth' },
  { category: 'Financial', benefit: 'Bonus Program', description: 'Performance-based annual bonus' },
  { category: 'Perks', benefit: 'Flexible Working Hours', description: 'Flexible start and end times' },
  { category: 'Perks', benefit: 'Remote Work Options', description: 'Work from home flexibility' },
  { category: 'Perks', benefit: 'Free Meals', description: 'Complimentary lunch and snacks' },
  { category: 'Perks', benefit: 'Transportation Allowance', description: 'Commute assistance' }
];

// Utility functions for generating realistic data
export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const generatePhoneNumber = (): string => {
  const countryCode = faker.helpers.arrayElement(['+974', '+971', '+966', '+965', '+973']);
  const number = faker.string.numeric(8);
  return `${countryCode} ${number}`;
};

export const generateSalaryRange = (experienceLevel: string, currency = 'QAR') => {
  const baseSalaries: { [key: string]: { min: number; max: number } } = {
    'Entry Level': { min: 8000, max: 15000 },
    'Junior': { min: 12000, max: 22000 },
    'Mid-Level': { min: 18000, max: 35000 },
    'Senior': { min: 28000, max: 50000 },
    'Lead': { min: 40000, max: 70000 },
    'Executive': { min: 60000, max: 120000 }
  };
  
  const range = baseSalaries[experienceLevel] || baseSalaries['Mid-Level'];
  const variation = 0.2; // 20% variation
  
  const min = Math.round(range.min * (1 + (Math.random() - 0.5) * variation));
  const max = Math.round(range.max * (1 + (Math.random() - 0.5) * variation));
  
  return { min, max, currency };
};

export const generateCoordinates = (city?: string): [number, number] => {
  if (city) {
    const qatarCity = CITIES.qatar.find(c => c.name === city);
    if (qatarCity) return qatarCity.coordinates as [number, number];
    
    const intlCity = CITIES.international.find(c => c.name === city);
    if (intlCity) return intlCity.coordinates as [number, number];
  }
  
  // Default to Doha area with some variation
  const baseCoords = CITIES.qatar[0].coordinates;
  return [
    baseCoords[0] + (Math.random() - 0.5) * 0.1,
    baseCoords[1] + (Math.random() - 0.5) * 0.1
  ];
};
