const rideComparison = require('./controllers/ridecomparisonController')

const express = require("express")
const app = express();
const port = 8080;

app.get('/', (req, res) => {
    const pickup = req.query.pickup;
    const dropoff = req.query.dropoff;
    const numPeople = req.query.numpeople;

    // Check all arguments have been provided
    if (typeof(pickup) == 'undefined' || typeof(dropoff) == 'undefined' || typeof(numPeople) == 'undefined') {
        res.status(400).json({error: "Incorrectly formed request, missing parameters."});
        return;
    }

    // Validate supplied arguments before calling supplier APIs
    if (!rideComparison.isValidCoordArg(pickup) || !rideComparison.isValidCoordArg(dropoff)) {
        res.status(400).json({error: "Invalid coordinates supplied for pickup or dropoff please check them."});
        return;
    }

    if (!rideComparison.isValidNumPeopleArg(numPeople)) {
        res.status(400).json({error: "Invalid number of passengers, must be between 1 and 16."})
        return;
    }

    rideComparison.checkProviders(pickup, dropoff, numPeople)
        .then(response => res.status(200).json(response))
        .catch(err => res.status(500).json({error: err.message}))
});

app.listen(port);

module.exports = app; // for testing