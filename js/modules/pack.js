var packModule = {
  loadPack: function (packName) {
    return new Promise(resolve => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", packModule.getPackPath(packName, "packinfo.json"));
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        }
      }
      xhr.send(null);
    });
  },
  getPackPath: function (packName, file) {
    return `pack/${packName}/${file}`;
  }
};
module.exports = packModule;