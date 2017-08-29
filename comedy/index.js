'use strict';
var Alexa = require("alexa-sdk");
var _ = require('lodash');
const https = require('https');
var lsGetOptions = {
    host: 'api.stubsites.com',
    path: '/api/v1/laughstub/events?itemsPerPage=5&orderBy=date,distance&page=1&rad=100',
    port: 443,
    method: 'GET',
    json: true,
}


var appId = 'amzn1.ask.skill.b0c7e9b2-bbe3-45a0-9001-47d80eddb02e'; 

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
   // alexa.dynamoDBTableName = 'comedyUsers';
    alexa.registerHandlers(newSessionHandlers, cityHandler);
    alexa.execute();
};

var newSessionHandlers = {
    'LaunchRequest': function() {
        this.emit(':ask', 'Comedy shows will help you find the best comedy shows near you. Which city would you like me to search in?',
        'Sorry, can you repeat that.')
    },
    'GetEvents': function() {
        this.emit('city')
    },
    'CityIntent':function() {
        this.emit('city');
    },
        "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(":tell", "Goodbye!");
    }
}


var cityHandler = {
    'city': function() {
        //Get the city name
        var city = this.event.request.intent.slots.city.value
        if(city == undefined) {
            this.emit(":ask", "I am sorry, I do not know that city, please try another ")
        }
        var foundcity = _.find(cities, {'city': city});
        if(foundcity == undefined) {
            this.emit(":ask", "I am sorry, I could not find events in " + city + ", please try another ")
        }
        else {
            console.log("Pulling data for " + city);
            //Found the city - load up the results for city
            lsGetOptions.path  += '&lat=' + foundcity.lat + '&long='+ foundcity.lng
            https.get(lsGetOptions,(res) => {
            var body = '';
            res.on('data', (d) => {
                body += d;
            });

            res.on('end', () => {                
                var bodyJson = JSON.parse(body);

                if(bodyJson.data.pagination.total) {
                    var speech = "Here are a few shows near " + city + ". ";
                    var cardTitle = "Here are a few shows near " + city + ". "
                    var cardContent;
                    var imageObj = {};
                    bodyJson.data.events.forEach(function(event) {
                        speech += event.name + ' at ' + event.venue.name + ".\n";
                        cardContent = speech

                        imageObj = {
                            smallImageUrl: event.venue.image.url,
                            largeImageUrl: event.venue.image.url,
                        }
                        
                    });
                    this.emit(":tellWithCard", speech.replace(/&/g, 'and'), cardTitle, cardContent, imageObj)
                }
            });

            }).on('error', (e) => {
            console.error(e);
            });

        }
    }
};

var cities = [
    {
        "city": "Atlanta",
        "lat": "33.748889",
        "lng": "-84.388056"
    },
    {
        "city": "Boston",
        "lat": "42.358333",
        "lng": "-71.060278"
    },
    {
        "city": "Chicago",
        "lat": "41.850000",
        "lng": "-87.650000"
    },
    {
        "city": "Dallas",
        "lat": "32.783333",
        "lng": "-96.800000"
    },
    {
        "city": "Denver",
        "lat": "39.739167",
        "lng": "-104.984167"
    },
    {
        "city": "Detroit",
        "lat": "42.331389",
        "lng": "-83.045833"
    },
    {
        "city": "Las Vegas",
        "lat": "36.175000",
        "lng": "-115.136389"
    },
    {
        "city": "London",
        "lat": "51.528308",
        "lng": "-0.3817961"
    },
    {
        "city": "Los Angeles",
        "lat": "34.052222",
        "lng": "-118.242778"
    },
    {
        "city": "Louisville",
        "lat": "38.254167",
        "lng": "-85.759444"
    },
    {
        "city": "Miami",
        "lat": "25.773889",
        "lng": "-80.193889"
    },
    {
        "city": "Minneapolis",
        "lat": "44.980000",
        "lng": "-93.263611"
    },
    {
        "city": "Montreal",
        "lat": "45.5128708",
        "lng": "-73.6412496"
    },
    {
        "city": "New York",
        "lat": "40.714167",
        "lng": "-74.006389"
    },
    {
        "city": "Orlando",
        "lat": "28.538056",
        "lng": "-81.379444"
    },
    {
        "city": "Ottawa",
        "lat": "45.2487862",
        "lng": "-76.3606792"
    },
    {
        "city": "Phoenix",
        "lat": "33.448333",
        "lng": "-112.073333"
    },
    {
        "city": "Pittsburgh",
        "lat": "40.440556",
        "lng": "-79.996111"
    },
    {
        "city": "San Diego",
        "lat": "32.715278",
        "lng": "-117.156389"
    },
    {
        "city": "San Francisco",
        "lat": "37.775000",
        "lng": "-122.418333"
    },
    {
        "city": "Saskatoon",
        "lat": "52.1397818",
        "lng": "-106.7871504"
    },
    {
        "city": "Toronto",
        "lat": "43.666667",
        "lng": "-79.416667"
    },
    {
        "city": "Vancouver",
        "lat": "49.2576508",
        "lng": "-123.2639868"
    },
    {
        "city": "Washington",
        "lat": "38.895000",
        "lng": "-77.036667"
    },
]
