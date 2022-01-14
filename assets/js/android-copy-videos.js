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

function manageVideos()
{
   console.log("Manage Videos")
   ///first create list
   let vids=filelist.map(n=>({ name:n, status:"unknown" }));
   let nvids=vids.length;

   function checkAllStatus() {
      let vi=-1;
      function next()
      {
        vi+=1;
        if (vi==nvids) {
          //done All this so show the menu
          showVideoMenu();
          return;
        }
        window.resolveLocalFileSystemURL( //check if the reference exists
          cordova.file.dataDirectory + vids[vi].name,
          (details)=>{ //found it
            vids[vi].status='AVAILABLE';
            next();
          },
          ()=>{ //no such file
            vids[vi].status='MISSING';
            next();
          }
        );
      }
      next();
   }

   function needVids() { //are any missing
     return vids.some(v=>v.status=='MISSING')
   }

   function showVideoMenu()
   {
     let required=needVids();
     document.getElementById("videopanel").classList.toggle("visuallyhidden",!required);
     if (!required) return;
     updateVideoStatus("Some video files are required by this application.",true);
     //bind the buttons
     document.getElementById("videocopy").onclick=()=>{
       document.getElementById('videofilelist').click();
     }
     document.getElementById("videodownload").onclick=()=>{
       downloadFromNet();
     }
     document.getElementById("videoskip").onclick=()=>{
       document.getElementById("videopanel").classList.toggle("visuallyhidden",true);
     }

     //when files are selected
     document.getElementById("videofilelist").onchange=()=>{
       let files=document.getElementById("videofilelist").files;
       console.log(files);
       copyFromFileList(files);
     }

   }


   function updateVideoStatus(message,showMenu)
   {
     document.getElementById("videomenu").classList.toggle("visuallyhidden",!showMenu);
     document.getElementById("videomessage").innerHTML=message;
     document.getElementById("videostatuslist").innerHTML=vids.map(v=>v.name+" - "+v.status).join("\n");
   }

   function copyFromFileList(files)
   {
     for (i=0;i<files.length;i+=1) { //match each if we can
       let file=files.item(i);
       let match=vids.find(v=>v.name==file.name);
       if (match)
         match.fromFile=file;
     }
     let vi=-1;
     function next() {
       updateVideoStatus("Starting Copy",false);
       vi+=1;
       if (vi==nvids) {
         showVideoMenu();
         return;
       }
       if (!vids[vi].fromFile) { next(); //we don't have a file to get it from
                                 return; }
       copyFileToStorage(vids[vi].fromFile,
          (perc)=>{ //progress
               vids[vi].status="COPYING "+perc+"%";
               updateVideoStatus("Copying...",false);
             },
          ()=>{ //successfully
                console.log("success file copy!")
                vids[vi].status="AVAILABLE";
                vids.fromFile=null; //clear any file data and free it
                next();
              },
          ()=>{ //failed
                console.log("failed file copy!")
                vids[vi].status="MISSING";
                vids.fromFile=null; //clear any file data and free it
                next();
          })
     }
     next();
   }


   function downloadFromNet()
   {
       fetch("https://rff.ebw.co/URLList.json")
         .then((response)=>response.text())
         .then((text)=> {
           const jsonData = JSON.parse(text);
           downloadFromURLList(jsonData.dataPairList)
         });
   }

      function downloadFromURLList(files)
      {
        console.log(files);
        for (i=0;i<files.length;i+=1) { //match each if we can
          let match=vids.find(v=>v.name==files[i][0]);
          if (match)
            match.fromURL=files[i][1];
        }
        let vi=-1;
        function next() {
          updateVideoStatus("Starting Download",false);
          vi+=1;
          if (vi==nvids) {
            showVideoMenu();
            return;
          }
          if ((vids[vi].status=="AVAILABLE")||(!vids[vi].fromURL)) { //we don't need it or don't have a URL to get it from
            next();
            return; }

          // Use the cordova-plugin-file-transfer plugin to downlaod the file
          console.log("create file transfer",vids[vi].fromURL,cordova.file.dataDirectory+vids[vi].name)
          let fileTransfer = new FileTransfer();
          fileTransfer.onprogress=(p)=>{
            let perc=Math.round(p.loaded*100/(p.total+1));
            vids[vi].status="Downloading "+perc+"%";
            updateVideoStatus("Downloading...");
          };
          fileTransfer.download(
            vids[vi].fromURL,
            cordova.file.dataDirectory+'TMP_'+vids[vi].name,
            ()=>{
              console.log("got file")
              renameFile("TMP_"+vids[vi].name,vids[vi].name)
              vids[vi].status="AVAILABLE";
              vids.fromURL=null; //clear any URL
              next();
            },
            ()=>{
              console.log("failed download")
              vids[vi].status="MISSING";
              vids.fromURL=null; //clear any URL
              next();
            }
         )
        }
        next();
      }
      checkAllStatus(); //actually start these checks
   }

   function renameFile(oldName,newName)
   {
     window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (dirEntry) => {
       dirEntry.getFile(oldName, {  }, (oldFile)=>{
           oldFile.moveTo(dirEntry,newName,()=>console.log("rename complete"),()=>console.log("rename failed"));
       });
     });
   }

   checkAllStatus(); //actually start these checks
}

function copyFileToStorage(file,pcb,scb,fcb) {
  window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (dirEntry) => {
    dirEntry.getFile(file.name, {
        create: true,
        exclusive: false
      }, (fileEntry) => {
        fileEntry.createWriter((fileWriter) => {
          let BLOCK_SIZE=1000000;
          let written=0;
          function writeNext() {
            var sz = Math.min(BLOCK_SIZE, file.size - written);
            if (sz<=0) {
              scb();
              return; //all done
            }
            var sub = file.slice(written, written+sz);
            pcb(Math.round(written*100/file.size));
            written += sz;
            fileWriter.write(sub);
          }
          fileWriter.onwrite = function() {
            writeNext();
          };

          fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
            fcb();
          };

          fileWriter.onabort = function(e) {
            console.log("aborted: " + e.toString());
            fcb();
          };

          writeNext();
        })
      },
      (e) => {
        fcb();
      });
  }, (e) => {
    fcb();
  });
}

// Wait for the cordova file plugin to load, before trying to sort out the videos
document.addEventListener("deviceready", function() {
  "use strict";
  if (window.isFilePluginReadyRaised) {
    manageVideos();
  } else {
    document.addEventListener(
      "filePluginIsReady",
      manageVideos(),
      false
    );
  }
});
