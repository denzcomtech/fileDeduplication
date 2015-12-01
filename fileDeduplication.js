// usage: node fileDeduplication.js "path" options
// example: node fileDeduplication.js "/Users/dennis/tmp/testerlist" "recursive" "no-delete" = path: "/Users/dennis/tmp/testerlist" options: "recursive" means all folder with subfolders, "no-delete" means dont delete all searched files just list instead
// example2: node fileDeduplication.js "/Users/dennis/tmp/testerlist" "no-recursive" "delete" = path: "/Users/dennis/tmp/testerlist" options: "no-recursive" means list all files within the folder(path) only, "delete" means delete all searched duplicated files

var crypto = require('crypto');
var fs = require('fs-extra');
var recursive = require('recursive-readdir');
var clc = require('cli-color');
var hashArray = [];
var dupliArray = [];
var origArray = [];
var pathArgs = process.argv[2];
var currentDirArgs = process.argv[3];
var delArgs = process.argv[4];
var stat = "recursively";

process.stdout.write("\u001b[2J\u001b[0;0H");
if (fs.existsSync(pathArgs)) {
	// console.log(hash('/Users/dennis/tmp/tess ts.sh'));
	recursive(pathArgs, function (err, files) {
	  // files is an array of filename
	  if (currentDirArgs == "no-recursive") {
	  	var files = [];
	  	var dd = fs.readdirSync(pathArgs);
		dd.forEach(function(d) {
			if (!fs.statSync(pathArgs+"/"+d).isDirectory()) {
				files.push(pathArgs+"/"+d);
				// console.log(pathArgs+"/"+d);
			}
		});
		stat = "not recursively";
	  }
	  console.log(clc.bold("Listing duplicated files on "+clc.bold(pathArgs)+" "+stat));
	  files.forEach(function (file) {
	  	// console.log(hash(file));
	  	// console.log(hashArray.indexOf(hash(file)));
	  	if (hashArray.indexOf(hash(file)) > -1) {
	  		// console.log(file);
	  		dupliArray.push(file);
	  		// fs.unlinkSync(file);
	  		console.log(clc.bold("Duplicated file: ") + clc.blue(file));
	  		console.log(clc.bold("Original file: ") + clc.green.bold(origArray[hashArray.indexOf(hash(file))] + "\n"));
	  		// console.log(clc.bold("Deleted file: ") + clc.red(file));
	  	} else {
	  		hashArray.push(hash(file));
	  		origArray.push(file);
	  	}
	  });
	  if (delArgs == "delete") {
	  	console.log(clc.bold("Deleting all duplicated files on "+clc.bold(pathArgs)+" "+stat));
		dupliArray.forEach(function (dupli) {
			// console.log("Duplicated file: " + dupli);
			// console.log("Original file: " + origArray[hashArray.indexOf(hash(dupli))] + "\n");
			fs.unlinkSync(dupli);
			console.log(clc.bold("Deleted file: ") + clc.red(dupli));
		});
	  }
	  if (dupliArray.length < 1) {
	  	console.log(clc.bold("\nNo duplicated found!"));
	  }
	});

}

function hash(file, cback) {
  var checksum = crypto.createHash('md5');
  if (cback && typeof cback === 'function') {
    var stream = fs.createReadStream(file);
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
}