import axios from 'axios';
import { chunk } from 'lodash';

require('dotenv').config();

interface SunsetApiData {
  data: {
    results: AllTimeData;
    status: number;
  };
}

interface AllTimeData {
  sunrise: string;
  sunset: string;
  solar_moon: string;
  day_length: string;
  civil_twilight_begin: string;
  civil_twilight_end: string;
  nautical_twilight_begin: string;
  nautical_twilight_end: string;
  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;
}

interface OptionalParameters {
  date?: string;
  callback?: string;
  formatted?: string;
}

interface SunsetApiParameters extends OptionalParameters {
  lat: number;
  lng: number;
}

/**
 * This function makes a get request to the sunset API with specified parameters
 * @param filterOptions filter options for API URL
 * @returns Promise of a SunsetApiData JSON
 */
const getTime = (
  parameters: SunsetApiParameters
): Promise<SunsetApiData> | undefined => {
  // Joining parameters onto the end of the API URL
  const url: string = buildUrl(parameters);
  try {
    return axios.get(url);
  } catch (err) {
    console.error(err);
  }
};

const LAT_MIN = 90;
const LAT_MAX = 180;
const LONG_MIN = 180;
const LONG_MAX = 360;
const POINT_DECIMAL_PLACES = 7;
/**
 * This function generates n random longitude and latitude points
 * @param n number of random points to generate
 * @returns array of SunsetApiParameters
 */
export function generateRandomPoints(n: number): SunsetApiParameters[] {
  return [...Array(n)].map(() => {
    return {
      lat: parseFloat(
        (Math.random() * (LAT_MAX + 1) - LAT_MIN).toFixed(POINT_DECIMAL_PLACES)
      ),
      lng: parseFloat(
        (Math.random() * (LONG_MAX + 1) - LONG_MIN).toFixed(
          POINT_DECIMAL_PLACES
        )
      ),
    };
  });
}

/**
 * This function compares the time of each response to find the earliest and returns the response object
 * @param response array of AllTimeData
 * @returns a single AllTimeData object
 */
export function returnEarliestSunrise(
  response: AllTimeData[]
): AllTimeData | null {
  return response.reduce((acc: AllTimeData | null, curr) => {
    if (acc === null) {
      return curr;
    }
    // If the optional parameters specify a formatted time (12h), this needs to be formatted to 24h for comparison
    const curr_sunrise = getFormattedTime(curr.sunrise);
    const acc_sunrise = getFormattedTime(acc.sunrise);
    // Compare and return earliest to accumulator
    if (curr_sunrise < acc_sunrise) {
      return curr;
    } else {
      return acc;
    }
  }, null);
}

/**
 * This function fetches the times for each lat/long in the given array of points, making batch requests of batch_size size.
 * @param points array of points
 * @param batch_size number of requests in each batch, default as 5
 * @returns promise of AllTimeData[] (array of response data)
 */
export const fetchAllTimes = (
  points: SunsetApiParameters[],
  batch_size: number,
  optional_parameters: OptionalParameters
): Promise<AllTimeData[]> => {
  // Convert array of all points into batches based on batch size
  const batches = chunk(points, batch_size);
  // One batch at a time, get the times, reducing into one array of results at the end
  return batches.reduce<Promise<AllTimeData[]>>(
    async (prev_results, batch_points) => {
      // Awaited here because there were issues awaiting in the return
      const awaited_prev_result = await prev_results;
      // Await batch
      const responses = await Promise.all(
        batch_points.map((point) =>
          getTime({ ...point, ...optional_parameters })
        )
      );
      // Add batch to accumulator array, filtering out any that didn't get a response
      return [
        ...awaited_prev_result,
        ...responses.reduce<AllTimeData[]>(
          (prev_responses, response) => [
            ...prev_responses,
            ...(response ? [response.data.results] : []),
          ],
          []
        ),
      ];
    },
    // Initialise with promise of empty array
    Promise.resolve([])
  );
};

/**
 * This function build the URL string for the API call based on the following arguments
 * @param lat latitude float
 * @param lng longitude float
 * @param formatted true : format date | false: non-formatted date
 * @returns URL string
 */
function buildUrl(parameters: SunsetApiParameters): string {
  return (
    process.env.SUNSET_URL +
    'lat=' +
    parameters.lat.toString() +
    '&' +
    'lng=' +
    parameters.lng.toString() +
    (parameters.formatted ? '&' + 'formatted=' + parameters.formatted : '') +
    (parameters.callback ? '&' + 'callback=' + parameters.callback : '') +
    (parameters.date ? '&' + 'date=' + parameters.date : '')
  );
}

/**y
 *
 * This function converts 12h AM PM formated times into 24h format
 * @param time12h in format HH:MM:SS AM/PM
 * @returns HH:MM:SS
 */
const convertTime12hto24h = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes, seconds] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * This function formats 12h time into 24h time so it can be compared
 * @param time time to be checked
 * @returns time either the same or reformatted
 */
const getFormattedTime = (time: string) => {
  if (time.slice(-2) == 'AM' || time.slice(-2) == 'PM') {
    return convertTime12hto24h(time);
  } else {
    return time;
  }
};
