const express = require('express');
const request = require('sync-request');
const app = express();

// 설정
const port = 3000;
var OSM_Limit = 5;

// OSM 위치 검색 API
var OSM_Nom_A = "https://nominatim.openstreetmap.org/search?q=";
var OSM_Nom_B = "&limit=";
var OSM_Nom_C = "&format=json";

function OSM_CreateURL(location) {
    var OSM_Created = OSM_Nom_A + encodeURI(location) + OSM_Nom_B + OSM_Limit + OSM_Nom_C;
    return OSM_Created;
}

app.get('/', (req, res) => {
    res.send("안녕!");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get('/send', (req, res) => {
    console.log(req.query.location); // WORKS WITH ENCODEURIIII IN URL!!! Just spits out normal 한글
    //res.send("sent :3");

    var location = req.query.location;
    var searchres = getResults(location);
    console.log("Should be after this shit")
    res.send(searchres)
});

function getResults(location) {
    var OSM_Url = OSM_CreateURL(location);
    console.log(OSM_Url);
    var OSM_Res = request('GET', OSM_Url, {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
        },
    });
    console.log("Fetched")
    var OSM_Json = JSON.parse(OSM_Res.getBody('utf-8'));
    return JSON.stringify(OSM_Json);
}
