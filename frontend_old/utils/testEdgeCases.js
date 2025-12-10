// Simple edge case testing for timeData functions
// This file can be run with node to test edge cases

const {
  pradoshaTime,
  getRahuKalam,
  abhijitMuhurth,
  brahmaMuhurtham,
  durMuhurtham,
  varjyam,
} = require('./timeData');

function testFunction(funcName, func, ...args) {
  try {
    console.log(`Testing ${funcName} with args:`, args);
    const result = func(...args);
    console.log(`Result: ${result}`);
    return result;
  } catch (error) {
    console.error(`Error in ${funcName}:`, error.message);
    return 'ERROR';
  }
}

console.log('=== Testing Edge Cases ===\n');

// Test pradoshaTime
console.log('\n--- pradoshaTime ---');
testFunction('pradoshaTime with empty strings', pradoshaTime, '', '');
testFunction('pradoshaTime with invalid format', pradoshaTime, 'invalid', '6:00 AM');
testFunction('pradoshaTime with valid times', pradoshaTime, '6:00 PM', '6:00 AM');

// Test getRahuKalam
console.log('\n--- getRahuKalam ---');
testFunction('getRahuKalam with empty strings', getRahuKalam, '', '', '');
testFunction('getRahuKalam with invalid format', getRahuKalam, 'invalid', '6:00 AM', 'Monday');
testFunction('getRahuKalam with valid inputs', getRahuKalam, '6:00 AM', '6:00 PM', 'Monday');

// Test abhijitMuhurth
console.log('\n--- abhijitMuhurth ---');
testFunction('abhijitMuhurth with empty strings', abhijitMuhurth, '', '');
testFunction('abhijitMuhurth with invalid format', abhijitMuhurth, 'invalid', '6:00 AM');
testFunction('abhijitMuhurth with valid times', abhijitMuhurth, '6:00 AM', '6:00 PM');

// Test brahmaMuhurtham
console.log('\n--- brahmaMuhurtham ---');
testFunction('brahmaMuhurtham with empty string', brahmaMuhurtham, '');
testFunction('brahmaMuhurtham with invalid format', brahmaMuhurtham, 'invalid');
testFunction('brahmaMuhurtham with valid time', brahmaMuhurtham, '6:00 AM');

// Test durMuhurtham
console.log('\n--- durMuhurtham ---');
testFunction('durMuhurtham with empty strings', durMuhurtham, '', '', '');
testFunction('durMuhurtham with invalid format', durMuhurtham, 'invalid', '6:00 AM', 'Monday');
testFunction('durMuhurtham with valid inputs', durMuhurtham, '6:00 AM', '6:00 PM', 'Monday');

// Test varjyam
console.log('\n--- varjyam ---');
testFunction('varjyam with empty strings', varjyam, '', '', '');
testFunction('varjyam with invalid format', varjyam, 'invalid', 'Oct 31 6:00 AM', 'rohini');
testFunction('varjyam with valid inputs', varjyam, 'Oct 31 6:00 AM', 'Oct 31 6:00 PM', 'rohini');

console.log('\n=== Edge Case Testing Complete ===');
