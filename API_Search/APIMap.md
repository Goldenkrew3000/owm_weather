API Map:

GET: /searchLocation?location=강남구
RES:
{
    code: 200, (Can be 200, or 400)
    count: 2; (Makes it really easy to know the amount of elements, if i just send it along)
    0: {
        //
    },
    1: {
        //
    } (Max of 5 entries 0-4)
}

GET: /weatherCurrent?index=3 // Could either do index, or the lat and lon. Going to do index for now (Mostly for security purposes)
RES:
{
    code: 200, (200 = good, 400 = index not found)
    0: {
        main: Main weather,
        description: Weather description,
        temp: Temperature (섭씨),
        temp_feelslike: Feels like temperature,
        pressure: Pressure (hPa),
        humidity: Humidity (%),
        visibility: Visibility (km),
        wind_speed: Wind Speed (m/s),
        wind_deg: Wind Direction (degrees),
        wind_gust: Wind Gust (m/s),
        clouds: Clouds (%),
        rain_1h: Rain past hour (mm),
        rain_3h: Rain past 3 hours (mm),
        snow_1h: Snow past hour (mm),
        snow_3h: Snow past 3 hours (mm),
        calctime: Time of data calculation,
        sunrise: Time of sunrise,
        sunset: Time of sunset
    }
}
Example Response:
{
  '0': {
    main: 'Clear',
    description: '맑음',
    temp: '17.12',
    temp_feelslike: '16.17',
    pressure: 1021,
    humidity: 49,
    visibility: 10000,
    wind_speed: 2.06,
    wind_deg: 69,
    wind_gust: 2.17,
    clouds: 0,
    rain_1h: 0,
    rain_3h: 0,
    snow_1h: 0,
    snow_3h: 0,
    calctime: '2023년 06월 10일 오후 02:21 (+10:00)',
    sunrise: '오전 06:38',
    sunset: '오후 05:04'
  },
  code: 200
}
