# BookingGo Techincal Test Submission

## Setup
This was done with node version `11.8.0` and npm `6.5.0`

Clone repository and `npm install`


## Part 1

### Console application to print the search results for Dave's Taxis

`node part1 <pickupcoord> <dropoffcoord>`

### Console application to filter by number of passengers

`node part1b <pickupcoord> <dropoffcoord> <numpassengers>`

## Part 2
Start the express server with:
`node part2`
Make a GET request to '/' with 'pickup', 'dropoff' and 'numpeople' supplied as params, for example:
`http://localhost:8080/?pickup=51.470020,-0.454295&dropoff=51.00000,1.0000&numpeople=4`


## Tests
Can be run with `npm test`
