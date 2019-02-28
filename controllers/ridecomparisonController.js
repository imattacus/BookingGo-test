const providers = require("./partnerCommsController");

const CAPACITIES = {
    "STANDARD" : 4,
    "EXECUTIVE" : 4,
    "LUXURY" : 4,
    "PEOPLE_CARRIER" : 6, 
    "LUXURY_PEOPLE_CARRIER" : 6,
    "MINIBUS" : 16
}

function isValidNumPeopleArg(numPeople) {
    const num = parseInt(numPeople);
    return (num >= 1 && num <= 16);
}

function isValidCoordArg(coord) {
    var split = coord.split(',');
    if (split.length != 2) return false;
    var lat = split[0]
    var long = split[1]
    return !(lat.length == 0 || long.length == 0 || isNaN(lat) || isNaN(long) || lat > 90 || lat < -90 || long > 180 || long < -180)
}

// Sort options list by price descending
function sortOptionsList(options) {
    return options.sort((a, b) => {
        return -1*(a.price - b.price);
    })
}

// Filter list of options based on if the car type has enough capacity for the number of passengers
function filterOptionsList(options, numPeople) {
    return options.filter(option => {
        return numPeople <= CAPACITIES[option.car_type]
    })
}

function optionsDictToArray(optionsDict) {
    var optionsArray = [];
    for (var car_type in optionsDict) {
        optionsArray.push({car_type: car_type, supplier: optionsDict[car_type].supplier, price: optionsDict[car_type].price})
    }
    return optionsArray;
}

function updateOptionsDict(optionsDict, supplier_id, supplierOptions) {
    for(var i=0; i<supplierOptions.length; i++) {
        const car_type = supplierOptions[i].car_type;
        const price = supplierOptions[i].price;
        if (!optionsDict[car_type]) {
            optionsDict[car_type] = {supplier: supplier_id, price: price};
        } else if (optionsDict[car_type].price > price) {
            optionsDict[car_type] = {supplier: supplier_id, price: price};
        }
    }
}

function checkSingleProvider(start, end, provider) {
    return providers.getRidesFromProvider(start, end, provider)
        .then(response => {return sortOptionsList(response.options)})
}

// Check all the providers for rides and filters out irrelevant rides based on number of riders (Part 1b)
function checkProviders(start, end, numPeople) {
    return providers.getRidesFromAllProviders(start, end)
        .then(responses => {
            var options = {}
            for (var i=0; i<responses.length; i++) {
                if (responses[i] instanceof Error) {
                    continue;
                }
                const supplier_id = responses[i].supplier_id;
                updateOptionsDict(options, supplier_id, responses[i].options);
            }
            var optionsArray = optionsDictToArray(options);
            if (optionsArray.length == 0) {throw new Error("Sorry, couldn't get any rides from any providers")};
            optionsArray = filterOptionsList(optionsArray, numPeople);
            if (optionsArray.length == 0) {throw new Error("Sorry, couldn't get any rides for that many passengers from any providers")};
            return sortOptionsList(optionsArray);
        })
}

module.exports = {checkSingleProvider, checkProviders, isValidNumPeopleArg, isValidCoordArg, sortOptionsList, filterOptionsList, updateOptionsDict, optionsDictToArray}