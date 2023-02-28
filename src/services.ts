import { AxiosInstanceClass } from './axios';
import { chunk } from 'lodash';

require('dotenv').config();

interface Points {
  lat: string;
  lng: string;
}

interface Response {
  data: {
    results: Results;
    status: number;
  };
}

interface Results {
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

function getTime(...filterOptions: string[]): Promise<Response> | undefined {
  if (!process.env.SUNSET_URL) {
    console.error('env SUNSET_URL required');
  } else {
    // Joining filter options onto the end of the API URL
    const url =
      process.env.SUNSET_URL + filterOptions.filter((x) => x).join('&');
    try {
      return AxiosInstanceClass.getInstance().request({
        url,
        method: 'get',
      });
    } catch (err) {
      console.error(err);
    }
  }
}

const LAT_MIN = 90;
const LAT_MAX = 180;
const LONG_MIN = 180;
const LONG_MAX = 360;
const POINT_DECIMAL_PLACES = 7;

export function generateRandomPoints(n: number): Points[] {
  return [...Array(n)].map(() => {
    return {
      lat:
        'lat=' +
        (Math.random() * (LAT_MAX + 1) - LAT_MIN).toFixed(POINT_DECIMAL_PLACES),
      lng:
        'lng=' +
        (Math.random() * (LONG_MAX + 1) - LONG_MIN).toFixed(
          POINT_DECIMAL_PLACES
        ),
    };
  });
}

export function returnEarliestSunrise(response: Results[]): Results | null {
  return response.reduce((acc: Results | null, curr) => {
    if (acc === null) {
      return curr;
    }
    const curr_24 = convertTime12hto24h(curr.sunrise);
    const acc_24 = convertTime12hto24h(acc.sunrise);
    if (curr_24 < acc_24) {
      return curr;
    } else {
      return acc;
    }
  }, null);
}

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

export const fetchAllTimes = async (
  points: Points[],
  batch_size = 5
): Promise<Results[]> => {
  // convert array of all points into batches based on batchSize
  const batches = chunk(points, batch_size);
  // One batch at a time, get the times, reducing into one array of results at the end
  return batches.reduce<Promise<Results[]>>(
    async (prev_results, batch_points) => {
      const awaited_prev_result = await prev_results;
      // Get responses in a batch
      const responses = await Promise.all(
        batch_points.map((point) => getTime(point.lat, point.lng))
      );
      // Return all in one array, filtering out any that didn't get a response
      return [
        ...awaited_prev_result,
        // Could log instead of filtering out, or error handle in some way
        ...responses.reduce<Results[]>(
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
