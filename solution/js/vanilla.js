const isIEBrowser = () => {
  return (!document.attachEvent || typeof document.attachEvent === "undefined" ? false : true);
}

const onPageLoad = () => {
  console.log('document is ready');
}

const addEventToDocument = (function(onPageLoad) {
  if(onPageLoad && typeof onPageLoad === 'function'){
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