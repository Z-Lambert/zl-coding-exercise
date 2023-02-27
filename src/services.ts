import { AxiosCustomInstance } from './axios';

require('dotenv').config();

interface Response {
  data: {
    results: {
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
    };
    status: number;
  };
}

export function getTimes(...filter: any[]) {
  const url = process.env.SUNSET_URL + filter.filter((x) => x).join('&');
  console.log('filter', filter);
  console.log('url: ', url);
  try {
    const res: Promise<Response> = AxiosCustomInstance.getInstance().request({
      url: url,
      method: 'get',
    });

    return res;
  } catch (err) {
    console.error(err);
  }
}

export function generateRandomPoints(n: number) {
  const listOfTimes = [...Array(n)].map((_, i) => {
    const points = {
      lat: 'lat=' + (Math.random() * 181 - 90).toFixed(7),
      lng: 'lng=' + (Math.random() * 361 - 160).toFixed(7),
    };
    return points;
  });
  return listOfTimes;
}
