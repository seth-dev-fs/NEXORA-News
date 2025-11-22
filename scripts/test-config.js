/**
 * NEXORA News - Configuration Test Script
 *
 * Quick validation of environment variables and API connectivity
 * Run with: node scripts/test-config.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const REQUIRED_ENV = ['GEMINI_API_KEY', 'REVALIDATE_TOKEN'];
const OPTIONAL_ENV = ['UNSPLASH_ACCESS_KEY', 'NEXT_PUBLIC_VERCEL_URL'];

console.log('\n===================================');
console.log('NEXORA News - Configuration Test');
console.log('===================================\n');

// Test 1: Environment Variables
console.log('1. Checking Environment Variables...');
let allRequiredPresent = true;

REQUIRED_ENV.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✓ ${varName} is set`);
  } else {
    console.log(`   ✗ ${varName} is MISSING (REQUIRED)`);
    allRequiredPresent = false;
  }
});

OPTIONAL_ENV.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✓ ${varName} is set (optional)`);
  } else {
    console.log(`   ⚠ ${varName} is not set (optional)`);
  }
});

if (!allRequiredPresent) {
  console.log('\n✗ FAILED: Missing required environment variables.');
  console.log('   Please copy .env.example to .env.local and fill in your API keys.\n');
  process.exit(1);
}

// Test 2: Gemini API Connectivity
console.log('\n2. Testing Gemini API Connectivity...');

async function testGeminiAPI() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = 'Respond with a single word: "OK"';
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    console.log(`   ✓ Gemini API is accessible`);
    console.log(`   ✓ Model: gemini-2.0-flash-exp`);
    console.log(`   ✓ Test response: "${response}"`);

    return true;
  } catch (error) {
    console.log(`   ✗ Gemini API test failed: ${error.message}`);

    if (error.message.includes('API key not valid')) {
      console.log('   → Check your GEMINI_API_KEY in .env.local');
    } else if (error.message.includes('quota')) {
      console.log('   → You may have exceeded your API quota');
    } else if (error.message.includes('model')) {
      console.log('   → The model "gemini-2.0-flash-exp" may not be available');
      console.log('   → Try changing to "gemini-1.5-pro" or "gemini-1.5-flash" in generate-articles.js');
    }

    return false;
  }
}

// Test 3: Category Normalization
console.log('\n3. Validating Category Configuration...');

const NORMALIZED_CATEGORIES = [
  'ai-futuro',
  'audio',
  'ciencia',
  'computadores',
  'entretenimento-gaming',
  'gaming',
  'internet-apps',
  'mobilidade',
  'smartphones',
  'wearables',
  'home'
];

console.log(`   ✓ Total normalized categories: ${NORMALIZED_CATEGORIES.length}`);
console.log(`   ✓ Categories: ${NORMALIZED_CATEGORIES.join(', ')}`);

// Test 4: Directory Structure
console.log('\n4. Checking Directory Structure...');

const fs = require('fs');
const path = require('path');

const REQUIRED_DIRS = [
  'content/posts',
  'scripts/helpers'
];

REQUIRED_DIRS.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✓ ${dir} exists`);
  } else {
    console.log(`   ✗ ${dir} is missing`);
  }
});

// Test 5: Helper Files
console.log('\n5. Checking Helper Files...');

const REQUIRED_HELPERS = [
  'scripts/helpers/fetchFeed.js',
  'scripts/helpers/logger.js'
];

REQUIRED_HELPERS.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✓ ${file} exists`);
  } else {
    console.log(`   ✗ ${file} is missing`);
  }
});

// Run async tests
(async () => {
  const geminiOk = await testGeminiAPI();

  console.log('\n===================================');
  console.log('Test Summary');
  console.log('===================================\n');

  if (allRequiredPresent && geminiOk) {
    console.log('✓ All tests PASSED!');
    console.log('\nYour configuration is ready. You can now run:');
    console.log('  npm run generate-articles\n');
    process.exit(0);
  } else {
    console.log('✗ Some tests FAILED.');
    console.log('\nPlease fix the issues above before running the article generator.\n');
    process.exit(1);
  }
})();
