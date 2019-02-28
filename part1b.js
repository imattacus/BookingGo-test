const rideComparison = require('./controllers/ridecomparisonController')

const args = process.argv;

if (args.length != 5) {
    console.error("Correct usage is: " + args[0] + " " + args[1] + " <pickup-coord> <dropoff-coord> <numPassengers>")
    return;
}

const pickup = args[2]
const dropoff = args[3]
const numPassengers = args[4]

// Client side validation of supplied arguments before calling supplier APIs
if (!rideComparison.isValidCoordArg(pickup) || !rideComparison.isValidCoordArg(dropoff)) {
    console.log("Invalid coordinates supplied please check them.")
    process.exit()
}

if (!rideComparison.isValidNumPeopleArg(numPassengers)) {
    console.log("Invalid number of passengers, must be between 1 and 16.")
    process.exit()
}

// Check all providers for rides, print out available options or an error message
rideComparison.checkProviders(pickup, dropoff, numPassengers)
    .then(rides => {
        for (var i=0; i<rides.length; i++) {
            console.log(rides[i].car_type + " - " + rides[i].supplier + " - " + rides[i].price);
        }
    })
    .catch(err => {
        console.log(err.message)
    })