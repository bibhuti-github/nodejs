var http = require('http');
var PORT = 8089;
//var PORT = process.env.PORT || 80;
var topicList = [];
var topicDetail = {};
var currentId = 1234;
var fileSaver= require("file-saver");

function generatexl(lastIndex){
		const csv = require('csv-parser');
		//var fs = require("fs");
	    var jszip = require('jszip');
		var XLSX = require('xlsx');
		var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var zip = new jszip();
		var workbook = XLSX.utils.book_new();
        const path = require('path');
		const fs = require('fs');

		fs.readdir(
		  path.resolve(__dirname, 'csv-folder'),
		  (err, files) => {
			if (err) throw err;
			folderCurrLength=1;
			
			console.log(files.length, 'filelength');
			for (let file of files) {
				let temData= [];
			  console.log(file, 'directory');
			  //const filepath= "Users/Guest-1/Downloads/lims_dev/csv-folder/"+file;
			  
					var fileOutput= fs.createReadStream(__dirname+'/csv-folder/'+file)
					.pipe(csv())
					.on('data', function (row) {
						
						//console.log(row, 'data', Object.keys(row).length)3decsc                           
						if(Object.keys(row).length !== 0){
							temData.push(row);
							return temData;
						}
						
					})
					.on('end', function () {
					  //console.log(temData,'users', count)List
					  topicList.push(temData);
					  var ws = XLSX.utils.json_to_sheet(temData);
						XLSX.utils.book_append_sheet(workbook, ws, file.substr(0, file.lastIndexOf(".")));
						if(folderCurrLength === files.length){
							console.log('inside if', topicList);
							let wbout = XLSX.write(workbook, {bookType: 'xlsx', bookSST: true, type: 'binary'});
							zip.file("test1.xlsx", wbout, {binary: true});
							
							zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
							.pipe(fs.createWriteStream('out1.zip'))
							.on('finish', function () {
								// JSZip generates a readable stream with a "end" event,
								// but is piped here in a writable stream which emits a "finish" event.
								console.log("out.zip written.");
							});
						}
						folderCurrLength++;
					   return XLSX;
					})
			}
			
		  }
		);
}


var server = http.createServer(function (request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);

    console.log('TopicList=' + JSON.stringify(topicList));
    console.log('TopicDetail=' + JSON.stringify(topicDetail));
    var requestBody = '';

    request.on('data', function (data) {
        requestBody += data;
    });

    request.on('end', function () {
        handleRequest(request, response, requestBody);
    });
});

function handleRequest(request, response, requestBody) {
    console.log(request.method + ":" + request.url + ' >>' + requestBody);

    if (request.url == '/') {
        generatexl();
        response.end();
    }else{
		var lastIndex = request.url.substring(1);
		console.log(lastIndex, 'lastIndex');
		//console.log(this.href.substring(this.href.lastIndexOf('/') + 1));
		generatexl(lastIndex);
        response.end();
	}
}

server.listen(PORT, function () {
    console.log('Server running...');
});

function saveAs(blob, filename) {
 
    var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    elem.style = 'display:none;opacity:0;color:transparent;';
    (document.body || document.documentElement).appendChild(elem);
    if (typeof elem.click === 'function') {
      elem.click();
    } else {
      elem.target = '_blank';
      elem.dispatchEvent(new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      }));
    }
    URL.revokeObjectURL(elem.href);
}