var Directions = {
	'left':37,
	'up':38,
	'right':39,
	'down':40
};

function Snake() {
	
	var body = [];
	var moveAllowed = false;
	var bodyLength = 3;
	var color = "rgb(10,100,0)";
	var currentDirection = Directions.right;
	var currentPosition = {
		'x':5 * gridSize, 
		'y':5 * gridSize
	};

	function chageDirection(dir) {
		if (moveAllowed) {
			moveAllowed = false;
			
			switch(dir)
			{
				case Directions.left:
					if(currentDirection != Directions.right) {
						currentDirection = Directions.left;
					}
					
				break;
				
				case Directions.up:
					if(currentDirection != Directions.down) {
						currentDirection = Directions.up;
					}
				break;
				
				case Directions.right:
					if(currentDirection != Directions.left) {
						currentDirection = Directions.right;
					}
				break;
				
				// down
				case Directions.down:
					if(currentDirection != Directions.up) {
						currentDirection = Directions.down;
					}
				break;
				
				default:
				break;
			}
		}
	}

	
	function getDirection() {
		return currentDirection;
	}

	function grow() {
		bodyLength += 3;
	}

	function hasEatenFood(foodPosition) {
		if(currentPosition['x'] == foodPosition['x'] 
		&& currentPosition['y'] == foodPosition['y'] ) {
			return true;
		}
		else {
			return false;
		}
	}

	function hasPoint(point) {
		return body.some(function(bodyPart) {
				if(bodyPart[0] == point[0] 
				&& bodyPart[1] == point[1]) {
					return true;
				}
				else{
					return false;
				}
			}
		);
	}

	function hasEatenSelf() {
		for(var i = 0; i < body.length - 1; i++) {
			if(body[i][0] == currentPosition['x'] 
			&& body[i][1] == currentPosition['y']) {
				return true;
			}
		}
		return false;
	}

	function move() {
		moveAllowed = true;
		
		switch(currentDirection){
			case Directions.up:
				_moveUp();
				break;
			
			case Directions.down:
				_moveDown();
				break;
			
			case Directions.left:
				_moveLeft();
				break;
			
			case Directions.right:
				_moveRight();
				break;
				
			default:
				break;
		}
	}
	
	function _moveUp(){
		currentPosition['y'] = currentPosition['y'] - gridSize;
	}
	
	function _moveDown(){
		currentPosition['y'] = currentPosition['y'] + gridSize;
	}
	
	function _moveLeft(){
		currentPosition['x'] = currentPosition['x'] - gridSize;
	}
	
	function _moveRight(){
		currentPosition['x'] = currentPosition['x'] + gridSize;
	}
	
	function draw() {
		ctx.fillStyle = color;
		body.push([currentPosition['x'], currentPosition['y']]);
		ctx.fillRect(currentPosition['x'], currentPosition['y'], gridSize, gridSize);
		
		if (body.length > bodyLength) {
			var itemToRemove = body.shift();
			ctx.clearRect(itemToRemove[0], itemToRemove[1], gridSize, gridSize);
		}
	}
	
	return {
		chageDirection: chageDirection,
		currentPosition : currentPosition,
		draw:draw,
		getDirection : getDirection,
		grow : grow,
		hasEatenSelf : hasEatenSelf,
		hasEatenFood : hasEatenFood,
		hasPoint :hasPoint,
		move : move
	};
}

function Food(pos) {
	
	var color = "rgb(200,0,0)";
	var position = {
			'x' : pos[0],
			'y' : pos[1]
		};
	
	var radius = Math.floor(gridSize / 2);
	
	function draw() {
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.arc(position.x + radius, position.y + radius, radius, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		//ctx.fillRect(position.x, position.y, gridSize, gridSize);
	}
		
	return {
		position : position,
		draw : draw
	}
}

startGame = function() {
	window.canvas = $('canvas')[0];
	var initialFoodPos;
	var food;
	var level;
	var paused;
	var gameOver;
	var player;
	var score;
	var speed;
	var speedIncrease;
	var tick;
	// This sets some variables for demonstration purposes
	
	if (canvas.getContext){
		window.ctx = canvas.getContext('2d');
		window.gridSize = 10;
		
		init();
		
		$('#newGame').click(newGame);
		
		return true;
	}
	else {
		alert('Sorry.  This game uses elements that Internet Explorer does not support.  Try Google Chrome or Mozilla Firefox.');
		return false;
	}
	
	function endGame () {
		$(document).unbind('keydown');
		$('#message').text('Game Over, Sucka!');
		clearInterval(tick);
	}
	
	function getFoodLocation() {
		suggestedPoint = [Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, Math.floor(Math.random()*(canvas.height/gridSize))*gridSize];
		
		if (player.hasPoint(suggestedPoint)) {
			suggestedPoint = getFoodLocation();
		}
		
		return suggestedPoint;
	}

	function increaseLevel() {
		level++;
		clearInterval(tick);
		speed = speed - (speedIncrease);
		tick = setInterval(play,speed);
		speedIncrease -= 2;
		updateDomLevel();
	}

	function increaseScore() {
		score += 10;
		updateDomScore();
	}
	
	function init(){
		initialFoodPos = [Math.floor(canvas.width / (gridSize)), Math.floor(canvas.height / (gridSize))];
		food = Food(initialFoodPos);
		gameOver = false;
		level = 1;
		paused = false;
		player = Snake();
		score = 0;
		//var speed = 2000;
		speed = 250;
		speedIncrease = 20;
		
		updateDomScore();
		updateDomLevel();
		
		food.draw();
		if(tick) {
			clearInterval(tick);
		}
		
		tick = setInterval(play,speed);
		
		$(document).keydown(function(event) {
			if(event.keyCode == 32 || event.keyCode == 80) {
				togglePause();
			}
			else if(!paused && event.keyCode >= 37 && event.keyCode <= 40) {
				player.chageDirection(event.keyCode);
			}
		});
	}
	
	function play() {
		player.move();
		
		if(wallHit()) {
			endGame();
		}
		
		if(player.hasEatenFood(food.position)){
			increaseScore();

			if(score % 50 == 0){
				increaseLevel();
			}

			player.grow();
			
			food = Food(getFoodLocation());
			food.draw();
		}
		
		if(player.hasEatenSelf()) {
			endGame();
		}
		
		player.draw();
	}
	
	function newGame(){
		window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
		$('#message').text('');
		init();
	}
	
	function togglePause() {
		if(paused) {
			paused = false;
			tick = setInterval(play,speed);
		}
		else {
			paused = true;
			clearInterval(tick);
		}
	}
	
	function updateDomScore() {
		$('#score .value').text(score);
	}
	
	function updateDomLevel() {
		$('#level .value').text(level);
	}
	
	function wallHit() {
		if((player.getDirection() == Directions.left && player.currentPosition['x'] < 0)
		||(player.getDirection() == Directions.up && player.currentPosition['y'] < 0)
		||(player.getDirection() == Directions.right && player.currentPosition['x'] > canvas.width - gridSize)
		||(player.getDirection() == Directions.down && player.currentPosition['y'] > canvas.height - gridSize)) {
			return true;
		}
		else{
			return false;
		}
	}
};
