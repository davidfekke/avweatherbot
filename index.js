
const axios = require('axios');
const parser = require('fast-xml-parser');
const airport = 'KCRG';

const Particle = require('particle-api-js');
const particle = new Particle();
const access_token = process.env.SPARKACCESSTOKEN;
const vfrColor = [0,255,0];
const mvfrColor = [0,0,255];
const ifrColor = [255,0,0];

setImmediate(particleServiceTimer);
var timerId = setInterval(particleServiceTimer, 15 * 60 * 1000);

function getWeatherColor(wxFlyingRules) {
    if (wxFlyingRules === 'VFR') {
        return vfrColor;
    } else if (wxFlyingRules === 'MVFR') {
        return mvfrColor;
    } else { // if IFR
        return ifrColor;
    }
}

function colorForWeather(wxFlyingRules) {
    let weatherColor = getWeatherColor(wxFlyingRules);

    const publishEventPr = particle.publishEvent({ name: 'pushcolor', data: weatherColor, isPrivate: true, auth: access_token });
    publishEventPr.then(
        function(data) {
            if (data.body.ok) { console.log("Event published succesfully") }
        },
        function(err) {
            console.log("Failed to publish event: " + err)
        }
    );
}

function particleServiceTimer() {
    console.log('Sending to Particle service.');
    axios.get(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${airport}&hoursBeforeNow=2`).then(xml => {
        const jsonObj = parser.parse(xml.data);
        if (jsonObj.response.data.METAR.length > 0) {
            const flight_category = jsonObj.response.data.METAR[0].flight_category;
            colorForWeather(flight_category);    
        }
    });
}