import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { fetchWeatherApi } from 'openmeteo';
import weatherCodeJson from '../../json/weathercode_icons.json';

type currentWeather = {
  time?: Date;
  temperature2m?: number;
  relativeHumidity2m?: number;
  precipitation?: number;
  weatherCode?: keyof typeof weatherCodeJson;
  windSpeed10m?: number;
};

type forecastWeather = {
  time?: Date;
  weatherCode?: keyof typeof weatherCodeJson;
  temperature2mMax?: number;
  temperature2mMin?: number;
}[];

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './weather-widget.component.html',
  styleUrl: './weather-widget.component.scss',
})
export class WeatherWidgetComponent implements OnInit {
  private forecastDays = 7;
  private autoReloadInMs = 10 * 60 * 1000; // 10 min
  private locationLatLong = [48.0516, 8.2072];
  protected locationName = 'Furtwangen im Schwarzwald';
  protected locationTimezone = 'CET';
  protected currentWeather = signal<currentWeather>({});
  protected forecastWeather = signal<forecastWeather>([]);
  protected weatherCodes = weatherCodeJson;
  protected lastReload = new Date();
  protected isWeatherReloading = false;

  constructor() {}

  ngOnInit(): void {
    this.fetchWeatherApi();
    setInterval(() => {
      this.fetchWeatherApi();
    }, this.autoReloadInMs);
  }

  async fetchWeatherApi(): Promise<void> {
    this.isWeatherReloading = true;

    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    const params = {
      latitude: this.locationLatLong[0],
      longitude: this.locationLatLong[1],
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
      ],
      daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'],
      forecast_days: this.forecastDays,
      timeformat: 'unixtime',
      timezone: 'auto',
    };
    const url = 'https://api.open-meteo.com/v1/forecast';

    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];

    const current = response.current()!;
    const daily = response.daily()!;

    this.locationTimezone = response.timezoneAbbreviation()!;

    const tempCurrentWeather = {
      time: new Date(Number(current.time()) * 1000),
      temperature2m: current.variables(0)!.value(),
      relativeHumidity2m: current.variables(1)!.value(),
      precipitation: current.variables(2)!.value(),
      weatherCode: current
        .variables(3)!
        .value() as unknown as keyof typeof weatherCodeJson,
      windSpeed10m: current.variables(4)!.value(),
    };

    const tempForecastWeather: forecastWeather = [];
    for (let index = 0; index < this.forecastDays; index++) {
      tempForecastWeather.push({
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval()
        ).map((t) => new Date(t * 1000))[index],
        weatherCode: daily.variables(0)!.valuesArray()![
          index
        ] as unknown as keyof typeof weatherCodeJson,
        temperature2mMax: daily.variables(1)!.valuesArray()![index],
        temperature2mMin: daily.variables(2)!.valuesArray()![index],
      });
    }

    this.currentWeather.set(tempCurrentWeather);
    this.forecastWeather.set(tempForecastWeather);
    this.lastReload = new Date();
    this.isWeatherReloading = false;
    console.log('Updated Weather');
  }
}
