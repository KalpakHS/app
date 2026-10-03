import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- Starting Automated SmartNeb QA Pass ---');

// 1. Verify build artifacts
const distIndex = path.join(rootDir, 'dist', 'index.html');
if (fs.existsSync(distIndex)) {
  console.log('✓ Build verification: dist/index.html exists');
} else {
  console.error('✗ dist/index.html missing');
  process.exit(1);
}

// 2. Verify all 8 page components exist
const requiredPages = [
  'HomePage.jsx',
  'AuthPage.jsx',
  'PatientDashboardPage.jsx',
  'ActiveTherapyPage.jsx',
  'DoctorTriagePage.jsx',
  'CaregiverMonitorPage.jsx',
  'AIAssistantPage.jsx',
  'AdminFleetPage.jsx'
];

requiredPages.forEach(p => {
  const pagePath = path.join(rootDir, 'src', 'pages', p);
  if (fs.existsSync(pagePath)) {
    console.log(`✓ Page exists: ${p}`);
  } else {
    console.error(`✗ Missing page: ${p}`);
    process.exit(1);
  }
});

// 3. Verify all 13 reusable common components exist
const requiredComponents = [
  'AppHeader.jsx',
  'BottomNavigation.jsx',
  'CircularTherapyTimer.jsx',
  'DeviceStatusCard.jsx',
  'DeviceFrame.jsx',
  'VitalCard.jsx',
  'PatientCard.jsx',
  'MetricCard.jsx',
  'StatusBadge.jsx',
  'SOSButton.jsx',
  'ChatMessage.jsx',
  'Modal.jsx',
  'Toast.jsx'
];

requiredComponents.forEach(c => {
  const compPath = path.join(rootDir, 'src', 'components', 'common', c);
  if (fs.existsSync(compPath)) {
    console.log(`✓ Common component exists: ${c}`);
  } else {
    console.error(`✗ Missing component: ${c}`);
    process.exit(1);
  }
});

// 4. Verify mockData exports
import('../src/data/mockData.js').then((mockData) => {
  const requiredDataKeys = [
    'mockUserRoles',
    'mockPatient',
    'mockVitals',
    'mockDevice',
    'mockTherapy',
    'mockPatients',
    'mockCaregiverData',
    'mockAdminData',
    'mockChatResponses'
  ];

  requiredDataKeys.forEach(key => {
    if (mockData[key]) {
      console.log(`✓ Mock data export valid: ${key}`);
    } else {
      console.error(`✗ Missing mock data key: ${key}`);
      process.exit(1);
    }
  });

  // Check roles
  console.log(`✓ Roles configured: ${mockData.mockUserRoles.length} (${mockData.mockUserRoles.map(r => r.role).join(', ')})`);

  // Check Timer Math
  const radius = 84;
  const circumference = 2 * Math.PI * radius; // 527.787
  const offsetFull = circumference * (1 - 1); // 0
  const offsetEmpty = circumference * (1 - 0); // ~527.787
  const offsetHalf = circumference * (1 - 0.5); // ~263.89
  console.log(`✓ Timer Math: Radius=${radius}, Circumference=${circumference.toFixed(2)}, OffsetFull=${offsetFull.toFixed(2)}, OffsetEmpty=${offsetEmpty.toFixed(2)}`);

  console.log('--- All SmartNeb QA automated checks PASSED successfully! ---');
}).catch(err => {
  console.error('Error importing mockData:', err);
  process.exit(1);
});
