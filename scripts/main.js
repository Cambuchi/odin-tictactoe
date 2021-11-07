let game = (() => {
    //state of the board
    let board = ['','','','','','','','',''];
    //counter for turns to decide if x or o plays
    let turnCounter = 1;
    //magic squares to figure out who is the winner
    //x magic sum is 15
    //o magic sum is 30
    const xMagicSquare = [8,1,6,3,5,7,4,9,2];
    const oMagicSquare = [16,2,12,6,10,14,8,18,4];
    //Cache DOM elements
    let resetContainer = document.getElementById('reset-container');
    let messageContainer = document.getElementById('message-container');
    let message = document.getElementById('message');

    //renders the board based on current board state
    function render() {
        let tiles = document.getElementById('board-container').children;
        for (let i = 0; i < board.length; i++) {
            tiles[i].textContent = board[i];
        }
        events.emit('boardChanged', board);
        events.emit('playerChanged', turnCounter%2);
    }

    //when user clicks an empty tile, updates board, click states, rerenders,
    //changes player turn, and checks to see if game has ended
    function changeBoard(index) {
        if (turnCounter % 2 === 0) {
            board[index] = 'O';
        } else {
            board[index] = 'X';
        }
        turnCounter++;
        render();
        removeClickClass();
        removeClickAreas();
        let gameState = gameStateCheck();
        if (gameState != 'continue') {
            gameEnd(gameState);
        }
    }

    //removes ability to click and click styling from board elements that are filled,
    //also adds class to style X and O filled elements
    function removeClickClass() {
        let tiles = document.getElementById('board-container').children;
        for (let i = 0; i < board.length; i++) {
            if (board[i] != '') {
                tiles[i].classList.remove('click');
                if (board[i] === 'X') {
                    tiles[i].classList.add('no-click-x');
                } else if (board[i] === 'O') {
                    tiles[i].classList.add('no-click-o');
                }
            }
        }
    }

    //adds ability to click and click stying on elements (for when board resets)
    function addClickClass() {
        let tiles = document.getElementById('board-container').children;
        for (let i = 0; i < board.length; i++) {
            tiles[i].classList.add('click');
            tiles[i].classList.remove('no-click-x');
            tiles[i].classList.remove('no-click-o');
        }
    }

    //reference function for click events on board so that addEventListener/removeEventListener
    //will work in separate functions
    const boardClick = function(e) {
        let data = e.target.getAttribute('data-index');
        changeBoard(parseInt(data));
    }

    //adds event listeners for each tile that is empty
    function addClickAreas() {
        let clickyTiles = Array.from(document.querySelectorAll('.click'));
        clickyTiles.forEach(btn => btn.addEventListener('click', boardClick));
    }

    //removes event listeners from elements with no-click classes
    function removeClickAreas() {
        let noClickyTiles = Array.from(document.querySelectorAll('.no-click-x, .no-click-o'));
        noClickyTiles.forEach(btn => btn.removeEventListener('click', boardClick));
    }

    // //removes event listeners from all elements when the game ends
    function removeClickAreasAll() {
        let noClickyTiles = Array.from(document.querySelectorAll('.no-click-x, .no-click-o, .click'));
        noClickyTiles.forEach(btn => btn.removeEventListener('click', boardClick));
        noClickyTiles.forEach(btn => btn.classList.remove('click'));
    }

    //checks if the game has a winner or is in a tie state
    function gameStateCheck() {
        //populates magic board with magic square numbers according to x or o
        let magicBoard = ['','','','','','','','',''];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === 'X') {
                magicBoard[i] = xMagicSquare[i];
            } else if (board[i] === 'O') {
                magicBoard[i] = oMagicSquare[i];
            }
        }
        //computes sums for all of the win conditions and creates an array of the sums
        let top = magicBoard[0] + magicBoard[1] + magicBoard[2];
        let mid = magicBoard[3] + magicBoard[4] + magicBoard[5];
        let bot = magicBoard[6] + magicBoard[7] + magicBoard[8];
        let left = magicBoard[0] + magicBoard[3] + magicBoard[6];
        let center = magicBoard[1] + magicBoard[4] + magicBoard[7];
        let right = magicBoard[2] + magicBoard[5] + magicBoard[8];
        let diag1 = magicBoard[0] + magicBoard[4] + magicBoard[8];
        let diag2 = magicBoard[6] + magicBoard[4] + magicBoard[2];

        let sums = [top, mid, bot, left, center, right, diag1, diag2];
        //if the sums includes 15: x wins, 30: o wins. If board has no winner and there
        //is no more blank spaces, return draw state
        if (sums.includes(15)) {
            return 'x win';
        } else if (sums.includes(30)) {
            return 'o win';
        } else if (!magicBoard.includes('')) {
            return 'draw';
        } else {
            return 'continue';
        }
    }

    //when game ends, reveals game end message and reset button according to game state passed in
    function gameEnd(condition) {
        resetContainer.classList.remove('hidden');
        messageContainer.classList.remove('hidden');
        removeClickAreasAll();
        if (condition === 'x win') {
            message.textContent = 'X has won! Press RESET to play again.';
        } else if (condition === 'o win') {
            message.textContent = 'O has won! Press RESET to play again.';
        } else if (condition === 'draw') {
            message.textContent = 'Draw! No one wins. Press RESET to play again.';
        }
    }
    
    //resets the board and turn counter so that a new game can be played
    function reset() {
        board = ['','','','','','','','',''];
        turnCounter = 1;
        resetContainer.classList.add('hidden');
        messageContainer.classList.add('hidden');
        addClickClass();
        addClickAreas();
        render();
        }

    return {
        addClickAreas,
        reset,
    }
})();

let ai = (() => {

})();

//IIFE to add event listener to reset button
(function() {
    let resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', game.reset);
})();

//IIFE for pubsub functionality between game and ai modules without exposing variables
let events = (function() {
    let events = {};

    function on(eventName, fn) {
        events[eventName] = events[eventName] || [];
        events[eventName].push(fn);
    }

    function off(eventName, fn) {
        if (events[eventName]) {
            for (let i = 0; i < events[eventName].length; i++) {
                if( events[eventName][i] === fn ) {
                    events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    }

    function emit(eventName, data) {
        if (events[eventName]) {
            events[eventName].forEach(function(fn) {
                fn(data);
            });
        }
    }

    return {
        on: on,
        off: off,
        emit: emit
    };

})();



//adds event listeners to the game board
game.addClickAreas();