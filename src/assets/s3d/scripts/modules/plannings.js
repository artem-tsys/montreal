import $ from 'jquery';
import _ from 'lodash';
import paginationScroll from './pagination';
import {
  preloader, updateFlatFavourite,
} from './general/General';

class Plannings {
  constructor(conf) {
    this.getFlat = conf.getFlat;
    this.setFlat = conf.setFlat;
    this.subject = conf.subject;
    this.wrap = '.js-s3d-pl__list';
    this.wrapperNode = document.querySelector('.js-s3d-pl__list');
    this.activeFlat = conf.activeFlat;
    this.currentFilterFlatsId$ = conf.currentFilterFlatsId$;
    this.currentShowAmount = 0;
    this.showFlatList = [];
    this.updateFsm = conf.updateFsm;
    this.history = conf.history;
    this.preloader = preloader();
  }

  init() {
    if (status === 'local') {
      $.ajax(`${defaultModulePath}template/card.php`).then(response => {
        this.templateCard = JSON.parse(response);
        this.subscribeFilterFlat();
        setTimeout(() => {
          this.preloader.turnOff($('.js-s3d__select[data-type="plannings"]'));
          this.preloader.hide();
        }, 600);
      });
    } else {
      $.ajax('/wp-admin/admin-ajax.php', {
        method: 'POST',
        data: { action: 'getCard' },
      }).then(response => {
        this.templateCard = JSON.parse(response);
        this.subscribeFilterFlat();
        setTimeout(() => {
          this.preloader.turnOff($('.js-s3d__select[data-type="plannings"]'));
          this.preloader.hide();
        }, 600);
      });
    }

    this.subject.subscribe(data => {
      updateFlatFavourite(this.wrap, data);
    });

    $('.js-s3d-pl__list').on('click', '.js-s3d-card', event => {
      if (event.target.classList.contains('js-s3d-add__favourites') || event.target.nodeName === 'INPUT') {
        return;
      }
      const id = $(event.currentTarget).data('id');
      this.activeFlat = id;
      this.history.update({ type: 'flat', method: 'general', id });
      this.updateFsm({ type: 'flat', method: 'general' }, id);
    });

    this.wrapperNode.addEventListener('scroll', event => {
      paginationScroll(event.target, this.showFlatList, this.currentShowAmount, this.createListCard.bind(this));
    });
  }

  subscribeFilterFlat() {
    this.currentFilterFlatsId$.subscribe(value => {
      this.wrapperNode.scrollTop = 0;
      this.wrapperNode.textContent = '';
      this.currentShowAmount = 0;

      this.updateShowFlat(value);
      this.createListCard(value, this.wrapperNode, 1);
      paginationScroll(this.wrapperNode, value, this.currentShowAmount, this.createListCard.bind(this));
    });
  }

  updateShowFlat(list) {
    this.showFlatList = list;
  }

  createListCard(flats, wrap, amount) {
    const arr = flats.reduce((previous, current, index) => {
      if (index >= this.currentShowAmount && index < (this.currentShowAmount + amount)) {
        previous.push(this.createCard(this.getFlat(+current)));
      }
      return previous;
    }, []);
    this.currentShowAmount += amount;
    wrap.append(...arr);
  }

  createCard(el) {
    const checked = el.favourite ? 'checked' : '';
    const div = $.parseHTML(this.templateCard)[0];
    div.dataset.id = el.id;
    div.querySelector('[data-key="type"]').innerHTML = el.type || '-';
    div.querySelector('[data-key="id"]').dataset.id = el.id;
    div.querySelector('[data-key="number"]').innerHTML = el.number || '-';
    div.querySelector('[data-key="floor"]').innerHTML = el.floor;
    div.querySelector('[data-key="rooms"]').innerHTML = el.rooms;
    div.querySelector('[data-key="area"]').innerHTML = el.area;
    div.querySelector('[data-key="src"]').src = el['img_small'] ? el['img_small'] : `${defaultProjectPath}/s3d/images/examples/no-image.png`;
    // div.querySelector('[data-key="src"]').src = el['img_small'] ? defaultProjectPath + el['img_small'] : `${defaultProjectPath}/s3d/images/examples/no-image.png`;
    div.querySelector('[data-key="checked"]').checked = checked;

    return div;
  }
}

export default Plannings;
