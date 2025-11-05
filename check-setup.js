const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'app/api/github/route.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'app/profile/[username]/layout.tsx',
  'app/profile/[username]/page.tsx',
  'types/github.ts',
  'lib/github.ts',
  'lib/analytics.ts',
  'components/ThemeToggle.tsx',
  '.env.local'
];

console.log('🔍 Checking file structure...\n');

let allGood = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (exists) {
    console.log('✅', file);
  } else {
    console.log('❌', file, '(MISSING)');
    allGood = false;
  }
});

if (allGood) {
  console.log('\n✅ All required files are present!');
} else {
  console.log('\n❌ Some files are missing. Please create them.');
}

// Check if .env.local has GITHUB_PAT
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  if (envContent.includes('GITHUB_PAT=ghp_')) {
    console.log('✅ GitHub PAT is configured');
  } else {
    console.log('⚠️  GitHub PAT not found in .env.local (optional but recommended)');
  }
}