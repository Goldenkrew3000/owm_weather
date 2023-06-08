const dotenv = require('dotenv').config();
const request = require('sync-request');
const prompt = require('prompt-sync')({ sigint: true });
const temperature = require('temperature');
const table = require('table');
const moment_tz = require('moment-timezone');
const moment = require('moment');
const geotz = require('geo-tz');

// 프로그램 설정
var OSM_Limit = 5;
var OWM_ApiKey = process.env.OWM_API_KEY;
var OWM_Lang = "kr";

// OSM 위치 검색 API
var OSM_Nom_A = "https://nominatim.openstreetmap.org/search?q=";
var OSM_Nom_B = "&limit=";
var OSM_Nom_C = "&format=json";

// OWM 지금 날씨 - https://openweathermap.org/current
var OWM_Current_A = "https://api.openweathermap.org/data/2.5/weather?lat=";
var OWM_Current_B = "&lon=";
var OWM_Current_C = "&appid=";
var OWM_Current_D = "&lang=";

// OWM 5일 후 / 3 시간 날씨 - https://openweathermap.org/forecast5
var OWM_Long_A = "https://api.openweathermap.org/data/2.5/forecast?lat=";
var OWM_Long_B = "&lon=";
var OWM_Long_C = "&appid=";
var OWM_Long_D = "&lang=";

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

// 프로그램 시작
console.log("Weather Proof-of-Concept");

// 사람은 위치를 입력하다
console.log("너 위치를 입력하십시오.");
const USER_Location = prompt("위치: ");

// 위치를 OSM에서 검색하다
console.log("검색중...");
var OSM_Url = OSM_CreateURL(USER_Location);
var OSM_Res = request('GET', OSM_Url, {
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
    },
});
var OSM_Json = JSON.parse(OSM_Res.getBody('utf-8'));

var OSM_Keys = Object.keys(OSM_Json).length;
if (OSM_Keys == 0) {
    console.log("위치 없어.");
    process.exit();
} else {
    console.log("위치 리스트:");
}

// 사람은 위치를 선택하다
var OSM_Array = new Array();
for (let i = 0; i < OSM_Keys; i++) {
    OSM_Array.push(OSM_Json[i]["display_name"]);
}

console.log("너 위치를 선택하십시오.");
for (let i = 0; i < OSM_Keys; i++) {
    console.log(i + " --- " + OSM_Array[i]);
}
var USER_Selection = prompt("선택: ");
if (USER_Selection >= OSM_Keys || USER_Selection < 0) {
    console.log("선택 없어.");
    process.exit();
} else {
    console.log("날씨는 다운로드중...");
}

// OWM에서 날씨 다운로드하다
var OSM_Selection_Lat = OSM_Json[USER_Selection]["lat"];
var OSM_Selection_Lon = OSM_Json[USER_Selection]["lon"];
var OSM_Selection_DisplayName = OSM_Json[USER_Selection]["display_name"];

// 지금 날씨는 다운로드하다
var OWM_Current_URL = OWM_Current_CreateURL(OSM_Selection_Lat, OSM_Selection_Lon);
var OWM_Current_Res = request('GET', OWM_Current_URL, {
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
    },
});
var OWM_Current_Json = JSON.parse(OWM_Current_Res.getBody('utf-8'));

var OWM_Current_Main = OWM_Current_Json["weather"][0]["main"];
var OWM_Current_Description = OWM_Current_Json["weather"][0]["description"];
var OWM_Current_Temp = OWM_Current_Json["main"]["temp"];
var OWM_Current_FeelsLike = OWM_Current_Json["main"]["feels_like"];
var OWM_Current_Pressure = OWM_Current_Json["main"]["pressure"];
var OWM_Current_Humidity = OWM_Current_Json["main"]["humidity"];
var OWM_Current_Visibility = OWM_Current_Json["visibility"];
var OWM_Current_Wind_Speed = 0; try { OWM_Current_Wind_Speed = OWM_Current_Json["wind"]["speed"]; } catch (e) { OWM_Current_Wind_Speed = 0; } if (OWM_Current_Wind_Speed === undefined) { OWM_Current_Wind_Speed = 0; }
var OWM_Current_Wind_Deg = 0; try { OWM_Current_Wind_Deg = OWM_Current_Json["wind"]["deg"]; } catch (e) { OWM_Current_Wind_Deg = 0; } if (OWM_Current_Wind_Deg === undefined) { OWM_Current_Wind_Deg = 0; }
var OWM_Current_Wind_Gust = 0; try { OWM_Current_Wind_Gust = OWM_Current_Json["wind"]["gust"]; } catch (e) { OWM_Current_Wind_Gust = 0; } if (OWM_Current_Wind_Gust === undefined) { OWM_Current_Wind_Gust = OWM_Current_Wind_Speed; }
var OWM_Current_Clouds_All = 0; try { OWM_Current_Clouds_All = OWM_Current_Json["clouds"]["all"]; } catch (e) { OWM_Current_Clouds_All = 0; } if (OWM_Current_Clouds_All === undefined) { OWM_Current_Clouds_All = 0; }
var OWM_Current_Rain_1H = 0; try { OWM_Current_Rain_1H = OWM_Current_Json["rain"]["1h"]; } catch (e) { OWM_Current_Rain_1H = 0; } if (OWM_Current_Rain_1H === undefined) { OWM_Current_Rain_1H = 0; }
var OWM_Current_Rain_3H = 0; try { OWM_Current_Rain_3H = OWM_Current_Json["rain"]["3h"]; } catch (e) { OWM_Current_Rain_3H = 0; } if (OWM_Current_Rain_3H === undefined) { OWM_Current_Rain_3H = 0; }
var OWM_Current_Snow_1H = 0; try { OWM_Current_Snow_1H = OWM_Current_Json["snow"]["1h"]; } catch (e) { OWM_Current_Snow_1H = 0; } if (OWM_Current_Snow_1H === undefined) { OWM_Current_Snow_1H = 0; }
var OWM_Current_Snow_3H = 0; try { OWM_Current_Snow_3H = OWM_Current_Json["snow"]["3h"]; } catch (e) { OWM_Current_Snow_3H = 0; } if (OWM_Current_Snow_3H === undefined) { OWM_Current_Snow_3H = 0; }
var OWM_Current_Dt = OWM_Current_Json["dt"];
var OWM_Current_SunUp = OWM_Current_Json["sys"]["sunrise"];
var OWM_Current_SunDown = OWM_Current_Json["sys"]["sunset"];

// 켈빈부터 섭씨까지 전환하다
OWM_Current_Temp = temperature.kelvinToCelsius(OWM_Current_Temp).toFixed(2);
OWM_Current_FeelsLike = temperature.kelvinToCelsius(OWM_Current_FeelsLike).toFixed(2);

// 시간들은 계신하다
var OWM_Current_UnixTimezone = geotz.find(OSM_Selection_Lat, OSM_Selection_Lon)[0];
var OWM_Current_Calculated = OWM_CalculateTime(OWM_Current_UnixTimezone, OWM_Current_Dt);
var OWM_Current_SunUpStr = OWM_CalculateSun(OWM_Current_UnixTimezone, OWM_Current_SunUp, 1);
var OWM_Current_SunDownStr = OWM_CalculateSun(OWM_Current_UnixTimezone, OWM_Current_SunDown, 2);

var OWM_Current_Table_Data = [
    ['일반 정보', OWM_Current_Main + " - " + OWM_Current_Description],
    ['기온', OWM_Current_Temp + " °C" + " / " + OWM_Current_FeelsLike + " °C"],
    ['습도', OWM_Current_Humidity + " %"],
    ['기압', OWM_Current_Pressure + " hPa"],
    ['풍속', OWM_Current_Visibility + " km"],
    ['바람', OWM_Current_Wind_Speed + " m/s" + " / " + OWM_Current_Wind_Gust + " m/s"],
    ['바람쪽', OWM_Current_Wind_Deg + "°"],
    ['구름', OWM_Current_Clouds_All + " %"],
    ['비', OWM_Current_Rain_1H + " mm (지난 1시간) / " + OWM_Current_Rain_3H + " mm (지난 3시간)"],
    ['눈', OWM_Current_Snow_1H + " mm (지난 1시간) / " + OWM_Current_Snow_3H + " mm (지난 3시간)"],
    ['일출 / 일몬', OWM_Current_SunUpStr + " / " + OWM_Current_SunDownStr],
]

var OWM_Current_Table_Config = {
    header: {
        alignment: 'center',
        content: 'OWM는 지금 날씨\n시간 계신: ' + OWM_Current_Calculated + '\n위치: ' + OSM_Selection_DisplayName,
    },
};

console.log(table.table(OWM_Current_Table_Data, OWM_Current_Table_Config));

// 5일 후 날씨 다운로드중

//var OWM_Current_TempMin = OWM_Current_Json["main"]["temp_min"];
//var OWM_Current_TempMax = OWM_Current_Json["main"]["temp_max"];
//OWM_Current_TempMin = temperature.kelvinToCelsius(OWM_Current_TempMin).toFixed(2);
//OWM_Current_TempMax = temperature.kelvinToCelsius(OWM_Current_TempMax).toFixed(2);
//['최저 / 최고', OWM_Current_TempMin + " °C / " + OWM_Current_TempMax + " °C"], // Min / Max Temperature

var OWM_Long_URL = OWM_Long_CreateURL(OSM_Selection_Lat, OSM_Selection_Lon);
var OWM_Long_Res = request('GET', OWM_Long_URL, {
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
    },
});
var OWM_Long_Json = JSON.parse(OWM_Long_Res.getBody('utf-8'));

//console.log(OWM_Long_Json)
console.log(OWM_Long_URL)

