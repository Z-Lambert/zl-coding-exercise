import {
  fetchAllTimes,
  generateRandomPoints,
  returnEarliestSunrise,
} from './helpers';
require('dotenv').config();

async function getSunriseAndDayLength() {
  // Check that env variableS are valid before running
  if (
    !process.env.REQUEST_NUMBER ||
    !process.env.REQUEST_NUMBER ||
    !process.env.CONCURRENT_REQUESTS
  ) {
    console.error('env REQUEST_NUMBER required');
  } else {
    // Establish the number of random points to generate
    const no_of_reqs = parseInt(process.env.REQUEST_NUMBER);
    // Establish number of concurrent requests to make
    const concurrent_reqs = parseInt(process.env.CONCURRENT_REQUESTS);

    // Generate a list of random lat/long points
    const random_list = generateRandomPoints(no_of_reqs);

    // Set optional parameters for the API string. See README for list of possible parameters
    const optional_parameters = { formatted: '1' };
    // fetch the data for each lat/long with variable concurrent requests and optional parameters on the API string
    const response = await fetchAllTimes(
      random_list,
      concurrent_reqs,
      optional_parameters
    );

    // Find the response with the earliest sunrise
    const earliest_response = returnEarliestSunrise(response);

    // Print earliest sunrise and day length
    earliest_response
      ? (console.log('earliest sunrise: ', earliest_response.sunrise),
        console.log('day length: ', earliest_response.day_length))
      : console.log('Error: null response');
  }
}

getSunriseAndDayLength();
