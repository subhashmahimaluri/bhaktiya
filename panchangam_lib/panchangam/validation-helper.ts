// Quick validation script for Surya Siddhanta implementation
// Run this in the browser console to test basic functionality

import { YexaaPanchang_SuryaSiddhantam } from './YexaaPanchang_SuryaSiddhantam';
import { YexaaLocalConstant } from './yexaaLocalConstant';

// Test basic functionality
export function validateSuryaSiddhanta() {

  try {
    // Initialize
    const yexaaConstant = new YexaaLocalConstant();
    const suryaSiddhanta = new YexaaPanchang_SuryaSiddhantam(yexaaConstant);

    // Test date
    const testDate = new Date('2025-10-02');
    const lat = 12.97; // Bangalore
    const lng = 77.59;


    // Performance test
    const startTime = performance.now();

    const result = suryaSiddhanta.computePanchang({
      date: testDate,
      lat,
      lon: lng,
      tz: 'Asia/Kolkata',
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Validation



    // Basic validation checks
    const validations = [
      { test: result.tithi.number >= 0 && result.tithi.number < 30, name: 'Tithi range' },
      {
        test: result.nakshatra.number >= 0 && result.nakshatra.number < 27,
        name: 'Nakshatra range',
      },
      { test: result.yoga.number >= 0 && result.yoga.number < 27, name: 'Yoga range' },
      { test: result.karana.number >= 0 && result.karana.number < 11, name: 'Karana range' },
      {
        test: result.sun.longitude >= 0 && result.sun.longitude < 360,
        name: 'Sun longitude range',
      },
      {
        test: result.moon.longitude >= 0 && result.moon.longitude < 360,
        name: 'Moon longitude range',
      },
      { test: result.ayanamsa > 20 && result.ayanamsa < 30, name: 'Ayanamsa reasonable value' },
      { test: executionTime < 250, name: 'Performance requirement' },
    ];


    const allPassed = validations.every(v => v.test);

    return {
      success: allPassed,
      executionTime,
      result,
      validations,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test URL access
export function testRouteAccess() {

  const testUrls = [
    '/panchangam-surya-siddhantam',
    '/panchangam-surya-siddhantam?date=2025-10-02',
    '/panchangam-surya-siddhantam?date=2025-10-02&lat=12.97&lon=77.59&tz=Asia/Kolkata',
  ];

  testUrls.forEach((url, index) => {
  });

}

