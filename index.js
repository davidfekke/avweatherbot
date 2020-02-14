
const axios = require('axios');
const parser = require('fast-xml-parser');
const airport = 'KCRG';

const Particle = require('particle-api-js');
const particle = new Particle();
const access_token = process.env.particle_access_token;
const device = process.env.button_device;
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
    console.log('colorForWeather called');
    console.log(`Weather color is ${weatherColor}`);
    const publishEventPr = particle.publishEvent({ name: 'pushcolor', data: weatherColor.join(','), isPrivate: true, auth: access_token }); // isPrivate: true,
    publishEventPr.then(
        function(data) {
            if (data.body.ok) { console.log("Event published succesfully") }
        },
        function(err) {
            console.log("Failed to publish event: " + err)
        }
    );
}

particle.getEventStream({ deviceId: device, auth: access_token}).then(function(stream) {
    stream.on('event', function(data) {
        if (data.name === 'readyforwx') {
            console.log("Calling function sendCurrentWX(): ", data);
            sendCurrentWX();    
        }
    });
}).catch(function(err) {
    console.error(err); 
});

function particleServiceTimer() {
    sendCurrentWX();
}

function sendCurrentWX() {
    console.log('Sending to Particle service.');
    axios.get(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${airport}&hoursBeforeNow=2`).then(xml => {
        const jsonObj = parser.parse(xml.data);
        if (jsonObj.response.data.METAR.length > 0) {
            const flight_category = jsonObj.response.data.METAR[0].flight_category;
            colorForWeather(flight_category);    
        }
    });
}

// Some hosts require that you run your process as an http event listener.
// require('http').createServer().listen(3000);
