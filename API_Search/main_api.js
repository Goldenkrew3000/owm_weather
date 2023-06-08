/*
//
*/

'use strict';

// NPM Imports
const dotenv = require('dotenv').config();
const request = require('sync-request');
const prompt = require('prompt-sync')({ sigint: true });
const temperature = require('temperature');
const table = require('table');
const moment_tz = require('moment-timezone');
const moment = require('moment');
const geotz = require('geo-tz');
const express = require('express');
const chalk = require('chalk');
const cors = require('cors');

// Initialization
const exprapp = express();
const log = console.log;

// API Settings
var OSM_Limit = 5;
var OWM_ApiKey = process.env.OWM_API_KEY;
var OWM_Lang = "kr";
var EXPR_Port = 30000;

// OSM Search API
var OSM_Nom_A = "https://nominatim.openstreetmap.org/search?q=";
var OSM_Nom_B = "&limit=";
var OSM_Nom_C = "&format=json";

// OWM Current Weather API
var OWM_Current_A = "https://api.openweathermap.org/data/2.5/weather?lat=";
var OWM_Current_B = "&lon=";
var OWM_Current_C = "&appid=";
var OWM_Current_D = "&lang=";

// OWM 5 Day 3 Hour Weather API
var OWM_Long_A = "https://api.openweathermap.org/data/2.5/forecast?lat=";
var OWM_Long_B = "&lon=";
var OWM_Long_C = "&appid=";
var OWM_Long_D = "&lang=";

// Functions
function OSM_CreateURL(location) {
    var OSM_Created = OSM_Nom_A + encodeURI(location) + OSM_Nom_B + OSM_Limit + OSM_Nom_C;
    return OSM_Created;
}

function OWM_Current_CreateURL(lat, lon) {
    var OWM_Created = OWM_Current_A + lat + OWM_Current_B + lon + OWM_Current_C + OWM_ApiKey + OWM_Current_D + OWM_Lang;
    return OWM_Created;
}

function OWM_Long_CreateURL(lat, lon) {
    var OWM_Created = OWM_Long_A + lat + OWM_Long_B + lon + OWM_Long_C + OWM_ApiKey + OWM_Long_D + OWM_Lang;
    return OWM_Created;
}

function OWM_CalculateSun(UnixTimezone, SunTimestamp, Direction) {
    var OWM_Current_Time = moment.unix(SunTimestamp).utcOffset('+0000');
    var OWM_Current_Sun = moment_tz.tz(OWM_Current_Time, UnixTimezone);
    var OWM_Current_String = "";
    if (Direction == 1) {
        // 오전
        OWM_Current_String = moment_tz(OWM_Current_Sun).format("오전 hh:mm");
    } else if (Direction == 2) {
        // 오후
        OWM_Current_String = moment_tz(OWM_Current_Sun).format("오후 hh:mm");
    }
    return OWM_Current_String;
}

function OWM_CalculateTime(UnixTimezone, Timestamp) {
    var OWM_Current_Time = moment.unix(Timestamp).utcOffset('+0000');
    var OWM_Current_LocalTime = moment_tz.tz(OWM_Current_Time, UnixTimezone);
    var OWM_Current_Direction = moment_tz(OWM_Current_LocalTime).format("A");
    var OWM_Current_String_A = moment_tz(OWM_Current_LocalTime).format("YYYY년 MM월 DD일");
    var OWM_Current_String_B = moment_tz(OWM_Current_LocalTime).format("hh:mm (Z)");
    var OWM_Current_String = "";
    if (OWM_Current_Direction == "AM") {
        // 오전
        OWM_Current_String = OWM_Current_String_A + " 오전 " + OWM_Current_String_B;
    } else if (OWM_Current_Direction == "PM") {
        // 오후
        OWM_Current_String = OWM_Current_String_A + " 오후 " + OWM_Current_String_B;
    }
    return OWM_Current_String;
}

// Program Start
log("Weather API Starting");

// Configure CORS
exprapp.use(cors({
    origin: '*'
}));

// Express Functions
exprapp.listen(EXPR_Port, () => {
    log(chalk.green(`Express: Listening on port ${EXPR_Port}`));
});

exprapp.listen('/', (req, res) => {
    res.send("Weather API");
})
