class DomElement {
  constructor(id) {
    this.element = document.getElementById(id);
  }

  addClass(className) {
    this.element.classList.add(className);
  }

  removeClass(className) {
    this.element.classList.remove(className);
  }

  show() {
    this.removeClass('hidden');
  }

  hide() {
    this.addClass('hidden');
  }

  setText(text) {
    this.element.innerHTML = text;
  }

  addEvent(event, callback) {
    if(typeof callback === 'function') {
      this.element.addEventListener(event, callback);
    }
  }

  onClick(callback) {
    this.addEvent('click', callback);
  }

  addChild(ch) {
    this.element.appendChild(ch)
  }

  removeContent() {
    this.element.innerHTML = '';
  }

  setAttribute(attributes, element) {
    const ele = element ? element : this.element;
    if(attributes) {
      const attributeKeys = Object.keys(attributes);
      for(let i = 0; i < attributeKeys.length; i++) {
        ele.setAttribute(attributeKeys[i], attributes[attributeKeys[i]]);
      }
    }
  }

  setStyle(style) {
    if(style) {
      const styleKeys = Object.keys(style);
      for(let i = 0; i < styleKeys.length; i++) {
        this.element.style[styleKeys[i]] = style[styleKeys[i]];
      }
    }
  }
}

export class DropdownElement extends DomElement {
  constructor(id) {
    super(id);
    this.name = id.charAt(0).toUpperCase() + id.slice(1);
    this.addPlaceHolder(this.name);
    this.setAttribute({ tabindex: 0})
  }

  addOption(itemName, {
    value,
    isPlaceHolder,
    attributes
  } = {
    isPlaceHolder: false,
    attributes: []
  }) {
    const opt = document.createElement('option');
    opt.innerHTML = itemName;
    if(isPlaceHolder) {
      opt.selected = true;
      opt.disabled = true;
      opt.value = "";
      opt.hidden = true;
    } else {
      opt.value = value || itemName;
    }
    this.setAttribute(attributes, opt);
    this.addChild(opt);
  }

  addOptions(options, {
    itemParser,
    onChange
  } = {
    itemParser: (item) => item,
  }) {
    this.removeAllOptions();
    for(let i = 0; i < options.length; i++) {
      const item = itemParser(options[i]);
      const itemName = typeof item === 'string' ? item : item.text;
      const value = typeof item === 'string' ? item : item.value;
      this.addOption(itemName, { value, attributes: { ['data-value']: value }});
    }
    if(options.length > 0) {
      this.enable();
    }
  }

  addPlaceHolder(text) {
    this.addOption(text, { isPlaceHolder: true });
  }

  onChange(callback) {
    this.addEvent('change', (e) => {
      const { target: { value }} = e;
      callback(value, e);
    });
  }

  enable() {
    this.element.disabled = false;
  }

  disable() {
    this.element.disabled = true;
  }

  removeAllOptions() {
    for(let i = this.element.options.length - 1 ; i >= 0 ; i--) {
      this.element.remove(i);
    }
    this.addPlaceHolder(this.name);
    this.disable();
  }
}

export default DomElement;