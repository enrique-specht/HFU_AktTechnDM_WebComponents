import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { LOCALE_ID, Type } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe);

/* Import polyfills here instead of angular.json */
import 'zone.js';

import { WeatherWidgetComponent } from './components/weather-widget/weather-widget.component';

const webComponents: [[Type<any>, string]] = [
  [WeatherWidgetComponent, 'weather-widget'],
];

createApplication({
  providers: [provideHttpClient(), { provide: LOCALE_ID, useValue: 'de-de' }],
})
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
