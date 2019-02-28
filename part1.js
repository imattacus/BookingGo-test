const rideComparison = require("./controllers/ridecomparisonController")

// "pickup": "51.470020,-0.454295",
//       "dropoff": "51.00000,1.0000"

const args = process.argv;

if (args.length != 4) {
    console.error("Correct usage is: " + args[0] + " " + args[1] + " <pickup> <dropoff>")
    return;
}

const pickup = args[2]
const dropoff = args[3]

if (!rideComparison.isValidCoordArg(pickup) || !rideComparison.isValidCoordArg(dropoff)) {
    console.log("Invalid coordinates supplied please check them.")
    process.exit()
}

rideComparison.checkSingleProvider(pickup, dropoff, "Dave")
    .then(rides => {
        for (var i=0; i<rides.length; i++) {
            console.log(rides[i].car_type + " - " + rides[i].price);
        }
    })
    .catch(err => {
        console.log(err.message)
    })


