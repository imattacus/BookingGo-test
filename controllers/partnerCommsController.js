const rp = require("request-promise")

const baseUrl = "https://techtest.rideways.com"
const PROVIDER_PATHS = {
    "Dave" : "/dave",
    "Eric" : "/eric",
    "Jeff" : "/jeff"
}

const TIMEOUT = 2000

// Get the rides from a speciied provider, returns a promise that on completion will return a object containing the ride options and prices 
function getRidesFromProvider(start, end, provider) {

    return new Promise((resolve, reject) => {
        if (!(Object.keys(PROVIDER_PATHS).includes(provider))) reject(new Error("Invalid provider " + provider));
        const path = baseUrl + PROVIDER_PATHS[provider]; 

        // Start the timeout timer
        setTimeout(() => {
            reject(new Error(provider + ' timeout'))
        }, TIMEOUT);
        // Make the request
        rp.get(path, {
            qs: {
                pickup: start,
                dropoff: end
            },
            json: true
        })
        .then(response => resolve(response))
        .catch(err => {
            reject(new Error("Error " + err.error.status + " getting rides from " + err.error.path + ":\n\t" + err.error.error + "\n\t" + err.error.message))
        });
    });
}

function getRidesFromAllProviders(start, end) {
    var requestPromises = [];
    for (var provider in PROVIDER_PATHS) {
        requestPromises.push(
            getRidesFromProvider(start, end, provider)
            .catch(err => {return err}) // Promise.all stops execution of all promises if any promise is rejected, so catch error here and resolve the promise
        )
    }
    return Promise.all(requestPromises);
}

module.exports = {getRidesFromProvider, getRidesFromAllProviders}