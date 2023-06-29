/*
// OWM_Weather API
// 2023년 06월
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
var OWM_Lang = "kr"; // en / kr
var OSM_Lang = "ko-KR"; // en-US / ko-KR
var EXPR_Port = 10000;
var REQ_UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0";

// Persistent Storage
var OSM_DisplayName = new Array();
var OSM_Lat = new Array();
var OSM_Lon = new Array();

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
    origin: 'malexty.duckdns.org'
}));

// Express Functions
exprapp.listen(EXPR_Port, () => {
    log(chalk.green(`Express: Listening on port ${EXPR_Port}`));
});

// Serve Frontend
exprapp.use(express.static('frontend'));

// OSM /searchLocation?location=강남구
exprapp.get('/searchLocation', (req, res) => {
    // Fetch location from URL, Create URL, Fetch URL, Parse JSON, and count found locations
    var USER_Location = req.query.location;
    log(chalk.green(`Express: OSM Called, Location: ${USER_Location}`));
    var OSM_Url = OSM_CreateURL(USER_Location);
    var OSM_Res = request('GET', OSM_Url, {
        headers: {
            'user-agent': REQ_UserAgent,
            'accept-language': OSM_Lang
        }
    });
    var OSM_Json = JSON.parse(OSM_Res.getBody('utf-8'));
    var OSM_Keys = Object.keys(OSM_Json).length;

    // Empty Arrays
    OSM_DisplayName = new Array();
    OSM_Lat = new Array();
    OSM_Lon = new Array();

    // Create empty JSON object
    var OSM_ResJson = {};
    if (OSM_Keys == 0) {
        // No locations found
        OSM_ResJson["code"] = 400;
        log(chalk.red("Express: OSM Location not found"));
    } else {
        // Locations found
        OSM_ResJson["code"] = 200;
        OSM_ResJson["count"] = OSM_Keys;
        for (let i = 0; i < OSM_Keys; i++) {
            // Make temporary JSON object, add JSON data to the temporary JSON object, add temporary JSON object to other JSON object, and add the same data to arrays
            var OSM_ResJsonObj = {};
            OSM_ResJsonObj["name"] = OSM_Json[i]["display_name"];
            OSM_ResJsonObj["lat"] = OSM_Json[i]["lat"];
            OSM_ResJsonObj["lon"] = OSM_Json[i]["lon"];
            OSM_ResJson[i] = OSM_ResJsonObj;
            OSM_DisplayName.push(OSM_Json[i]["display_name"]);
            OSM_Lat.push(OSM_Json[i]["lat"]);
            OSM_Lon.push(OSM_Json[i]["lon"]);
        }
    }
    res.send(OSM_ResJson);
});

// OWM Current /weatherCurrent?index=3 (References OSM_*[i] arrays)
exprapp.get('/weatherCurrent', (req, res) => {
    // Fetch index from URL, Fetch info from arrays, Create URL, Fetch URL, and Parse JSON
    var USER_Index = req.query.index;
    log(chalk.green(`Express: OWM Current Called, Index: ${USER_Index}`));
    var OWM_DisplayName = OSM_DisplayName[USER_Index];
    var OWM_Lat = OSM_Lat[USER_Index];
    var OWM_Lon = OSM_Lon[USER_Index];
    var OWM_ResJson = {};
    if (OWM_DisplayName === undefined || OWM_DisplayName == "") {
        OWM_ResJson["code"] = 400;
        log(chalk.red("Express: OWM Current index not found"));
        return res.send(OWM_ResJson);
    } else {
        OWM_ResJson["code"] = 200;
    }
    var OWM_Url = OWM_Current_CreateURL(OWM_Lat, OWM_Lon);
    var OWM_Res = request('GET', OWM_Url, {
        headers: {
            'user-agent': REQ_UserAgent
        }
    });
    var OWM_Json = JSON.parse(OWM_Res.getBody('utf-8'));
    var OWM_Main = OWM_Json["weather"][0]["main"];
    var OWM_Description = OWM_Json["weather"][0]["description"];
    var OWM_Temp = OWM_Json["main"]["temp"];
    var OWM_FeelsLike = OWM_Json["main"]["feels_like"];
    var OWM_Pressure = OWM_Json["main"]["pressure"];
    var OWM_Humidity = OWM_Json["main"]["humidity"];
    var OWM_Visibility = OWM_Json["visibility"];
    var OWM_Wind_Speed = 0; try { OWM_Wind_Speed = OWM_Json["wind"]["speed"]; } catch (e) { OWM_Wind_Speed = 0; } if (OWM_Wind_Speed === undefined) { OWM_Wind_Speed = 0; }
    var OWM_Wind_Deg = 0; try { OWM_Wind_Deg = OWM_Json["wind"]["deg"]; } catch (e) { OWM_Wind_Deg = 0; } if (OWM_Wind_Deg === undefined) { OWM_Wind_Deg = 0; }
    var OWM_Wind_Gust = 0; try { OWM_Wind_Gust = OWM_Json["wind"]["gust"]; } catch (e) { OWM_Wind_Gust = 0; } if (OWM_Wind_Gust === undefined) { OWM_Wind_Gust = OWM_Wind_Speed; }
    var OWM_Clouds_All = 0; try { OWM_Clouds_All = OWM_Json["clouds"]["all"]; } catch (e) { OWM_Clouds_All = 0; } if (OWM_Clouds_All === undefined) { OWM_Clouds_All = 0; }
    var OWM_Rain_1H = 0; try { OWM_Rain_1H = OWM_Json["rain"]["1h"]; } catch (e) { OWM_Rain_1H = 0; } if (OWM_Rain_1H === undefined) { OWM_Rain_1H = 0; }
    var OWM_Rain_3H = 0; try { OWM_Rain_3H = OWM_Json["rain"]["3h"]; } catch (e) { OWM_Rain_3H = 0; } if (OWM_Rain_3H === undefined) { OWM_Rain_3H = 0; }
    var OWM_Snow_1H = 0; try { OWM_Snow_1H = OWM_Json["snow"]["1h"]; } catch (e) { OWM_Snow_1H = 0; } if (OWM_Snow_1H === undefined) { OWM_Snow_1H = 0; }
    var OWM_Snow_3H = 0; try { OWM_Snow_3H = OWM_Json["snow"]["3h"]; } catch (e) { OWM_Snow_3H = 0; } if (OWM_Snow_3H === undefined) { OWM_Snow_3H = 0; }
    var OWM_Dt = OWM_Json["dt"];
    var OWM_SunUp = OWM_Json["sys"]["sunrise"];
    var OWM_SunDown = OWM_Json["sys"]["sunset"];

    // Format incoming JSON data
    OWM_Temp = temperature.kelvinToCelsius(OWM_Temp).toFixed(2);
    OWM_FeelsLike = temperature.kelvinToCelsius(OWM_FeelsLike).toFixed(2);
    var OWM_UnixTimezone = geotz.find(OWM_Lat, OWM_Lon)[0];
    OWM_Dt = OWM_CalculateTime(OWM_UnixTimezone, OWM_Dt);
    OWM_SunUp = OWM_CalculateSun(OWM_UnixTimezone, OWM_SunUp, 1);
    OWM_SunDown = OWM_CalculateSun(OWM_UnixTimezone, OWM_SunDown, 2);

    // Form JSON Response
    var OWM_TempJson = {};
    OWM_TempJson["main"] = OWM_Main; // Main Weather
    OWM_TempJson["description"] = OWM_Description; // Weather Description
    OWM_TempJson["temp"] = OWM_Temp; // Temperature (2 digits, 섭씨)
    OWM_TempJson["temp_feelslike"] = OWM_FeelsLike; // Temperature Feels Like (2 digits, 섭씨)
    OWM_TempJson["pressure"] = OWM_Pressure; // Pressure (hPa)
    OWM_TempJson["humidity"] = OWM_Humidity; // Humidity (%)
    OWM_TempJson["visibility"] = OWM_Visibility; // Visibility (km)
    OWM_TempJson["wind_speed"] = OWM_Wind_Speed; // Wind Speed (m/s)
    OWM_TempJson["wind_deg"] = OWM_Wind_Deg; // Wind Direction (Degrees)
    OWM_TempJson["wind_gust"] = OWM_Wind_Gust; // Wind Gust (m/s)
    OWM_TempJson["clouds"] = OWM_Clouds_All; // Clouds (%)
    OWM_TempJson["rain_1h"] = OWM_Rain_1H; // Rain past hour (mm)
    OWM_TempJson["rain_3h"] = OWM_Rain_3H; // Rain past 3 hours (mm)
    OWM_TempJson["snow_1h"] = OWM_Snow_1H; // Snow past hour (mm)
    OWM_TempJson["snow_3h"] = OWM_Snow_3H; // Snow past 3 hours (mm)
    OWM_TempJson["calctime"] = OWM_Dt; // Time of data calculation
    OWM_TempJson["sunrise"] = OWM_SunUp; // Time of sunrise
    OWM_TempJson["sunset"] = OWM_SunDown; // Time of sunset
    OWM_ResJson[0] = OWM_TempJson;
    res.send(OWM_ResJson);
});

// OWM 5 Day 3 Hour /weatherLong?index=3 (References OSM_*[i] arrays)
exprapp.get('/weatherLong', (req, res) => {
    // Fetch index from URL, Fetch info from arrays, Create URL, Fetch URL, Parse JSON, Get Object Count, and Calculate Timezone
    var USER_Index = req.query.index;
    log(chalk.green(`Express: OWM Long Called, Index: ${USER_Index}`));
    var OWM_DisplayName = OSM_DisplayName[USER_Index];
    var OWM_Lat = OSM_Lat[USER_Index];
    var OWM_Lon = OSM_Lon[USER_Index];
    var OWM_ResJson = {};
    if (OWM_DisplayName === undefined || OWM_DisplayName == "") {
        OWM_ResJson["code"] = 400;
        log(chalk.red("Express: OWM Long index not found"));
        return res.send(OWM_ResJson);
    } else {
        OWM_ResJson["code"] = 200;
    }
    var OWM_Url = OWM_Long_CreateURL(OWM_Lat, OWM_Lon);
    var OWM_Res = request('GET', OWM_Url, {
        headers: {
            'user-agent': REQ_UserAgent
        }
    });
    var OWM_Json = JSON.parse(OWM_Res.getBody('utf-8'));
    var OWM_Count = OWM_Json["cnt"];
    var OWM_UnixTimezone = geotz.find(OWM_Lat, OWM_Lon)[0];
    OWM_ResJson["count"] = OWM_Count;

    //
    for (let i = 0; i < OWM_Count; i++) {
        // Gather needed info from original JSON, and Process it, then add it to the new JSON
        var OWM_TempJson = {};
        var OWM_TempTemp = OWM_Json["list"][i]["main"]["temp"];
        var OWM_TempFeelsLike = OWM_Json["list"][i]["main"]["feels_like"];
        OWM_TempTemp = temperature.kelvinToCelsius(OWM_TempTemp).toFixed(2);
        OWM_TempFeelsLike = temperature.kelvinToCelsius(OWM_TempFeelsLike).toFixed(2);
        var OWM_TempWindSpeed = 0; try { OWM_TempWindSpeed = OWM_Json["list"][i]["wind"]["speed"]; } catch (e) { OWM_TempWindSpeed = 0; } if (OWM_TempWindSpeed === undefined) { OWM_TempWindSpeed = 0; }
        var OWM_TempWindDeg = 0; try { OWM_TempWindDeg = OWM_Json["list"][i]["wind"]["deg"]; } catch (e) { OWM_TempWindDeg = 0; } if (OWM_TempWindDeg === undefined) { OWM_TempWindDeg = 0; }
        var OWM_TempWindGust = 0; try { OWM_TempWindGust = OWM_Json["list"][i]["wind"]["gust"]; } catch (e) { OWM_TempWindGust = 0; } if (OWM_TempWindGust === undefined) { OWM_TempWindGust = OWM_TempWindSpeed; }
        var OWM_TempClouds = 0; try { OWM_TempClouds = OWM_Json["list"][i]["clouds"]["all"]; } catch (e) { OWM_TempClouds = 0; } if (OWM_TempClouds === undefined) { OWM_TempClouds = 0; }
        var OWM_TempRain = 0; try { OWM_TempRain = OWM_Json["list"][i]["rain"]["3h"]; } catch (e) { OWM_TempRain = 0; } if (OWM_TempRain === undefined) { OWM_TempRain = 0; }
        var OWM_TempSnow = 0; try { OWM_TempSnow = OWM_Json["list"][i]["snow"]["3h"]; } catch (e) { OWM_TempSnow = 0; } if (OWM_TempSnow === undefined) { OWM_TempSnow = 0; }
        var OWM_TempDt = OWM_Json["list"][i]["dt"];
        var OWM_TempPop = OWM_Json["list"][i]["pop"];
        var OWM_TempPodt = OWM_Json["list"][i]["sys"]["pod"];
        OWM_TempDt = OWM_CalculateTime(OWM_UnixTimezone, OWM_TempDt);
        OWM_TempPop = OWM_TempPop * 100;
        if (OWM_TempPodt == "d") {
            OWM_TempPodt = "DAY";
        } else if (OWM_TempPodt == "n") {
            OWM_TempPodt = "NIGHT";
        }
        OWM_TempJson["main"] = OWM_Json["list"][i]["weather"][0]["main"];
        OWM_TempJson["description"] = OWM_Json["list"][i]["weather"][0]["description"];
        OWM_TempJson["temp"] = OWM_TempTemp;
        OWM_TempJson["temp_feelslike"] = OWM_TempFeelsLike;
        OWM_TempJson["pressure"] = OWM_Json["list"][i]["main"]["pressure"];
        OWM_TempJson["humidity"] = OWM_Json["list"][i]["main"]["humidity"];
        OWM_TempJson["visibility"] = OWM_Json["list"][i]["visibility"];
        OWM_TempJson["wind_speed"] = OWM_TempWindSpeed;
        OWM_TempJson["wind_deg"] = OWM_TempWindDeg;
        OWM_TempJson["wind_gust"] = OWM_TempWindGust;
        OWM_TempJson["clouds"] = OWM_TempClouds;
        OWM_TempJson["rain_3h"] = OWM_TempRain;
        OWM_TempJson["snow_3h"] = OWM_TempSnow;
        OWM_TempJson["time"] = OWM_TempDt;
        OWM_TempJson["pop"] = OWM_TempPop;
        OWM_TempJson["podt"] = OWM_TempPodt;
        OWM_ResJson[i] = OWM_TempJson;
    }
    res.send(OWM_ResJson);
});
