/* For this project, the video files need to be copied from an SD card
into the app data file upon first launch of the app

We can't use an expansion file approach due to bandwidth limitations

This all also needs to work when the app is not being loaded by RFF,
but we can't use an expansion file, so we'll host the files on the site
and trigger a direct download from there */

/*jslint browser */
/*global alert, console, cordova, FileTransfer  */

const filelist = [
    "npt-video-1.mp4", "npt-video-2.mp4", "npt-video-3.mp4",
    "npt-video-4.mp4", "npt-video-5.mp4", "npt-video-6.mp4"
];


function ebDownloadVideosFromTheInternet() {
    "use strict";

    let j = 1;

    alert(
        "Please wait while the video files download. " +
        "This could take a few minutes, depending on your internet connection."
    );

    function downloadSuccess(j) {
        alert(`File ${j} of 6 has downloaded successfully.`);
    }

    // Access the JSON file on our server, containing the filenames and the URLs
    // at which RFF are hosting the video files.
    let getVideoFileURLs = new Promise(function () {
        fetch("https://rff.ebw.co/URLList.json")
        .then(function (response) {
            return response.text();
        })
        .then(function (text) {
            const jsonData = JSON.parse(text);
            const dataPairList = jsonData["dataPairList"];

            // loop over each pair of [dst-filename, src-url] in the json data
            dataPairList.forEach(function (datapair) {
                let src = datapair[1];
                let dst = cordova.file.dataDirectory + datapair[0];

                let fileTransfer = new FileTransfer();
                fileTransfer.download(
                    src,
                    dst,
                    downloadSuccess(j),
                    function (error) {
                        console.log(error);
                    }
                );
                j += 1;
            });
        });
    });
}


function ebCopyVideosFromSDCard() {
    "use strict";

    let j = 1;
    const dst = cordova.file.dataDirectory;

    alert(
        "Please wait while the video files copy from the SD card. " +
        "This could take a few minutes."
    );

    function copySuccess(j) {
        alert(`File ${j} of 6 has transferred successfully.`);
    }

    filelist.forEach(function (filename) {
        let src = cordova.file.sdRoot + "//npt/" + filename;

        window.resolveLocalFileSystemURL(src, function (newFileEntry) {
            window.resolveLocalFileSystemURL(dst, function (dirEntry) {
                newFileEntry.copyTo(dirEntry, filename, copySuccess(j));
                j += 1;

            }, function onFailure(error) {
                console.log("fail to resolve dirEntry");
                console.log(error);
            });
        }, function onFailure(error) {
            console.log("fail to resolve fileEntry ");
            console.log(error);
        });
    });
}


function ebCheckForSDCard() {
    "use strict";

    cordova.plugins.diagnostic.getExternalSdCardDetails(function (details) {
        if (details.length === 0) {
            ebDownloadVideosFromTheInternet();
        } else {
            details.forEach(function (detail) {
                if (detail.type === "root") {
                    // set new file parameter
                    cordova.file.sdRoot = detail.filePath;

                    // Check whether SD card contains the video files
                    // The forth file is the largest and therefore most likely
                    // to be the last one to copy over
                    let src = cordova.file.sdRoot + "//npt/" + filelist[3];

                    window.resolveLocalFileSystemURL(
                        src,
                        // if card contains files
                        ebCopyVideosFromSDCard,
                        // else
                        ebDownloadVideosFromTheInternet
                    );
                }
            });
        }
    });
}


function ebRequestExternalSdPermission() {
    "use strict";
    // Produces a standard popup on the device, requesting permission
    // to write to the device (so that we can copy videos onto the device)
    // Inspo:
    // https://github.com/dpa99c/cordova-diagnostic-plugin#example-usage-1
    cordova.plugins.diagnostic.requestRuntimePermission(function (status) {
        switch (status) {
        case cordova.plugins.diagnostic.permissionStatus.GRANTED:
            // console.log("Permission granted");
            ebCheckForSDCard();
            break;
        case cordova.plugins.diagnostic.permissionStatus.DENIED:
            console.log("Permission denied");
            break;
        case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
            console.log("Permission permanently denied");
            break;
        }
    }, function (error) {
        console.log(error);
    }, cordova.plugins.diagnostic.permission.WRITE_EXTERNAL_STORAGE);
}


function ebCheckDeviceForVideoFiles() {
    "use strict";
    // Check whether the video files are currently in the app data folder
    window.resolveLocalFileSystemURL(
        cordova.file.dataDirectory + filelist[0],
        // If they're already in place, do nothing
        function success() {
            console.log("Files are already in place.");
        },
        // else, start looking for an SD card
        function failure() {
            ebRequestExternalSdPermission();
        }
    );
}


document.addEventListener("deviceready", function () {
    if (window.isFilePluginReadyRaised) {
        ebCheckDeviceForVideoFiles();
    } else {
        document.addEventListener(
            "filePluginIsReady",
            ebCheckDeviceForVideoFiles(),
            false
        );
    }
});