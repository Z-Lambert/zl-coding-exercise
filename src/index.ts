import axios from 'axios';
import { generateRandomPoints, getTimes } from './services';
require('dotenv').config();

start();

async function start() {
  // Generate a list of 100 random lat/long points around the world
  const randomList = generateRandomPoints(100);
  const url = process.env.SUNSET_URL + '';

  // Fetch sunrise/sunset times for all points, but never run more than 5 in parallel
  // make 5 requests, iterating through the aray randomList using it to build the parameters for getTimes
  while (randomList.length > 0) {
    const req1 = randomList[0]
      ? getTimes(randomList[0].lat, randomList[0].lng)
      : null;
    const req2 = randomList[1]
      ? getTimes(randomList[1].lat, randomList[1].lng)
      : null;
    const req3 = randomList[2]
      ? getTimes(randomList[2].lat, randomList[2].lng)
      : null;
    const req4 = randomList[3]
      ? getTimes(randomList[3].lat, randomList[3].lng)
      : null;
    const req5 = randomList[4]
      ? getTimes(randomList[4].lat, randomList[4].lng)
      : null;
    randomList.splice(0, 5);

    //Resolve the promise of the five requests, passed in as an array

    const response = await Promise.all([
      axios.get(
        'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400'
      ),
      axios.get(
        'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=today'
      ),
    ]);
    console.log(response);
  }
}
