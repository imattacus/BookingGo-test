const partnerComms = require("../controllers/partnerCommsController");
const rideComparison = require("../controllers/ridecomparisonController");

const server = require("../part2");

const assert = require('assert');
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');

chai.use(chaiAsPromised);
chai.use(chaiHttp);

const expect = chai.expect;

describe("Supplier API communications", function() {
    it("Invalid supplier name supplied", function() {
        return expect(partnerComms.getRidesFromProvider("51.470020,-0.454295", "51.00000,1.0000", "Bob")).to.be.rejected;
    });

});

describe("Client side argument validations", function() {
    it("Invalid number of passengers", function() {
        expect(rideComparison.isValidNumPeopleArg('-1')).to.equal(false);
        expect(rideComparison.isValidNumPeopleArg(19)).to.equal(false);
        expect(rideComparison.isValidNumPeopleArg('abc')).to.equal(false);
        expect(rideComparison.isValidNumPeopleArg('')).to.equal(false);
    });

    it("Valid number of passengers", function() {
        expect(rideComparison.isValidNumPeopleArg("1")).to.equal(true);
        expect(rideComparison.isValidNumPeopleArg(16)).to.equal(true);
    })

    it("Invalid coordinates", function() {
        expect(rideComparison.isValidCoordArg("91,181")).to.equal(false);
        expect(rideComparison.isValidCoordArg("-91,-181")).to.equal(false);
        expect(rideComparison.isValidCoordArg("abc")).to.equal(false);
        expect(rideComparison.isValidCoordArg("abc,def")).to.equal(false);
        expect(rideComparison.isValidCoordArg("")).to.equal(false);
        expect(rideComparison.isValidCoordArg(",")).to.equal(false);
    });

    it("Valid coordinates", function() {
        expect(rideComparison.isValidCoordArg("90,180")).to.equal(true);
    });
});

describe("Ride Comparison logic", function() {
    it("Ride options correctly sorted by price", function() {
        expect(rideComparison.sortOptionsList([{price: 1}, {price: 2}, {price: 3}])).to.deep.equal([{price:3}, {price:2}, {price:1}]);
    });

    it("Filter options by number of passengers", function() {
        var testOptions = [
            {car_type: "STANDARD"},
            {car_type: "EXECUTIVE"},
            {car_type: "LUXURY"},
            {car_type: "PEOPLE_CARRIER"},
            {car_type: "LUXURY_PEOPLE_CARRIER"},
            {car_type: "MINIBUS"}
        ]
        expect(rideComparison.filterOptionsList(testOptions, 4).length).to.equal(6);
        expect(rideComparison.filterOptionsList(testOptions, 6).length).to.equal(3);
        expect(rideComparison.filterOptionsList(testOptions, 16).length).to.equal(1);
        expect(rideComparison.filterOptionsList(testOptions, 17).length).to.equal(0);
    });

    it("Only one of each car type is returned", function() {
        var optionsDict = {};
        rideComparison.updateOptionsDict(optionsDict, "Dave", [{car_type: "STANDARD", price: 1}]);
        rideComparison.updateOptionsDict(optionsDict, "Eric", [{car_type: "STANDARD", price: 1}]);
        // assert that only 1 thing is saved in the object
        var optionsArray = rideComparison.optionsDictToArray(optionsDict);
        expect(optionsArray.length).to.equal(1);
    });

    it("Cheapest option for each car type is selected", function() {
        var optionsDict = {};
        rideComparison.updateOptionsDict(optionsDict, "Dave", [{car_type: "STANDARD", price: 5}]);
        rideComparison.updateOptionsDict(optionsDict, "Eric", [{car_type: "STANDARD", price: 3}]);
        rideComparison.updateOptionsDict(optionsDict, "Jeff", [{car_type: "STANDARD", price: 10}]);
        expect(optionsDict['STANDARD'].supplier).to.equal('Eric');
    })
});

describe("Part 2 API server", function() {
    it("Should respond with an error if missing any number of arguments", function() {
        chai.request(server).get('/').end((err, res) => {
            expect(res).to.have.status(400);
        });
        chai.request(server).get('/?numpeople=4').end((err, res) => {
            expect(res).to.have.status(400); 
        });
    });

    it("Should respond with an error if given invalid coordinates", function() {
        // Out of range
        chai.request(server).get("/?pickup=200,0&dropoff=0,0&numpeople=4").end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal("Invalid coordinates supplied for pickup or dropoff please check them.");
        });
        // Missing comma
        chai.request(server).get("/?pickup=2000&dropoff=0,0&numpeople=4").end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal("Invalid coordinates supplied for pickup or dropoff please check them.");
        });
        // Letters instead of numbers
        chai.request(server).get("/?pickup=ab,c&dropoff=0,0&numpeople=4").end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal("Invalid coordinates supplied for pickup or dropoff please check them.");
        });
    });

    it("Should respond with an error if given bad number of passengers", function() {
        // NUmber of passengers is -1
        chai.request(server).get("/?pickup=51.470020,-0.454295&dropoff=51.00000,1.0000&numpeople=-1").end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal("Invalid number of passengers, must be between 1 and 16.");
        });
        // Number of passengers is abc
        chai.request(server).get("/?pickup=51.470020,-0.454295&dropoff=51.00000,1.0000&numpeople=abc").end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error).to.equal("Invalid number of passengers, must be between 1 and 16.");
        });
    })
});