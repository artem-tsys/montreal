import BehaviorSubject from 'rxjs';
import $ from 'jquery';
import Input from './modules/input';
import loader from './modules/loaderTime';
import { isBrowser, isDevice } from './modules/checkDevice';
import {
  addBlur, unActive, preloader, updateFlatFavourite, compass, debounce,
} from './modules/general/General';
import CreateMarkup from './modules/markup';
import AppController from './modules/app/app.controller';
import AppModel from './modules/app/app.model';
import AppView from './modules/app/app.view';

document.addEventListener('DOMContentLoaded', global => {
  preloader().show();
  init();
});

window.nameProject = 'montreal';
// window.nameProject = 'template';
window.defaultProjectPath = `/wp-content/themes/${window.nameProject}/assets`;
window.defaultModulePath = `/wp-content/themes/${window.nameProject}/assets/s3d/`;
window.defaultStaticPath = `/wp-content/themes/${window.nameProject}/static/`;
// window.status = 'local';
window.status = 'dev';
// window.status = 'prod';

async function init() {
  window.createMarkup = CreateMarkup;
  let config;
  await $.ajax(`${defaultStaticPath}settings.json`).then(resolve => {
    config = resolve;
  });

  const lang = document.querySelector('.screen__lang');
  if (lang) {
    document.querySelector('.header__call').insertAdjacentElement('beforeBegin', lang);
  }

  new Promise(resolve => {
    loader(resolve, config.flyby[1].outside, nameProject);
  }).then(value => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    if (!value.fastSpeed) {
      // else speed slowly update link with light image
      for (const pr in config) {
        if (config[pr].imageUrl || window.status !== 'local') {
          config[pr].imageUrl += 'mobile/';
        }
      }
    }
    if (isDevice('mobile') || document.documentElement.offsetWidth <= 768) {
      $('.js-s3d__slideModule').addClass('s3d-mobile');
    }

    config.flyby[1].outside['browser'] = Object.assign(isBrowser(), value);
    const app = new AppModel(config);
    const appView = new AppView(app, {
      switch: $('.js-s3d__select'),
      wrapper: $('.js-s3d__slideModule'),
    });
    const appController = new AppController(app, appView);
    app.init();
    $(window).resize(() => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    });
  });
}

window.checkValue = val => !val || val === null || val === undefined || (typeof val === 'number' && isNaN(val));
