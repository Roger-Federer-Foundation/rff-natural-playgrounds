// Android apps need to use a plugin to open local pdf files
// but these files first need to be moved from inside the app to
// the external data directory, because the pdf viewer doesn't have
// permission to go inside the app to look for them.

// https://www.raymondcamden.com/2016/06/26/linking-to-pdfs-in-cordova-apps
// https://github.com/pwlin/cordova-plugin-file-opener2/issues/28#issuecomment-218442994


function copyPDF(filename) {
	'use strict';
	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + '/www/downloads/' + filename, function (fileEntry) {
	    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dirEntry) {
	        fileEntry.copyTo(dirEntry, filename, function (newFileEntry) {
	            cordova.plugins.fileOpener2.open(newFileEntry.nativeURL, 'application/pdf');
	        });
	    });
	});
}

function preparePDFButtons() {
	var downloadPDFButtons = document.querySelectorAll('.download-pdf');
	downloadPDFButtons.forEach(function (button) {
		button.addEventListener('click', function () {
			event.preventDefault();
			var filename = event.target.href.split('/').pop();
			copyPDF(filename);
		});
	});
}

if (window.isFilePluginReadyRaised) {
	preparePDFButtons();
} else {
	document.addEventListener('filePluginIsReady', preparePDFButtons(), false);
}
