const express = require('express');
const request = require('sync-request');
const cors = require('cors');
const app = express();

// 설정
const express_port = 3000;
const OSM_Limit = 5;
const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0";

// OSM 위치 검색 API
var OSM_Nom_A = "https://nominatim.openstreetmap.org/search?q=";
var OSM_Nom_B = "&limit=";
var OSM_Nom_C = "&format=json";

function OSM_CreateURL(location) {
    var OSM_Created = OSM_Nom_A + encodeURI(location) + OSM_Nom_B + OSM_Limit + OSM_Nom_C;
    return OSM_Created;
}

app.use(cors({
    origin: '*'
}));

app.listen(express_port, () => {
    console.log(`Listening on port ${express_port}`);
});

app.get('/searchLocation', (req, res) => {
    var location = req.query.location;
    var searchResult = getLocationApiRes(location);
    res.send(searchResult);
});

app.get('/searchSelect', (req, res) => {
    var selection = req.query.selection;
    console.log(selection);
    var resJson = { "code": "OK" }
    resJson = JSON.stringify(resJson);
    res.send(resJson);
});

function getLocationApiRes(location) {
    // Fetch API data and parse JSON
    var OSM_Url = OSM_CreateURL(location);
    var OSM_Res = request('GET', OSM_Url, {
        headers: {
            'user-agent': UserAgent,
        },
    });
    var OSM_Json = JSON.parse(OSM_Res.getBody('utf-8'));
    
    // Convert JSON into format required for API response
    var OSM_Keys = Object.keys(OSM_Json).length; // Adds 1, so index is 0, this is 1

    console.log(OSM_Json);

    var OSM_Name_Array = new Array();
    var OSM_Lat_Array = new Array();
    var OSM_Lon_Array = new Array();
    var OSM_Res = "";

    if (OSM_Keys == 0) {
        // No locations found
        var OSM_Obj = [ { "error": "No locations found." } ];
        OSM_Res = JSON.stringify(OSM_Obj);
    } else {
        // Locations found
        for (let i = 0; i < OSM_Keys; i++) {
            OSM_Name_Array.push(OSM_Json[i]["display_name"]);
            OSM_Lat_Array.push(OSM_Json[i]["lat"]);
            OSM_Lon_Array.push(OSM_Json[i]["lon"]);
        }

        OSM_Res = "[ ";

        for (let i = 0; i < OSM_Keys; i++) {
            if (i == OSM_Keys - 1) {
                // Last one
                OSM_Res = OSM_Res + " { 'name': '" + OSM_Name_Array[i] + "', 'lat': '" + OSM_Lat_Array[i] +
                "', 'lon': '" + OSM_Lon_Array[i] + "' }";
            } else {
                // Not last one
                OSM_Res = OSM_Res + " { 'name': '" + OSM_Name_Array[i] + "', 'lat': '" + OSM_Lat_Array[i] +
                "', 'lon': '" + OSM_Lon_Array[i] + "' },";
            }
        }

        OSM_Res = OSM_Res + " ]";
        OSM_Res = OSM_Res.replace(/'/g, '"');
        OSM_Res = JSON.stringify(JSON.parse(OSM_Res));
    }

    return OSM_Res;
}
