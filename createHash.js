var crypto = require('crypto');
var fs = require('fs-extra');
var checksum;
var stream;
module.exports = function(file, cback) {
  checksum = crypto.createHash('md5');
  if (cback && typeof cback === 'function') {
    stream = fs.createReadStream(file);
    stream.on('error', function (error) {
      return cback(error, null);
    });
    stream.on('data', function (data) {
      try {
        checksum.update(data);
      } catch (ex) {
        return cback(ex, null);
      }
    });
    stream.on('end', function () {
      return cback(null, checksum.digest('hex'));
    });
  } else {
    checksum.update(fs.readFileSync(file));
    return checksum.digest('hex');
  }
};