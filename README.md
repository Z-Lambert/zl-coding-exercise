# sennen-coding-exercise

Using https://sunrise-sunset.org/api, fetch the sunrise / sunset times
● Generate a list of 100 random lat / long points around the world
● Fetch sunrise/sunset times for all points, but never run more than 5 in parallel
● Find earliest sunrise and list the day length for this time

Possible extensions / re-use in the future
● Adapting to another API - code needs to be modular and reusable for various contexts
● Variable numbers of lat/lng points (other than 100) - function for generating points needs to take parameter for number of points
● Variable numbers of concurrent requests - request handler needs to take parameter for number of concurrent requests
● Variable request types (different data / format from the API) - URL building function needs to be capable of handling the various optional parameters

To install dependencies:
npm install

Possible optional parameters for the API string:
{
date: string,
callback: string,
formatted: string - can be '0' for unformatted or '1' for formatted
}

Starting script:
npm run dev
