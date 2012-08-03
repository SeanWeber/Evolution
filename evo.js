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
var colors = ['red','green','blue','yellow'];
 
function init(){
  var c = document.getElementById('game');
  var game = c.getContext('2d'); 
  c.width = width;
  c.height = height;
  game.fillStyle = '#000';
  game.fillRect(0, 0, width, 600);

  //populates the first generation of cells  
  for(i=0;i<50;i++){
    var x = Math.floor(Math.random() * width);
    var y = Math.floor(Math.random() * height);
    var color = colors[Math.floor((Math.random()*4))];
    var direction = Math.floor((Math.random()*8));
    var speed = Math.random() * 2;
    var vision = Math.floor((Math.random()*5)) + 10; //10 to 15
    var energy = Math.floor((Math.random()*1000)) + 3500; //3500 to 4500
    var maxSize = Math.floor((Math.random()*1000)) + 4500; //4500 to 5500
    cells.push([x, y, maxSize, color, direction, speed, vision, energy]);  
  }
  
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
    var x = Math.floor(Math.random() * width);
    var y = Math.floor(Math.random() * height);
    food.push([x,y]);
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
    game.fillStyle = cells[i][3];
    game.beginPath();
    if(cells[i][7] < 2000) //Ensures cells are easily visable
      var size = 2;
    else
      var size = (cells[i][7]/1000);
    game.arc(cells[i][0], cells[i][1], size, 0, Math.PI * 2, true);
    game.closePath();
    game.fill();
  }
  
  //draws each food particle
  for(i=0;i<food.length;i++){
    game.fillStyle = '#fff';
    game.beginPath();
    game.arc(food[i][0], food[i][1], 1, 0, Math.PI * 2, true);
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
        var xDiff = cells[i][0] - food[j][0]; 
        var yDiff = cells[i][1] - food[j][1];
        var vision = cells[i][6];
        var size = cells[i][7]/1000;

        //If a cell is on top of a piece of food, the cell eats it
        if(Math.abs(xDiff) <= size+2 && Math.abs(yDiff) <= size+2){
          food.splice(j,1);
          cells[i][7] += 1000;
        }
                
        //If the food is within vision of the cell, move toward the food
        if((Math.abs(xDiff) < vision) && (Math.abs(yDiff) < vision)){
          if(xDiff > 0){
            cells[i][0] -= cells[i][5];
          }
          else if(xDiff < 0){
            cells[i][0] += cells[i][5];
          }
          if(yDiff > 0){
            cells[i][1] -= cells[i][5];
          }
          else if(yDiff < 0){
            cells[i][1] += cells[i][5];
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
    cells[i][7] -= cells[i][5];
    
    //Reproduce if they have enough energy 
    if(cells[i][7] > cells[i][2]){
      mitosis(i);
    }
    
    //When they run out of energy, they die and become food
    if(cells[i][7] < 1){
      food.push([cells[i][0],cells[i][1]]);
      cells.splice(i,1);
    }
  }
}

function wander(){
    //Randomly change direction
    if(Math.random() > .90){
      if(Math.random() > .5){
        cells[i][4] += 1;
        if(cells[i][4] > 7)
          cells[i][4] = 0;
      }
      else{
        cells[i][4] -= 1;
        if(cells[i][4] < 0)
          cells[i][4] = 7;
      }
    }
    
    //Makes sure cell stays in bounds
    if(cells[i][0] > width){
      cells[i][4] = 0;
    }
    if(cells[i][0] < 0){
      cells[i][4] = 4;
    }
    if(cells[i][1] > height){
      cells[i][4] = 6;
    }
    if(cells[i][1] < 0){
      cells[i][4] = 2;
    }

    //move in one of 8 chosen directions    
    switch(cells[i][4]){
      case 0:
        cells[i][0] -= cells[i][5];
        break;
      case 1:
        cells[i][0] -= cells[i][5];
        cells[i][1] += cells[i][5];
        break;
      case 2:
        cells[i][1] += cells[i][5];
        break;
      case 3:
        cells[i][0] += cells[i][5];
        cells[i][1] += cells[i][5];
        break;
      case 4:
        cells[i][0] += cells[i][5];
        break;
      case 5:
        cells[i][0] += cells[i][5];
        cells[i][1] -= cells[i][5];
        break;
      case 6:
        cells[i][1] -= cells[i][5];
        break;
      case 7:
        cells[i][0] -= cells[i][5];
        cells[i][1] -= cells[i][5];
        break;
    }
}

function mitosis(parent){
  cells[parent][7] /= 2;
  
  var x = cells[parent][0];
  var y = cells[parent][1];
  var color = cells[parent][3];
  var direction = Math.floor((Math.random()*8));
  var speed = cells[parent][5] + (.5 - Math.random()); //mutate +/-1
  var vision = cells[parent][6] + (2 - Math.floor((Math.random()*5))); //Mutate +/-2
  var energy = cells[parent][7];
  var maxSize = cells[parent][2] + (50 - Math.floor((Math.random()*100)));
  cells.push([x, y, maxSize, color, direction, speed, vision, energy]);
}
