window.tiledFixer = function (map) {
  map.layers = map.layers.map((layer) => {
    if (!layer.properties) return layer;
    if (Array.isArray(layer.properties)) {
      let newProps = {};
      let newPropTypes = {};
      layer.properties.map((property) => {
        newProps[property.name] = property.value;
        newPropTypes[property.name] = property.type;
      });
      layer.properties = newProps;
      layer.propertytypes = newPropTypes;
    }
    return layer;
  });
  map.tilesets = map.tilesets.map((tileset) => {
    if (!tileset.tiles) return tileset;
    if (!Array.isArray(tileset.tiles)) return tileset;

    let newTiles = {};
    for (let el of tileset.tiles) {
      let a = new Set(Object.keys(el));
      a.delete("id");
      if (a.size > 0) {
        newTiles[el.id] = {};
        for (let k of a) {
          newTiles[el.id][k] = el[k];
        }
      }
    }
    tileset.tiles = newTiles;
    return tileset;
  });

  return map;
};

{
  DataManager.loadTiledMapData = function (mapId) {
    const path = require("path");
    const fs = require("fs");
    const base = path.dirname(process.mainModule.filename);
    if (Utils.isOptionValid("test")) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "./maps/Map" + mapId + ".json");
      xhr.overrideMimeType("application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.responseText !== "") {
            DataManager._tempTiledData = window.tiledFixer(
              JSON.parse(xhr.responseText),
            );
          }
          DataManager.loadTilesetData();
          DataManager._tiledLoaded = true;
        }
      };
      this.unloadTiledMapData();
      xhr.send();
    } else {
      const mapName = `/maps/map${mapId}.AUBREY`;
      this.unloadTiledMapData();
      fs.readFile(path.join(base, mapName), (err, buffer) => {
        if (!!err) {
          console.error(err);
          Graphics.printLoadingError(base + mapName);
          SceneManager.stop();
        }
        let decrypt = Encryption.decrypt(buffer);
        DataManager._tempTiledData = window.tiledFixer(
          JSON.parse(decrypt.toString()),
        );
        DataManager.loadTilesetData();
        DataManager._tiledLoaded = true;
      });
    }
  };
  let old_unload = DataManager.unloadTiledMapData
  DataManager.unloadTiledMapData = function () {
      old_unload.call(this)
      DataManager._hasMutateMap = false
  };
  let old_isload = DataManager.isMapLoaded
  DataManager.isMapLoaded = function() {
    let result = old_isload.call(this)
    let tiledLoaded = DataManager._tilesetToLoad <= 0 &&
                      DataManager._tiledLoaded        &&
                      result
    if (tiledLoaded && !DataManager._hasMutateMap) {
      DataManager._tempTiledData = window.tiledFixer(DataManager._tempTiledData)
      DataManager._hasMutateMap = true
    }
    return result
  }
}
