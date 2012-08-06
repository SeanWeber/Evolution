/*  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var width = 500;
var height = 600;
var cells = [];
var food = [];

function cell(x,y,color,direction,speed,vision,energy,maxSize){
  this.x = x;
  this.y = y;
  this.color = color;
  this.direction = direction;
  this.speed = speed;
  this.vision = vision;
  this.energy = energy;
  this.maxSize = maxSize;
}

function foodParticle(X, Y){
  this.x = X;
  this.y = Y;
}
 
function init(){
  var c = document.getElementById('game');
  var game = c.getContext('2d'); 
  c.width = width;
  c.height = height;
  game.fillStyle = '#000';
  game.fillRect(0, 0, width, 600);

  var pColor = 1;
  //populates the first generation of cells  
  for(i=0;i<50;i++){
    var x = Math.floor(Math.random() * width);
    var y = Math.floor(Math.random() * height);
    var color = 'hsl('+pColor+', 90%, 50%)';
    var direction = Math.floor((Math.random()*8));
    var speed = Math.random() * 2;
    var vision = Math.floor((Math.random()*5)) + 10; //10 to 15
    var energy = Math.floor((Math.random()*1000)) + 3500; //3500 to 4500
    var maxSize = Math.floor((Math.random()*1000)) + 4500; //4500 to 5500

    pColor +=7;
    cells.push(new cell(x,y,color,direction,speed,vision,energy,maxSize));  
  }
  report();
  live(); //main loop
}

function live(){
  feed(); //randomly adds food
  move(); //determines the movement for each cell
  draw(); //updates the canvas
  var gLoop = setTimeout(live, 50); //repeat
}

function feed(){ 
  if(Math.random() > .95){
    var X = Math.floor(Math.random() * width);
    var Y = Math.floor(Math.random() * height);
    food.push(new foodParticle(X, Y));
  }
}

function draw(){
  var c = document.getElementById('game');
  var game = c.getContext('2d');

  //clears the previous frame
  game.fillStyle = '#000';
  game.fillRect(0, 0, width, 600);

  //draws each cell
  for(i=0;i<cells.length;i++){
    if(cells[i].energy < 2000) //Ensures cells are easily visable
      var size = 2;
    else
      var size = (cells[i].energy/1000);
    game.fillStyle = cells[i].color;
    game.beginPath();    
    game.arc(cells[i].x, cells[i].y, size, 0, Math.PI * 2, true);
    game.closePath();
    game.fill();
  }
  
  //draws each food particle
  for(i=0;i<food.length;i++){
    game.fillStyle = '#fff';
    game.beginPath();
    game.arc(food[i].x, food[i].y, 1, 0, Math.PI * 2, true);
    game.closePath();
    game.fill();
  }
}

function move(){
  for(i=0; i<cells.length; i++){
    var moved = 0;

    //Checks to see if the cell is near any food
    if(food.length > 0 && moved == 0){
      for(j=0; j<food.length; j++){
        var xDiff = cells[i].x - food[j].x; 
        var yDiff = cells[i].y - food[j].y;
        var catchRange = (cells[i].energy/1000) + cells[i].speed;

        //If a cell is on top of a piece of food, the cell eats it
        if(Math.abs(xDiff) <= catchRange && Math.abs(yDiff) <= catchRange){
          food.splice(j,1);
          cells[i].energy += 1000;
        }
                
        //If the food is within vision of the cell, move toward the food
        if((Math.abs(xDiff) < cells[i].vision) && (Math.abs(yDiff) < cells[i].vision)){
          if(xDiff > 0 && xDiff >= catchRange){ 
            cells[i].x -= cells[i].speed;
          }
          else if(xDiff < 0){
            cells[i].x += cells[i].speed;
          }
          if(yDiff > 0 && yDiff >= catchRange){
            cells[i].y -= cells[i].speed;
          }
          else if(yDiff < 0){
            cells[i].y += cells[i].speed;
          }
          moved = 1;
          break;
        }
      }
    }
    
    //Executes if there is no food nearby
    if(moved==0){   
      wander();
    }
    
    //Cells lose energy each turn proportional to their speed
    cells[i].energy -= cells[i].speed;
    
    //Reproduce if they have enough energy 
    if(cells[i].energy > cells[i].maxSize){
      mitosis(i);
    }
    
    //When they run out of energy, they die and become food
    if(cells[i].energy < 1){
      food.push(new foodParticle(cells[i].x, cells[i].y));
      cells.splice(i,1);
      report();
    }
  }
}

function wander(){
    //Randomly change direction
    if(Math.random() > .90){
      if(Math.random() > .5){
        cells[i].direction += 1;
        if(cells[i].direction > 7)
          cells[i].direction = 0;
      }
      else{
        cells[i].direction -= 1;
        if(cells[i].direction < 0)
          cells[i].direction = 7;
      }
    }
    
    //Makes sure cell stays in bounds
    if(cells[i].x > width){
      cells[i].direction = 0;
    }
    if(cells[i].x < 0){
      cells[i].direction = 4;
    }
    if(cells[i].y > height){
      cells[i].direction = 6;
    }
    if(cells[i].y < 0){
      cells[i].direction = 2;
    }

    //move in one of 8 chosen directions    
    switch(cells[i].direction){
      case 0:
        cells[i].x -= cells[i].speed;
        break;
      case 1:
        cells[i].x -= cells[i].speed;
        cells[i].y += cells[i].speed;
        break;
      case 2:
        cells[i].y += cells[i].speed;
        break;
      case 3:
        cells[i].x += cells[i].speed;
        cells[i].y += cells[i].speed;
        break;
      case 4:
        cells[i].x += cells[i].speed;
        break;
      case 5:
        cells[i].x += cells[i].speed;
        cells[i].y -= cells[i].speed;
        break;
      case 6:
        cells[i].y -= cells[i].speed;
        break;
      case 7:
        cells[i].x -= cells[i].speed;
        cells[i].y -= cells[i].speed;
        break;
    }
}

function mitosis(parent){
  cells[parent].energy /= 2;
  
  var x = cells[parent].x;
  var y = cells[parent].y;
  var color = cells[parent].color;
  var direction = Math.floor((Math.random()*8));
  var speed = cells[parent].speed + (.5 - Math.random()); //mutate +/-1
  var vision = cells[parent].vision + (2 - Math.floor((Math.random()*5))); //+/-2
  var energy = cells[parent].energy;
  var maxSize = cells[parent].maxSize + (50 - Math.floor((Math.random()*100)));
  cells.push(new cell(x,y,color,direction,speed,vision,energy,maxSize));
  checkDNA(i);
  report();
}

function report(){
  var avgSpeed = 0;
  var avgVision = 0;
  var avgMaxSize = 0;
  
  for(var i=0; i<cells.length;i++){
    avgSpeed += cells[i].speed;
    avgVision += cells[i].vision;
    avgMaxSize += cells[i].maxSize;
  }
  
  avgSpeed /= cells.length;
  avgVision /= cells.length;
  avgMaxSize /= cells.length * 1000;
  
  var experimentReport = "Number of cells: " + cells.length + 
                         "<br/> Average Speed: " + avgSpeed.toFixed(3) +
                         "<br/> Average Vision: " + avgVision.toFixed(3) +
                         "<br/> Average Maximum Size: " + avgMaxSize.toFixed(3);
               
  document.getElementById("report").innerHTML= experimentReport;
}

function checkDNA(i){
  if(cells[i].speed < 0 || cells[i].vision < 0 || cells[i].maxSize < 0){
    cells.splice(i,1);
  } 
}
