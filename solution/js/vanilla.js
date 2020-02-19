import Store from './modules/Store';
import ElementClass from './modules/DropdownElement';

const { DomElement, DropdownElement } = ElementClass;

const apiUrl = '/dist/assets/tour-data.json';

// check for IE browser
const isIEBrowser = () => (!(!document.attachEvent || typeof (document.attachEvent) === 'undefined'));

const getAssetPath = (res) => `/dist/assets/images/${res}`;

// check for webp image support
const canUseWebP = () => {
  const elem = document.createElement('canvas');
  return elem.getContext && elem.getContext('2d') && elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
};

const getImageExtension = () => (canUseWebP() ? 'webp' : 'jpg');

const getImagePath = (name = 'default-cover', id) => {
  const ext = getImageExtension();
  if (id) {
    return getAssetPath(`${name.toLowerCase().replace(' ', '-')}-${id}.${ext}`);
  }
  // show default image incase of no destination selection
  return getAssetPath(`default-cover.${ext}`);
};


const fetchData = async () => fetch(apiUrl).then((response) => {
  if (response.status !== 200) {
    throw `Looks like there was a problem. Status Code: ${response.status}`;
  }
  return response.json();
});

const onPageLoad = () => {
  // loader animation div
  const loaderEle = new DomElement('loader');

  // content div
  const contentEle = new DomElement('content');
  fetchData().then((data) => {
    // maintain prefetched images to avoid unnecessary calls
    const preFetchArr = [];
    const store = new Store(data);

    const bannerEle = new DomElement('banner');
    const bannerTextEle = new DomElement('banner-text');
    const submitBtn = new DomElement('submit');

    // filters
    const seasonEle = new DropdownElement('season');
    const categoryEle = new DropdownElement('category');
    const destinationEle = new DropdownElement('destination');

    // initial state
    loaderEle.hide();
    contentEle.show();
    // show default image incase of no destination selection
    bannerEle.setStyle({ backgroundImage: `url(${getImagePath()})` });

    submitBtn.onClick((e) => {
      e.preventDefault();
      const selectedValue = destinationEle.getSelectedValue();
      const dest = store.getDestinationInfo(selectedValue);
      console.log('d', selectedValue, destinationEle);
      
      if (dest) {
        const { id, name, country } = dest;
        bannerTextEle.setText(`${name}, ${country}`);
        bannerEle.setStyle({ backgroundImage: `url(${getImagePath(name, id)})` });
      }
    });

    // load seasons and add events
    seasonEle.addOptions(store.getSeasons());
    seasonEle.onChange((selectedValue) => {
      // load categories
      categoryEle.addOptions(store.getCategories(selectedValue));

      // clear destinations as given in the specifications
      destinationEle.removeAllOptions();

      // reset banner image on change, as given in the specifications
      // show default image incase of no destination selection
      bannerEle.setStyle({ backgroundImage: `url(${getImagePath()})` });
    });


    categoryEle.onChange((selectedValue) => {
      // reset banner image on change, as given in the specifications
      // show default image incase of no destination selection
      bannerEle.setStyle({ backgroundImage: `url(${getImagePath()})` });

      // load destinations
      destinationEle.addOptions(store.getDestinations(selectedValue), {
        itemParser: (item) => {
          if (item) {
            const { id, name, country } = item;

            // prefetch images on category update
            // reduces load time and improves user experience
            if(!preFetchArr.includes(id)) {
              const img = new Image();
              img.src = getImagePath(name, id);
              preFetchArr.push(id);
            }

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
      // Image and text update was placed here but moved to `on submit button click`.
    });
  }).catch((err) => {
    // in case things go south
    const ele = document.createElement('h3');
    ele.innerHTML = err;

    contentEle.removeContent();
    contentEle.addChild(ele);
    loaderEle.hide();
    contentEle.show();
  });
};


// trigger on page load
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
