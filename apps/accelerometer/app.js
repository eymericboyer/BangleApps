var durationInSeconds = 600.0;
var counterInterval;
var hertz = 25; //max 25 
var counter = 0;
var fileName = "accelTestInLab00.csv";


//Create file in append mode
var file = require("Storage").open(fileName,"a");

function outOfTime() {
  if(counterInterval) return;

  E.showMessage("Took " + counter + " measurements", durationInSeconds + "s elapsed");
  Bangle.buzz();
  Bangle.beep(200, 4000)
    .then(() => new Promise(resolve => setTimeout(resolve, 200)))
    .then(() => Bangle.beep(200, 3000));

  //repeat after 5s
  setTimeout(outOfTime, 5000);

}

function addLine(time, x,y,z,diff, mag) {
  var csv = [
    time,
    x,
    y,
    z,
    diff,
    mag
  ];

  file.write(csv.join(",")+"\n");
}


function countDown() {
  duration = duration-(1/hertz);
  var accel = Bangle.getAccel();
  addLine(Date.now(), accel.x, accel.y, accel.z, accel.diff, accel.mag);
  counter ++;
  setWatch(endTimer, BTN1);
  if(duration <= 0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    setWatch(startTimer, BTN2);
    outOfTime();
    return;
  }

  g.clear();
  g.setFontAlign(0,0);
  g.setFont("Vector", 80);
  //draw current counter value
  g.drawString(duration, g.getWidth()/2, g.getHeight()/2);
  g.setFont("Vector", 15);
  g.drawString(counter, g.getWidth()/2, g.getHeight()/4);
  g.flip();
}

function endTimer() {
 duration = 0.0;
}

function startTimer() {
  duration = durationInSeconds;
  countDown();
  if(!counterInterval) counterInterval = setInterval(countDown, 1000/hertz);
}


E.showMessage("Press BTN1 to start");
setWatch(startTimer, BTN1);

Bangle.loadWidgets();
Bangle.drawWidgets();
