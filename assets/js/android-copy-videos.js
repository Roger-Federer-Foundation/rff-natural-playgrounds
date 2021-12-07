/* For this project, the video files need to be copied from an SD card
into the app data file upon first launch of the app.

We can't include the videos in the app itself, due to bandwidth limitations as
well as limitations from the Google Play store.

The six video files live in a folder called "npt" in the root directorty of the
SD card.

This all also needs to work when the app is not being loaded by RFF (i.e. if
a random person downloads the app from the store), so we'll host the files on
a server as well, and trigger a direct download from there in the case where
there is no SD card. */

/*jslint browser */
/*global alert, console, cordova, FileTransfer, fetch  */

const filelist = [
    "npt-video-1.mp4", "npt-video-2.mp4", "npt-video-3.mp4",
    "npt-video-4.mp4", "npt-video-5.mp4", "npt-video-6.mp4"
];


function ebDownloadVideosFromTheInternet() {
    "use strict";

    alert(
        "Please wait while the video files download. " +
        "This could take a few minutes, depending on your internet connection. "
    );

    // Access the JSON file on our server, containing the filenames and the URLs
    // at which RFF are hosting the video files.
    let getVideoFileURLs = new Promise(function () {
        fetch("https://rff.ebw.co/URLList.json")
        .then(function (response) {
            return response.text();
        })
        .then(function (text) {
            const jsonData = JSON.parse(text);
            const dataPairList = jsonData.dataPairList;

            let j = 1;
            // Loop over each pair of [dst-filename, src-url] in the json data
            dataPairList.forEach(function (datapair) {
                let src = datapair[1];
                let dst = cordova.file.dataDirectory + datapair[0];

                // Use the cordova-plugin-file-transfer plugin
                let fileTransfer = new FileTransfer();
                fileTransfer.download(
                    src,
                    dst,
                    function (entry) {
                        alert(`Video ${j} of 6 has downloaded successfully. Hit OK to continue.`);
                        if (j === 6) {
                            ebDeactivateVideoLoadingMessage();
                        }
                        j += 1;
                    },
                    function (error) {
                        console.log(error);
                    }
                );
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
        "This could take a few minutes. "
    );

    filelist.forEach(function (filename) {
        // Find the files on the SD card
        let src = cordova.file.sdRoot + "//npt/" + filename;

        window.resolveLocalFileSystemURL(src, function (newFileEntry) {
            window.resolveLocalFileSystemURL(dst, function (dirEntry) {
                // Use the cordova-plugin-file plugin to copy the files
                newFileEntry.copyTo(
                    dirEntry,
                    filename,
                    function copySuccess () {
                        alert(`Video ${j} of 6 has transferred successfully. Hit OK to continue.`);
                        if (j === 6) {
                            ebDeactivateVideoLoadingMessage();
                        }
                        j += 1;
                    });
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

    // Use the cordova.plugins.diagnostic plugin to get the SD card name
    cordova.plugins.diagnostic.getExternalSdCardDetails(function (details) {
        console.log(details);
        if (details.length === 0) {
            // If no SD card is detected in the device
            ebDownloadVideosFromTheInternet();
        } else {
            console.log(details);
            details.forEach(function (detail) {
                if (detail.type === "root") {
                    // Set new file parameter
                    cordova.file.sdRoot = detail.filePath;

                    // Check whether SD card contains the video files.
                    // The fourth file is the largest and therefore most likely
                    // to be the last one to copy over.
                    let src = cordova.file.sdRoot + "//npt/" + filelist[3];

                    window.resolveLocalFileSystemURL(
                        src,
                        // If card contains files
                        ebCopyVideosFromSDCard,
                        // Else
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
            console.log("Permission granted");
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

function ebActivateVideoLoadingMessage () {
    "use strict";

    // This activates a loading screen, so that the user cannot interrupt
    // the video loading process by navigating to a different page in the app,
    // until the videos have all copied.

    let loadingMessage = document.querySelector(".video-loading-notification-wrapper");

    if (loadingMessage && loadingMessage.classList.contains("visuallyhidden")) {
        loadingMessage.classList.remove("visuallyhidden"); // unhide the message
        let allPageLinks = document.querySelectorAll("a");
        allPageLinks.forEach(function(link) {
            link.setAttribute("style", "pointer-events: none");
        });
    }
}

function ebDeactivateVideoLoadingMessage () {
    "use strict";
    let loadingMessage = document.querySelector(".video-loading-notification-wrapper");

    if (loadingMessage) {
        loadingMessage.classList.add("visuallyhidden");
        let allPageLinks = document.querySelectorAll("a");
        allPageLinks.forEach(function(link) {
            link.setAttribute("style", "pointer-events: auto");
        });
    }
}

function ebCheckDeviceForVideoFiles() {
    "use strict";
    // Check whether the video files are currently in the app data folder
    window.resolveLocalFileSystemURL(
        cordova.file.dataDirectory + filelist[0],
        // If they're already in place, do nothing
        // This will be the case when the JS loads on all other pages of the book
        function success() {
            console.log("Files are already in place.");
        },
        // Else, start looking for an SD card
        function failure() {
            ebActivateVideoLoadingMessage();
            ebRequestExternalSdPermission();
        }
    );
}

// Wait for the cordova file plugin to load, before continuing
document.addEventListener("deviceready", function () {
    "use strict";
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
