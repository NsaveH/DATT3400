// Can't beat AI for rock-paper-scissors
// Skeleton codes are referenced by
// https://nishanc.medium.com/image-classification-with-teachable-machine-ml5-js-and-p5-js-233fbdf48fe7

let video;
let classifier;
let modelURL = './model/';
let label = "waiting...";
let camWidth = 640;
let AIHand = '';
let AIHandImg = '';
let imgWidth = 240;

// STEP 1: Load the model!
function preload() {
  classifier = ml5.imageClassifier(modelURL + 'model.json');
  rockImg = loadImage('./images/rock.jpg');
  paperImg = loadImage('./images/paper.jpg');
  scissorsImg = loadImage('./images/scissors.jpg');
}

function setup() {
  // createCanvas(640, 520);
  createCanvas(camWidth + imgWidth, 520);
  // Create the video
  video = createCapture(VIDEO);
  video.hide();

  // STEP 2.1: Start classifying
  classifyVideo();
}

// STEP 2.2 classify!
function classifyVideo() {
  classifier.classify(video, gotResults);
}

function draw() {
  background(0);
  
  // Draw the video
  image(video, 0, 0);

  // STEP 4: Draw the label
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, (width - imgWidth) / 2, height - 16);

  if(label == 'Rock') {
    AIHand = 'Paper';
    AIHandImg = paperImg;
  } else if (label == 'Paper') {
    AIHand = 'Scissor';
    AIHandImg = scissorsImg
  } else {
    AIHand = 'Rock';
    AIHandImg = rockImg;
  }


  image(AIHandImg, camWidth, 150);
  text(AIHand, camWidth + (imgWidth / 2), height - 16);
}

// STEP 3: Get the classification!
function gotResults(error, results) {
  // Something went wrong!
  if (error) {
    console.error(error);
    return;
  }
  // Store the label and classify again!
  label = results[0].label;
  console.log(results[0].label);


  classifyVideo();
}