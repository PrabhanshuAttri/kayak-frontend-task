import Store from './modules/Store';
import ElementClass from './modules/DropdownElement';

const { DomElement, DropdownElement } = ElementClass;

const apiUrl = '/dist/assets/tour-data.json';

const isIEBrowser = () => (!(!document.attachEvent || typeof (document.attachEvent) === 'undefined'));

const getAssetPath = (res) => `/dist/assets/images/${res}`;

const canUseWebP = () => {
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    // was able or not to get WebP representation
    return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
  }
  // very old browser like IE 8, canvas not supported
  return false;
};

const getImageExtension = () => (canUseWebP() ? 'webp' : 'jpg');

const getImagePath = (name = 'default-cover', id) => {
  const ext = getImageExtension();
  console.log('ext', ext);
  if (id) {
    return getAssetPath(`${name.toLowerCase().replace(' ', '-')}-${id}.${ext}`);
  }
  return getAssetPath('default-cover.webp');
};

const fetchData = async () => fetch(apiUrl).then((response) => {
  if (response.status !== 200) {
    throw `Looks like there was a problem. Status Code: ${response.status}`;
  }
  return response.json();
});

const onPageLoad = () => {
  const loaderEle = new DomElement('loader');
  const contentEle = new DomElement('content');
  fetchData().then((data) => {
    const store = new Store(data);

    const bannerEle = new DomElement('banner');
    const bannerTextEle = new DomElement('banner-text');
    const submitBtn = new DomElement('submit');

    const seasonEle = new DropdownElement('season');
    const categoryEle = new DropdownElement('category');
    const destinationEle = new DropdownElement('destination');

    bannerEle.setStyle({ backgroundImage: `url(${getImagePath()})` });
    loaderEle.hide();
    contentEle.show();

    submitBtn.onClick((e) => {
      e.preventDefault();
    });

    seasonEle.addOptions(store.getSeasons());
    seasonEle.onChange((selectedValue) => {
      categoryEle.addOptions(store.getCategories(selectedValue));
      destinationEle.removeAllOptions();
    });

    categoryEle.onChange((selectedValue) => {
      destinationEle.addOptions(store.getDestinations(selectedValue), {
        itemParser: (item) => {
          if (item) {
            const { id, name, country } = item;

            // prefetch images on category update
            // reduces load time and improves user experience
            const img = new Image();
            img.src = getImagePath(name, id);

            return {
              value: id,
              text: `${name}, ${country}`,
            };
          }
          return item;
        },
      });
    });

    destinationEle.onChange((selectedValue) => {
      const dest = store.getDestinationInfo(selectedValue);
      if (dest) {
        const { id, name, country } = dest;
        bannerTextEle.setText(`${name}, ${country}`);
        bannerEle.setStyle({ backgroundImage: `url(${getImagePath(name, id)})` });
      }
    });
  }).catch((err) => {
    const ele = document.createElement('h3');
    ele.innerHTML = err;

    contentEle.removeContent();
    contentEle.addChild(ele);
    loaderEle.hide();
    contentEle.show();
  });
};

const addEventToDocument = ((onPageLoad) => {
  if (onPageLoad && typeof (onPageLoad) === 'function') {
    if (!isIEBrowser()) {
      document.addEventListener('DOMContentLoaded', onPageLoad);
    } else {
      document.attachEvent('onreadystatechange', () => {
        if (document.readyState === 'complete') {
          return onPageLoad();
        }
      });
    }
  }
  return onPageLoad;
});

(function (document, window, addEventToDocumentMethod) {
  addEventToDocumentMethod(onPageLoad);
}(document, window, addEventToDocument));
