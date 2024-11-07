import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { Type } from '@angular/core';

/* Import polyfills here instead of angular.json */
import 'zone.js';

import { WeatherWidgetComponent } from './components/weather-widget/weather-widget.component';

const webComponents: [[Type<any>, string]] = [
  [WeatherWidgetComponent, 'weather-widget'],
];

createApplication()
  .then((app) => {
    webComponents.forEach(([type, selector]) => {
      const ngElement = createCustomElement(type, {
        injector: app.injector,
      });
      customElements.define(selector, ngElement);
    });

    //app.bootstrap(LayoutComponent);
  })
  .catch((err) => console.error(err));
