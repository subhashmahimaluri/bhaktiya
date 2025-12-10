import {
  addMinutes,
  differenceInMinutes,
  eachMinuteOfInterval,
  format,
  interval,
  parse,
} from 'date-fns';

const fetchTime = (s: number, e: number, time_slots: Date[]): string => {
  const start = format(time_slots[s], 'hh:mm a');
  const end = format(time_slots[e], 'hh:mm a');

  return `${start} - ${end}`;
};

export const pradoshaTime = (sunset: string, nextSunrise: string): string => {
  try {
    // Validate input strings
    if (!sunset || !nextSunrise) {
      return 'N/A';
    }

    const startTime = parse(sunset, 'h:mm a', new Date());
    const endTime = parse(nextSunrise, 'h:mm a', new Date());

    // Check if parsing was successful
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return 'N/A';
    }

    // Handle case where end time is next day
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const dayInterval = interval(startTime, endTime);
    const totalMinutes = differenceInMinutes(endTime, startTime);

    // Validate totalMinutes
    if (totalMinutes <= 0 || !isFinite(totalMinutes)) {
      return 'N/A';
    }

    const stepMinutes = Math.floor(totalMinutes / 5);

    // Ensure stepMinutes is valid
    if (stepMinutes <= 0 || !isFinite(stepMinutes)) {
      return 'N/A';
    }

    const time_slots = eachMinuteOfInterval(dayInterval, { step: stepMinutes });

    // Validate time_slots array
    if (!time_slots || time_slots.length < 2) {
      return 'N/A';
    }

    return fetchTime(0, 1, time_slots);
  } catch (error) {
    console.error('Error in pradoshaTime:', error);
    return 'N/A';
  }
};

export const getRahuKalam = (
  sunrise: string,
  sunset: string,
  weekDay: string,
  timeZone?: string
): { rahu: string; gulika: string; yamaganda: string } => {
  try {
    // Validate input strings
    if (!sunrise || !sunset || !weekDay) {
      return { rahu: 'N/A', gulika: 'N/A', yamaganda: 'N/A' };
    }

    const startTime = parse(sunrise, 'h:mm a', new Date());
    const endTime = parse(sunset, 'h:mm a', new Date());

    // Check if parsing was successful
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { rahu: 'N/A', gulika: 'N/A', yamaganda: 'N/A' };
    }

    const dayInterval = interval(startTime, endTime);
    const totalMinutes = differenceInMinutes(endTime, startTime);

    // Validate totalMinutes
    if (totalMinutes <= 0 || !isFinite(totalMinutes)) {
      return { rahu: 'N/A', gulika: 'N/A', yamaganda: 'N/A' };
    }

    const stepMinutes = Math.floor(totalMinutes / 8);

    // Ensure stepMinutes is valid
    if (stepMinutes <= 0 || !isFinite(stepMinutes)) {
      return { rahu: 'N/A', gulika: 'N/A', yamaganda: 'N/A' };
    }

    const time_slots = eachMinuteOfInterval(dayInterval, { step: stepMinutes });

    let startR: number;
    let endR: number;
    let startG: number;
    let endG: number;
    let starty: number;
    let endY: number;

    switch (weekDay) {
      case 'Monday':
        startR = 1;
        endR = 2;
        startG = 5;
        endG = 6;
        starty = 3;
        endY = 4;
        break;
      case 'Saturday':
        startR = 2;
        endR = 3;
        startG = 0;
        endG = 1;
        starty = 5;
        endY = 6;
        break;
      case 'Friday':
        startR = 3;
        endR = 4;
        startG = 1;
        endG = 2;
        starty = 6;
        endY = 7;
        break;
      case 'Wednesday':
        startR = 4;
        endR = 5;
        startG = 3;
        endG = 4;
        starty = 1;
        endY = 2;
        break;
      case 'Thursday':
        startR = 5;
        endR = 6;
        startG = 2;
        endG = 3;
        starty = 0;
        endY = 1;
        break;
      case 'Tuesday':
        startR = 6;
        endR = 7;
        startG = 4;
        endG = 5;
        starty = 2;
        endY = 3;
        break;
      case 'Sunday':
        startR = 7;
        endR = 8;
        startG = 6;
        endG = 7;
        starty = 4;
        endY = 5;
        break;
      default:
        startR = 1;
        endR = 2;
        startG = 5;
        endG = 6;
        starty = 3;
        endY = 4;
    }

    // Validate time_slots array
    if (!time_slots || time_slots.length === 0) {
      return { rahu: 'N/A', gulika: 'N/A', yamaganda: 'N/A' };
    }

    const rahuKalam = fetchTime(startR, endR, time_slots);
    const gulika = fetchTime(startG, endG, time_slots);
    const yamaganda = fetchTime(starty, endY, time_slots);

    return { rahu: rahuKalam, gulika: gulika, yamaganda: yamaganda };
  } catch (error) {
    console.error('Error in getRahuKalam:', error);
    return { rahu: 'N/A', gulika: 'N/A', yamaganda: 'N/A' };
  }
};

export const abhijitMuhurth = (sunrise: string, sunset: string): string => {
  try {
    // Validate input strings
    if (!sunrise || !sunset) {
      return 'N/A';
    }

    const startTime = parse(sunrise, 'h:mm a', new Date());
    const endTime = parse(sunset, 'h:mm a', new Date());

    // Check if parsing was successful
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return 'N/A';
    }

    const dayInterval = interval(startTime, endTime);
    const totalMinutes = differenceInMinutes(endTime, startTime);

    // Validate totalMinutes
    if (totalMinutes <= 0 || !isFinite(totalMinutes)) {
      return 'N/A';
    }

    const stepMinutes = Math.floor(totalMinutes / 15);

    // Ensure stepMinutes is valid
    if (stepMinutes <= 0 || !isFinite(stepMinutes)) {
      return 'N/A';
    }

    const time_slots = eachMinuteOfInterval(dayInterval, { step: stepMinutes });

    // Validate time_slots array
    if (!time_slots || time_slots.length < 9) {
      return 'N/A';
    }

    const abhijit_muhurth = fetchTime(7, 8, time_slots);

    return abhijit_muhurth;
  } catch (error) {
    console.error('Error in abhijitMuhurth:', error);
    return 'N/A';
  }
};

export const brahmaMuhurtham = (sunrise: string, timeZone?: string): string => {
  try {
    // Validate input string
    if (!sunrise) {
      return 'N/A';
    }

    const sunriseTime = parse(sunrise, 'h:mm a', new Date());

    // Check if parsing was successful
    if (isNaN(sunriseTime.getTime())) {
      return 'N/A';
    }

    const from = addMinutes(sunriseTime, -96);
    const brahma_muhurat_from = format(from, 'hh:mm a');
    const to = addMinutes(from, 48);
    const brahma_muhurat_to = format(to, 'hh:mm a');
    const brahma_muhurat = `${brahma_muhurat_from} - ${brahma_muhurat_to}`;
    return brahma_muhurat;
  } catch (error) {
    console.error('Error in brahmaMuhurtham:', error);
    return 'N/A';
  }
};

export const durMuhurtham = (sunrise: string, sunset: string, week: string): string => {
  try {
    // Validate input strings
    if (!sunrise || !sunset || !week) {
      return 'N/A';
    }

    const startTime = parse(sunrise, 'h:mm a', new Date());
    const endTime = parse(sunset, 'h:mm a', new Date());

    // Check if parsing was successful
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return 'N/A';
    }

    const dayInterval = interval(startTime, endTime);
    const totalMinutes = differenceInMinutes(endTime, startTime);

    // Validate totalMinutes
    if (totalMinutes <= 0 || !isFinite(totalMinutes)) {
      return 'N/A';
    }

    const stepMinutes = Math.floor(totalMinutes / 15);

    // Ensure stepMinutes is valid
    if (stepMinutes <= 0 || !isFinite(stepMinutes)) {
      return 'N/A';
    }

    const time_slots = eachMinuteOfInterval(dayInterval, { step: stepMinutes });

    // Validate time_slots array
    if (!time_slots || time_slots.length === 0) {
      return 'N/A';
    }

    let dur_muhurth: string;

    switch (week) {
      case 'Monday':
        dur_muhurth = fetchTime(8, 9, time_slots);
        dur_muhurth += ', ' + fetchTime(11, 12, time_slots);
        break;
      case 'Saturday':
        dur_muhurth = fetchTime(2, 3, time_slots);
        break;
      case 'Friday':
        dur_muhurth = fetchTime(3, 4, time_slots);
        dur_muhurth += ', ' + fetchTime(8, 9, time_slots);
        break;
      case 'Wednesday':
        dur_muhurth = fetchTime(7, 8, time_slots);
        break;
      case 'Thursday':
        dur_muhurth = fetchTime(5, 6, time_slots);
        dur_muhurth += ', ' + fetchTime(11, 12, time_slots);
        break;
      case 'Tuesday':
        dur_muhurth = fetchTime(3, 4, time_slots);
        dur_muhurth += ', ' + fetchTime(6, 7, time_slots);
        break;
      case 'Sunday':
        dur_muhurth = fetchTime(13, 14, time_slots);
        break;
      default:
        dur_muhurth = fetchTime(5, 6, time_slots);
    }

    return dur_muhurth;
  } catch (error) {
    console.error('Error in durMuhurtham:', error);
    return 'N/A';
  }
};

export const varjyam = (start: string, end: string, nk: string): string => {
  try {
    // Validate input strings
    if (!start || !end || !nk) {
      return 'N/A';
    }

    const startTime = parse(start, 'MMM dd h:mm a', new Date());
    const endTime = parse(end, 'MMM dd h:mm a', new Date());

    // Check if parsing was successful
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return 'N/A';
    }

    // Handle case where end time is next day
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const dayInterval = interval(startTime, endTime);
    const totalMinutes = differenceInMinutes(endTime, startTime);

    // Validate totalMinutes
    if (totalMinutes <= 0 || !isFinite(totalMinutes)) {
      return 'N/A';
    }

    const stepMinutes = Math.floor(totalMinutes / 30);

    // Ensure stepMinutes is valid
    if (stepMinutes <= 0 || !isFinite(stepMinutes)) {
      return 'N/A';
    }

    const time_slots = eachMinuteOfInterval(dayInterval, { step: stepMinutes });

    // Validate time_slots array
    if (!time_slots || time_slots.length === 0) {
      return 'N/A';
    }

    let varjyam_rime: string;

    switch (nk) {
      case 'makha':
        varjyam_rime = fetchTime(8, 9, time_slots);
        break;
      default:
        varjyam_rime = fetchTime(5, 6, time_slots);
    }

    return varjyam_rime;
  } catch (error) {
    console.error('Error in varjyam:', error);
    return 'N/A';
  }
};
