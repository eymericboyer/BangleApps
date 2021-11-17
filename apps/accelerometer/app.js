var counterInterval;
var hertz = 25; //max 25 
var counter = 0;
var fileNumber = 0;
var username = "testerEB";
var hours = 0;
var minutes = 0;
var seconds = 10;
var paused = false;
var initialDuration;

//Allow to create file name
function getFileName(username, fileNumber) {
  return "accelData." /*+ username*/ + fileNumber + ".csv";
}

var fileName;// = getFileName(username, fileNumber);

//Create file in append mode
var file;// = require("Storage").open(fileName,"a");

function durationInSeconds(hours, minutes, seconds){
   return hours*3600 + minutes * 60 + seconds;
}

//Display Menu
function showMenu() {
  var menu = {
    "" : { title : "User "+username },
    "Exit" : function() {
      load();
    },
    "File Number" : {
      value : fileNumber,
      min : 0,
      max : 9,
      onchange : v => { fileNumber=v; }
    },
    "Minutes" : {
      value : minutes,
      min : 0,
      max : 20,
      onchange : v => { minutes = v;}
    },
    "Seconds" : {
      value : seconds,
      min : 0,
      max : 59,
      onchange : v => { seconds = v;}
    },
    "Hz (max 25)" : {
      value : hertz,
      min : 0,
      max : 25,
      onchange : v => { hertz = v;}
    },
    "Start" : function() {
      E.showMenu();
      startRecording();
    },
  };

  E.showMenu(menu);
}

function getNbAsString(nb) {
  var toReturn = nb.toString();
  if(nb<9){
    toReturn = /*"0"+*/toReturn;
  }
  return toReturn;
}

function outOfTime() {
  if(counterInterval) return;
  
  E.showMessage("Took " + counter + " measurements", initialDuration + "s elapsed");
  Bangle.buzz();
  Bangle.beep(200, 4000)
    .then(() => new Promise(resolve => setTimeout(resolve, 200)))
    .then(() => Bangle.beep(200, 3000));
  
  //repeat after 5s
  setTimeout(outOfTime, 5000);
 
}

function createFirstLine() {
  var firstLine = [
    "Time",
    "X",
    "Y",
    "Z",
    "Diff",
    "Magnitude"
  ];
  file.write(firstLine.join(",")+"\n");
}

function addLine(time, x,y,z,diff, mag) {
  var csv = [
    time/1000,
    x,
    y,
    z,
    diff,
    mag
  ];
  
  file.write(csv.join(",")+"\n");
}

function pauseUnpause() {
  paused = !paused;
}

function printDurationLeft(duration){
  var sec = 0;
  var min = 0;
  var hr = 0;
  if(duration < 3600){
     if(duration < 60) {
       return duration + "s";
     } else {
       sec = duration%60;
       min = (duration - seconds)/60;
       return min + "min & " + sec + "s";
     }
  } else {
    sec = duration % 60;
    min = (duration - seconds)/60;
    hr = (duration - seconds - min*60) % 3600;
    return hr + "h & " + min + "min & " + sec + "s";
  }
}

function countDown() {
  if(!paused) {
    duration = duration-(1/hertz);
    var accel = Bangle.getAccel();
    addLine(Date.now(), accel.x, accel.y, accel.z, accel.diff, accel.mag);
    counter ++;
    if(duration <= 0) {
      clearInterval(counterInterval);
      counterInterval = undefined;
      setWatch(startRecording, BTN2);
      outOfTime();
      return;
    }
  }

  g.clear();
  g.setFontAlign(0,0);
  g.setFont("Vector", 20);
  //draw current counter value
  g.drawString("Time left :", g.getWidth()/2, g.getHeight()/4);
  g.drawString(printDurationLeft(duration), g.getWidth()/2, g.getHeight()/2);
  g.setFont("Vector", 20);
  g.drawString("press BTN1 to pause", g.getWidth()/2, g.getHeight()*3/4);
  g.flip();
}

function startRecording() {
  fileName = getFileName(username, getNbAsString(fileNumber));
  file = require("Storage").open(fileName,"a");
  duration = durationInSeconds(hours, minutes, seconds);
  initialDuration = duration;
  createFirstLine();
  countDown();
  setWatch(pauseUnpause, BTN1, repeat= true);
  if(!counterInterval) counterInterval = setInterval(countDown, 1000/hertz);
}

Bangle.loadWidgets();
Bangle.drawWidgets();
showMenu();
