import { AxiosInstanceClass } from './axios';

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

function getTime(...filter: any[]): Promise<Response> | undefined {
  const url = process.env.SUNSET_URL + filter.filter((x) => x).join('&');

  try {
    const res: Promise<Response> = AxiosInstanceClass.getInstance().request({
      url: url,
      method: 'get',
    });

    return res;
  } catch (err) {
    console.error(err);
  }
}

export function generateRandomPoints(n: number): Points[] {
  const listOfTimes = [...Array(n)].map((_, i) => {
    const points = {
      lat: 'lat=' + (Math.random() * 181 - 90).toFixed(7),
      lng: 'lng=' + (Math.random() * 361 - 160).toFixed(7),
    };
    return points;
  });
  return listOfTimes;
}

export function returnEarliestSunrise(response: Results[]): Results {
  return response.reduce((acc: Results | number, curr) => {
    if (acc == 0) {
      return curr;
    }
    const currDate = convertTime12hto24h(curr.sunrise);
    const accDate = convertTime12hto24h((acc as Results).sunrise);
    if (currDate < accDate) {
      return curr as Results;
    } else {
      return acc as Results;
    }
  }, response[0]);
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

export async function fetchAllTimes(random_list: Points[]) {
  const response: Results[] = new Array();
  // Fetch sunrise/sunset times for all points, but never run more than 5 in parallel
  while (random_list.length > 0) {
    // make 5 requests, iterating through the aray randomList using it to build the parameters for getTimes
    const req1 = random_list[0]
      ? getTime(random_list[0].lat, random_list[0].lng)
      : null;
    const req2 = random_list[1]
      ? getTime(random_list[1].lat, random_list[1].lng)
      : null;
    const req3 = random_list[2]
      ? getTime(random_list[2].lat, random_list[2].lng)
      : null;
    const req4 = random_list[3]
      ? getTime(random_list[3].lat, random_list[3].lng)
      : null;
    const req5 = random_list[4]
      ? getTime(random_list[4].lat, random_list[4].lng)
      : null;
    random_list.splice(0, 5);

    //Resolve the promise of the five requests, passed in as an array
    const [res1, res2, res3, res4, res5] = await Promise.all([
      req1,
      req2,
      req3,
      req4,
      req5,
    ]);
    if (res1) {
      response.push(res1?.data.results);
    }
    if (res2) {
      response.push(res2?.data.results);
    }
    if (res3) {
      response.push(res3?.data.results);
    }
    if (res4) {
      response.push(res4?.data.results);
    }
    if (res5) {
      response.push(res5?.data.results);
    }
  }
  return response;
}
