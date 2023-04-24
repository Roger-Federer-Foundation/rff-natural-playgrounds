/* For this project, the video files need to be copied from an SD card
into the app data file upon first launch of the app.

We can't include the videos in the app itself due to bandwidth limitations.

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

function ebCheckForSDCard() {
    "use strict";

    // Only do this part once
    if (window.localStorage.getItem("import-done") !== "true") {
        
        // Use the cordova.plugins.diagnostic plugin to get the SD card name
        cordova.plugins.diagnostic.getExternalSdCardDetails(
            function (data) {

                if (data.length === 0) {

                    // If no SD card is detected in the device, go online
                    ebActivateVideoLoadingMessage();
                    ebDownloadVideosFromTheInternet();

                } else {

                    var sdCardRoot = data[0].path;
                    cordova.plugins.ElkFilesShare.importFile (
                        [sdCardRoot + "/npt/"],
                        function(result){
                            console.log(result);
                            window.localStorage.setItem("import-done", "true");
                        },
                        function(err){
                            console.log(err);
                        }
                    );
                }
            },
            function (error) {
                console.log(error);
            }
        );
    }

    function checkWhetherItsDone () {
        window.resolveLocalFileSystemURL(
            cordova.file.dataDirectory + filelist[3],
        
            // If the file is there, dismiss the popup
            // NOTE: This timeout is not a fancy fix, will need to do something
            // like filesize detection is we want a more accurate timer on the 
            // dismiss call.
            function success() {
                setTimeout(function(){cordova.plugin.progressDialog.dismiss()}, 30000);
            },
        
            // Else, try again
            function failure() {
                checkWhetherItsDone();
            }
        );
    }

    window.plugins.intentShim.getIntent(
        function(intent) {
            
            if (intent.action == 'android.intent.action.SEND_MULTIPLE' && intent.hasOwnProperty('clipItems')) {
                
                if (intent.clipItems.length > 0) {
                
                    var targetSaveDirectory = cordova.file.dataDirectory
                    
                    var params = [
                        intent.clipItems,
                        targetSaveDirectory
                    ];

                    cordova.plugin.progressDialog.init({
                        // theme : 'HOLO_DARK',
                        progressStyle : 'SPINNER',
                        cancelable : true,
                        title : 'Please Wait...',
                        message : 'Copying files to application storage ...',
                    });

                    cordova.plugins.ElkFilesShare.processFile(
                        params,
                        function(result) {
                            console.log(result);
                            checkWhetherItsDone();
                        },
                        function(err) {
                            console.log(err);
                            cordova.plugin.progressDialog.dismiss();
                        }
                    );
                }
            }
        },
        function () {
            console.log('Error getting launch intent');
        }
    );
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

    // This is only used in the case where the user is downloading the files
    // from the remote server.

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
        cordova.file.dataDirectory + filelist[3],
    
        // If they're already in place, do nothing
        // This will be the case when the JS loads on all other pages of the book
        function success() {
            console.log("Files are already in place.");
        },
    
        // Else, start looking for an SD card
        function failure() {
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
