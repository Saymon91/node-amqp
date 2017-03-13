module.exports = {};

module.exports.safe = {
  get: function (object, path) {
    var result = null;
    if (!object) {
      return result;
    }

    var pathArray = path.split('.');
  },
  set: function (object, path, value) {

  }
}
