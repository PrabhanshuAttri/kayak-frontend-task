class Store {
  constructor(data) {
    this.data = this.parseData(data);
  }

  parseData(data) {
    const destinationData = {};
    const categoryDestinationsMapping = {};
    let seasonCategoriesMapping = {};

    if(data) {
      const { destinations, seasonCategories} = data;
      seasonCategoriesMapping = seasonCategories;

      for(let i = 0; i < destinations.length; i++) {
        const item = destinations[i];
        const { id, name, country, category } = item;
        destinationData[id] = { id, name, country }
        if(category in categoryDestinationsMapping) {
          categoryDestinationsMapping[category].push(id);
        } else {
          categoryDestinationsMapping[category] = [id];
        }
      }
    }
    return ({
      destinationData,
      categoryDestinationsMapping,
      seasonCategoriesMapping
    });
  }

  getSeasons() {
    return Object.keys(this.data.seasonCategoriesMapping);
  }

  getCategories(key) {
    if(key && key in this.data.seasonCategoriesMapping) {
      return this.data.seasonCategoriesMapping[key];
    }
    return [];
  }

  getDestinations(key) {
    const destinations = [];
    if(key && key in this.data.categoryDestinationsMapping) {
      const destinationsList = this.data.categoryDestinationsMapping[key];
      for(let i = 0; i < destinationsList.length; i++) {
        const dest = this.data.destinationData[destinationsList[i]];
        if(dest) {
          destinations.push(dest);
        }
      }
    }
    return destinations;
  }

  getDestinationInfo(id) {
    return (id && id in this.data.destinationData) ? this.data.destinationData[id] : null;
  }

  getImageList() {
    return ['default-cover.webp', ...Object.keys(this.data.destinationData).map((i) => {
      const {id, name} = this.data.destinationData[i];
      console.log('c', name);
      return `${name.toLowerCase().replace(' ', '-')}-${id}.webp`;
    })];
  }
}

export default Store;