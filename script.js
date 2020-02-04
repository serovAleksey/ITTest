'use strict';

let numberFields = 9; // Количество клеток
let numberBombs = 10; // Количество бомб
const SIZEELEMENT = 50; // Размер одной клетки в px
let level = 1;
const BOARD = document.getElementById('saper');
const RESTART = document.getElementsByClassName('newGame')[0];
let messageBox = document.getElementsByClassName('messageBox')[0];
let bombs = [];
let elements;
let message = {win: "Позравляем, Вы победили!", loose: "Увы, Вы проиграли. Попробуйте еще!"};
let firstClick = true;
let startTimer;
let leaders = [];
let score = 0;
let maxScore = 0;
let millisecondsTimer;
let maxTimeOut = 540000; // Максимальное время для прохождение 1-го уровня (мс)

// Получение координаты бомбы рандомно в пределах от 0 до количества клеток в строке (столбце)
let getRandom = (min = 0, max = numberFields - 1) => {
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Сброс до начальных значений
let reset = () => {
	console.clear();
	firstClick = true;
	bombs = [];
	messageBox.innerHTML = '';
	messageBox.classList.remove('show');
	BOARD.classList.remove('blur');
	elements.forEach(el => {
		el.remove();
	});
	clearInterval(startTimer);
	document.getElementById("timer").innerHTML = '0:0:000';
	setup();
}

// Определяем позиции бомб
let getBombs = (el) => {
	for(let j = 0; j < numberBombs; j++) {
		let rowBomb = getRandom();
		let colBomb = getRandom();
		while (bombs.includes(`${colBomb},${rowBomb}`) || el.getAttribute('data-position') == `${colBomb},${rowBomb}`) {
			rowBomb = getRandom();
			colBomb = getRandom();
		}
		bombs.push(`${colBomb},${rowBomb}`);
		getNumbers(colBomb,rowBomb);
	}
}

// Проверяем какие клетки находятся рядом с бомбами
let getNumbers = (x, y) => {
	if (x > 0) setNubmers(x-1, y);
	if (x < numberFields - 1) setNubmers(x+1, y);
	if (y > 0) setNubmers(x, y-1);
	if (y < numberFields - 1) setNubmers(x, y+1);
	if (x > 0 && y > 0) setNubmers(x-1, y-1);
	if (x < numberFields - 1 && y < numberFields - 1) setNubmers(x+1, y+1);
	if (y > 0 && x < numberFields - 1) setNubmers(x+1, y-1);
	if (x > 0 && y < numberFields - 1) setNubmers(x-1, y+1);
}

// Задаем числовое значение для клетки, равное количеству бомб рядом с ней
let setNubmers = (x, y) => {
	let element = document.querySelectorAll(`[data-position="${parseInt(x)},${parseInt(y)}"]`)[0];
	let dataCount = parseInt(element.getAttribute('data-count'));
	if (!dataCount) dataCount = 0;
	element.setAttribute('data-count', dataCount + 1);
}

// Создание полей и бомб
let setup = () => {
  	for (let i = 0; i < Math.pow(numberFields, 2); i++) {
		let element = document.createElement('div');
		element.classList.add('element');
		BOARD.appendChild(element);
	}
  	BOARD.style.width = numberFields * SIZEELEMENT + 'px';
  	messageBox.style.width = numberFields * SIZEELEMENT + 'px';
  	messageBox.style.height = numberFields * SIZEELEMENT + 'px';
	maxScore = (Math.pow(numberFields, 2) - numberBombs)*10*level;
  	let col = 0;
	let row = 0;
	elements = document.querySelectorAll('.element');
	elements.forEach((el, i) => {
		el.setAttribute('data-position', `${col},${row}`);
		col++;
		if (col >= numberFields) {
			col = 0;
			row++;
		}
		el.oncontextmenu = function(e) {
			e.preventDefault();
			setFlag(el);
		}		
		el.addEventListener('click', function(e) {
			if (firstClick) { 
				getBombs(el); 
				firstClick = false; 
				setTimer(); 
			}
			clickElement(el);
		});
	});
}

// поменять
const checkNull = (el, position) => {
	let pos = position.split(',');
	let x = parseInt(pos[0]);
	let y = parseInt(pos[1]);
	setTimeout(() => {
		if (x > 0) {
			clickElement(document.querySelectorAll(`[data-position="${x-1},${y}"`)[0], `${x-1},${y}`);
		}
		if (x < numberFields - 1) {
			clickElement(document.querySelectorAll(`[data-position="${x+1},${y}"`)[0], `${x+1},${y}`);
		}
		if (y > 0) {
			clickElement(document.querySelectorAll(`[data-position="${x},${y-1}"]`)[0], `${x},${y-1}`);
		}
		if (y < numberFields - 1) {
			clickElement(document.querySelectorAll(`[data-position="${x},${y+1}"]`)[0], `${x},${y+1}`);
		}
		if (x > 0 && y > 0) {
			clickElement(document.querySelectorAll(`[data-position="${x-1},${y-1}"`)[0], `${x-1},${y-1}`);
		}
		if (x < numberFields - 1 && y < numberFields - 1) {
			clickElement(document.querySelectorAll(`[data-position="${x+1},${y+1}"`)[0], `${x+1},${y+1}`);
		}
		if (y > 0 && x < numberFields - 1) {
			clickElement(document.querySelectorAll(`[data-position="${x+1},${y-1}"]`)[0], `${x+1},${y-1}`);
		}
		if (x > 0 && y < numberFields - 1) {
			clickElement(document.querySelectorAll(`[data-position="${x-1},${y+1}"`)[0], `${x-1},${y+1}`);
		}
	}, 10);
}

// Установка флажка
let setFlag = (el) => {
	if (!el.classList.contains('element--opened')) {
		if (!el.classList.contains('element--flagged')) {
			el.innerHTML = '🚩';
			el.classList.add('element--flagged');
			} else {
			el.innerHTML = '';
			el.classList.remove('element--flagged');
		}
	}
	maybeWin();
}

// Клик по клетке
let clickElement = (el) => {
	if (el.classList.contains('element--opened') || el.classList.contains('element--flagged')) return;
	let coordinate = el.getAttribute('data-position');
	if (bombs.includes(coordinate)) {
		gameOver(el);
	} else {
		getScore();
		let count = el.getAttribute('data-count');
		if (count != null) {
			el.classList.add('element--opened');
			el.innerHTML = count;
			setTimeout(() => {
				maybeWin();
			}, 100);
			return;
		}
		checkNull(el, coordinate);
	}
	el.classList.add('element--opened');
} 

// Конец игры
let gameOver = (el) => {
	clearInterval(startTimer);
	addLeaders();
	console.log('💣 Booom! Game over.');
	messageBox.innerHTML = '<span>'+message.loose+'</span>';
	messageBox.classList.add('show');
	BOARD.classList.add('blur');
	level = 1;
	maxTimeOut = 540000;
	score = 0;

	elements.forEach(el => {
		let coordinate = el.getAttribute('data-position');
		if (bombs.includes(coordinate)) {
			el.classList.remove('element--flagged');
			el.classList.add('element--opened', 'element--bomb');
			el.innerHTML = '💣';
		}
	});
}

// Проверка на победу
const maybeWin = () => {
	let win = true;
	elements.forEach(element => {
		let coordinate = element.getAttribute('data-position');
		if (!element.classList.contains('element--opened') && !bombs.includes(coordinate)) win = false;
	});
	if (win) {
		getScore(win, 0);
		clearInterval(startTimer);
		messageBox.innerHTML = '<span>' + message.win + '</span>' + '<button id="nextLevel">Перейти к следующему уровню</button>';
		messageBox.classList.add('show');		
		let nextLevel = document.getElementById('nextLevel');
		nextLevel.addEventListener('click', function(e) {
			e.preventDefault();
			level++;
			if (level < Math.pow(numberFields, 2)-1) {
				numberBombs=Math.ceil(numberBombs*(level/10+1));
				showWarningMessage("Количество бомб увеличено!");				
			}			
			document.getElementById('level').innerHTML = `Level ${level}`;
			reset();
			maxTimeOut*=(1+(level/10));
		});
	}
}

// Запуск секундомера
let setTimer = () => {
	let date = new Date();
	startTimer = setInterval(() => {
		let dateNow = new Date();
		millisecondsTimer = dateNow - date;
		let seconds = Math.floor(millisecondsTimer / 1000);
		let minutes = Math.floor(seconds / 60);
		document.getElementById("timer").innerHTML = `${minutes}:${seconds-minutes*60}:${millisecondsTimer-seconds*1000}`;
	}, 200);
}

// Warning message
let showWarningMessage = (msg) => {
	let warningBox = document.getElementsByClassName('warning')[0];
	warningBox.innerHTML = `${msg}`;
	warningBox.style.marginTop = "200px";
	warningBox.style.opacity = "1";
	setTimeout(() => {
		warningBox.style.marginTop = "0";
		warningBox.style.opacity = "0";
	}, 3000);
}

// Подсчет очков
let getScore = (win = false, countEl = 1) => {	
	let scoresBox = document.getElementById('score');
	score += Math.ceil(maxScore*(countEl/(Math.pow(numberFields, 2) - numberBombs)));
	if (win) {
		score = Math.ceil(score / (millisecondsTimer / maxTimeOut));
	}
	scoresBox.innerHTML = score;
}

// Добавление нового результата в рекорды
let addLeaders = () => {
	leaders.push({levelCount: level, recordTime: score});
	leaders.sort((a, b) => {
		if (a.levelCount < b.levelCount) return 1;
		if (a.levelCount < b.levelCount) return -1;
		if (a.recordTime < b.recordTime) return 1;
		if (a.recordTime > b.recordTime) return -1;
		return 0;
	});
	let leadersList = document.getElementsByClassName('leadersList')[0];
	leadersList.innerHTML = '';
	let number = 1;
	leaders.forEach((item) => {
		let leaderItem = document.createElement('li');
		leaderItem.classList.add('item');
		leaderItem.innerHTML = `<span class="number">${number}</span>
								<span class="levelsCount">${item.levelCount}</span>
								<span class="recordTime">${item.recordTime}</span>`;
		leadersList.appendChild(leaderItem);
		number++;
	});
}

// Запускаем игру
setup();

// Restart
RESTART.addEventListener('click', function(e) {
	e.preventDefault();
	reset();
	level = 1;
	score = 0;
	maxTimeOut = 540000;
	getScore(false, 0);
});
