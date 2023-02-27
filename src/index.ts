import {
  fetchAllTimes,
  generateRandomPoints,
  returnEarliestSunrise,
} from './services';
require('dotenv').config();

getSunriseAndDayLength();

async function getSunriseAndDayLength() {
  // Generate a list of 100 random lat/long points around the world
  const no_of_reqs = parseInt(process.env.REQUEST_NUMBER!);
  const random_list = generateRandomPoints(no_of_reqs);
  // fetch the data for each lat/long, five at a time
  const response = await fetchAllTimes(random_list);
  // Find the response with the earliest sunrise
  const earliest_day_length = returnEarliestSunrise(response);
  console.log('earliest sunrise : ', earliest_day_length.sunrise);
  console.log('day-length: ', earliest_day_length.day_length);
}
