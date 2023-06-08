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

// Initialization
const exprapp = express();
const log = console.log();

// API Settings
var OSM_Limit = 5;
var OWM_ApiKey = process.env.OWM_API_KEY;
var OWM_Lang = "kr";
var EXPR_Port = 8080;

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

// Program Start

