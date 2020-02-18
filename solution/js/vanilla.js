import Store from './modules/Store';
import ElementClass from './modules/DropdownElement';

const {DomElement, DropdownElement} = ElementClass;

const apiUrl = '/dist/assets/tour-data.json';

const isIEBrowser = () => {
  return (!document.attachEvent || typeof (document.attachEvent) === "undefined" ? false : true);
}

const getAssetPath = (res) => {
  return `/dist/assets/images/${res}`;
}

const fetchData = async () => {
  return fetch(apiUrl).then((response) => {
    if (response.status !== 200) {
      throw `Looks like there was a problem. Status Code: ${response.status}`;
    }
    return response.json();
  });
}

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

    bannerEle.setStyle({backgroundImage: `url(${getAssetPath('default-cover.webp')})`});
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
          if(item) {
            const { id, name, country } = item;
            const img = new Image();
            img.src = getAssetPath(`${name.toLowerCase().replace(' ', '-')}-${id}.webp`)
            
            return {
              value: id,
              text: `${name}, ${country}`,
            };
          }
        }
      });
    });

    destinationEle.onChange((selectedValue) => {
      const dest = store.getDestinationInfo(selectedValue);
      if(dest) {
        const { id, name, country } = dest;
        const bannerPath = getAssetPath(`${name.toLowerCase().replace(' ', '-')}-${id}.webp`);
        bannerTextEle.setText(`${name}, ${country}`);
        bannerEle.setStyle({backgroundImage: `url(${bannerPath})`});
      }
    });

    // prefetch images 
    // disabling
    /*
    const prefetchImageArr = store.getImageList();
    for(let i = 0; i < prefetchImageArr.length; i++) {
      const img = new Image();
      img.src = getAssetPath(prefetchImageArr[i]);
    }
    */
  }).catch((err) => {
    console.error('err', err);

    const ele = document.createElement('h3');
    ele.innerHTML = err;

    contentEle.removeContent();
    contentEle.addChild(ele);
    loaderEle.hide();
    contentEle.show();
  });
}

const addEventToDocument = (function(onPageLoad) {
  if(onPageLoad && typeof (onPageLoad) === 'function'){
    if(!isIEBrowser()) {
      document.addEventListener("DOMContentLoaded", onPageLoad);
    } else {
      document.attachEvent("onreadystatechange", function() {
        if(document.readyState === "complete") {
          return onPageLoad();
        }
      });
    }
  } else {
    console.error('The callback is not a function!');
  }
  return onPageLoad
});

(function(document, window, addEventToDocument, undefined) {
  addEventToDocument(onPageLoad);
})(document, window, addEventToDocument);