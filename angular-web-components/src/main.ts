import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { Type } from '@angular/core';

/* Import polyfills here instead of angular.json */
import 'zone.js';

import { TestComponentComponent } from './components/test-component/test-component.component';

const webComponents: [[Type<any>, string]] = [
  [TestComponentComponent, 'test-component'],
];

createApplication()
  .then((app) => {
    webComponents.forEach(([type, selector]) => {
      const ngElement = createCustomElement(type, {
        injector: app.injector,
      });
      customElements.define(selector, ngElement);
    });

    //app.bootstrap(TestComponentComponent);
  })
  .catch((err) => console.error(err));
