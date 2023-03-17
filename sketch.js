// This code is inspired by two arts below.
// https://editor.p5js.org/ph4se.space/sketches/gKGnmYt-U by Hannah
// http://www.complexification.net/gallery/machines/substrate/index.php by j.tarbell

// General steps for creating art
// Create lines
//   Generate 2 random points p1 and p2
//   p1 is used as a starting point and p2 is used for finding slope
//   Find Left side point that intercepts with left edge or top edge of canvas
//   Find right side point that intercepts with right edge or bottom edge of canvas
//   Find intercept point with other lines
//     Adjust left side point or right side point to find best closest intercepts point from p1
//   Draw shadow lines
//     Using perpendicular degree, draw random colorful lines

var lines = [];  // line class array
var numLines = 100;  // total lines to draw
var delta = 0.5;  // delta value for gap between two shadow lines
var shadowAdj = 0.03  // adjusting value for different shadow length

function setup() {
  createCanvas(600, 600);
  colorMode(RGB, 255, 255, 255, 100);
  background(255, 255, 255);
  stroke(0);
  strokeWeight(1);
  
  randomSeed(fxrand()*9999);
  for(var i = 0; i < numLines; i++) {
    lines.push(new Line([random(0, 600), random(0, 600)], [random(0, 600), random(0, 600)]));
  }
}

function draw() {
  for(var j = 0; j < lines.length; j++) {
    lines[j].draw();
  }
}

class Line {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.leftP = [];
    this.rightP = [];

    this.computeSlope();
    this.computeB();
    this.computeLeftPoint();
    this.computeRightPoint();
    this.findIntercept();
    this.drawShadow();
  }
  
  draw() {
    line(this.leftP[0], this.leftP[1], this.rightP[0], this.rightP[1]);
  }
  
  // Compute slope of two points
  computeSlope() {
    // m = (y - y0) / (x - x0)
    // negative slope means positive slope line
    // because top-left is (0, 0) and bottom-right is (600, 600)
    this.slope = (this.p2[1] - this.p1[1]) / (this.p2[0] - this.p1[0]);
  }
  
  // Compute b value of the equation
  computeB() {
    // b = y - mx since y = mx + b
    this.b = this.p1[1] - (this.slope * this.p1[0]);
  }

  // Compute left end point that intercepts with canvas edge
  computeLeftPoint() {
    if(this.slope < 0) {      // Increasing slope line
      if(this.b > 600) {    // Point exists under canvas when x = 0
                            // Therefore, y = 600 and need to find x with y = 600
        this.leftP[1] = 600;
        this.leftP[0] = (this.leftP[1] - this.b) / this.slope
      } else {              // Point exists between 0 <= y <= 600
                            // Therefore, x = 0 and need to find y with x = 0
        this.leftP[0] = 0;
        this.leftP[1] = this.b;
      }
    } else if(this.slope == 0) {  // Horizontal line
      this.leftP[0] = 0;
      this.leftP[1] = this.b;
    } else {    // Decreasing slope line
      if(this.b < 0) {    // Point exists over canvas when x = 0
                          // Therefore, y = 0 and need to find x with y = 0
        this.leftP[1] = 0;
        this.leftP[0] = (-this.b / this.slope);
      } else {
                          // Point exists between 0 <= y <= 600
                          // Therefore, x = 0 and need to find y with x = 0
        this.leftP[0] = 0;
        this.leftP[1] = this.b;
      }
    }
  }
  
  // Compute right end point that intercepts with canvas edge
  // Using a way as same as computeLeftPoint() function
  computeRightPoint() {
    if(this.slope < 0) {      // Increasing slope
      if((600 * this.slope) + this.b < 0) {  // Point exists over canvas when x = 600
        this.rightP[1] = 0;
        this.rightP[0] = (-this.b / this.slope);
      } else {
        this.rightP[0] = 600;
        this.rightP[1] = (600 * this.slope) + this.b;
      }
    } else if(this.slope == 0) {  // Horizontal line
      this.rightP[0] = 600;
      this.rightP[1] = this.b;
    } else {    // Decreasing slope
      if((600 * this.slope) + this.b > 600) {  // Point exists under canvas when x = 600
        this.rightP[1] = 600;
        this.rightP[0] = (600 - this.b) / this.slope;  
      } else {
        this.rightP[0] = 600;
        this.rightP[1] = (600 * this.slope) + this.b;
      }
    }
  }
  
  // Compute perpendicular slope of the equation
  computePerSlope() {
    // m1 * m2 = -1 when they are perpendicular
    this.perSlope = (-1) / this.slope;
  }
  
  // Check intercept points are on the line
  pointsOnLine(x, y) {
    if(x >= this.leftP[0] && x <= this.rightP[0]) {
      if(this.leftP[1] <= this.rightP[1]) {
        return y >= this.leftP[1] && y <= this.rightP[1];
      } else {
        return y <= this.leftP[1] && y >= this.rightP[1];
      }
    }
  }
  
  
  findIntercept() {
    for(var k = 0; k < lines.length; k++) {
      // Check if they are parallel
      // If yes, skip. No intercept point
      if(this.slope == lines[k].slope) {
        continue;
      }
     
      // a1x0 + b1y0 + c1 = 0 and a2x0 + b2y0 + c2 = 0
      // b1 = 1 and b2 = 1 because optimization (y = mx + b)
      // xi = (b1c2 - b2c1) / (a1b2 - a2b1) = (c2 - c1) / (a1 - a2)
      // yi = (c1a2 - c2a1) / (a1b2 - a2b1) = (c1a2 - c2a1) / (a1 - a2)
      var a1 = this.slope;
      var c1 = this.b;
      var a2 = lines[k].slope;
      var c2 = lines[k].b;
      
      var xi = (c2 - c1) / (a1 - a2);
      var yi = -((c1 * a2) - (c2 * a1)) / (a1 - a2);
      
      var newDist = dist(this.p1[0], this.p1[1], xi, yi);
      
      // Check the intercept points are on both of two lines
      if(this.pointsOnLine(xi, yi) && lines[k].pointsOnLine(xi, yi)) {
        // Check the dist of new intercept points are closer to starting point p1
        if(xi < this.p1[0]) {  // When x point of the intercept point exists on left side
          var posMinDist = dist(this.p1[0], this.p1[1], this.leftP[0], this.leftP[1]);
          if(newDist < posMinDist) {
            this.leftP[0] = xi;
            this.leftP[1] = yi;
          }
        } else {  // When x point of the intercept point exists on right side
          var negMinDist = dist(this.p1[0], this.p1[1], this.rightP[0], this.rightP[1]);
          if(newDist < negMinDist) {
            this.rightP[0] = xi;
            this.rightP[1] = yi;
          }
        }
      }
    }
  }
  
  // Draw shadow lines
  drawShadow() {
    this.computePerSlope();
    var shadowLength = random(3, 5);  // Default length of the shadow
    // Compute how many shadow lines will be need
    // Total length of the line / delta
    var totalShadow = dist(this.leftP[0], this.leftP[1], this.rightP[0], this.rightP[1]) / delta;
    var deltaX = (this.rightP[0] - this.leftP[0]) / totalShadow;  // Each deltaX value
    // Random color values
    var sR = random(0, 255);
    var sG = random(0, 255);
    var sB = random(0, 255);
    var sA = random(10, 30);
    
    // Draw shadow lines
    for(var l = 0; l < totalShadow; l++) {
      var x = this.leftP[0] + (deltaX * l);
      var y = (this.slope * x) + this.b;
      
      // var normalizedSlope = atan
      // var rotateDegree = atan(this.perSlope);

      // Use matrix transformation to move shadow line to the point (deltaX, f(deltaX)) where f(x) = mx + b
      push();
        translate(x, y);
        stroke(sR, sG, sB, sA);
        strokeWeight(1);
        // Tried to normalize perpendicular slope value to generate constant length (or degree) for the shadow line
        // But couldn't think about a good equation (or formula)
        // Sometimes, perSlope value is abnormally great which causes shadow line is very long
        line(0, 0, shadowLength, shadowLength * this.perSlope);
      pop();
      shadowLength += random(-shadowAdj, shadowAdj);
    }
  }
}