document.addEventListener('DOMContentLoaded', () => {

    // Get the element with the id 'checkersBoard' and assign it to the variable 'board'
    const board = document.getElementById('checkersBoard');
    
    // Get the element with the id 'turnDisplay' and assign it to the variable 'turnDisplay'
    const turnDisplay = document.getElementById('turnDisplay');
    
    // Get the element with the id 'redAirstrikeCounter' and assign it to the variable 'redAirstrikeCounter'
    const redAirstrikeCounter = document.getElementById('redAirstrikeCounter');
    
    // Get the element with the id 'blackAirstrikeCounter' and assign it to the variable 'blackAirstrikeCounter'
    const blackAirstrikeCounter = document.getElementById('blackAirstrikeCounter');
    
    // Get the element with the id 'airstrikeButton' and assign it to the variable 'airstrikeButton'
    const airstrikeButton = document.getElementById('airstrikeButton');
    
    // Get the element with the id 'bombCursor' and assign it to the variable 'cursorBomb'
    const cursorBomb = document.getElementById('bombCursor'); 

    // Set the text content of the redAirstrikeCounter element to 'Red Airstrike : 1'
    redAirstrikeCounter.textContent = 'Red Airstrike : 1';

    // Set the text content of the blackAirstrikeCounter element to 'Black Airstrike: 1'
    blackAirstrikeCounter.textContent = 'Black Airstrike: 1';

    // Create a new div element and assign it to the variable 'titleContainer'
    const titleContainer = document.createElement('div');
    titleContainer.id = 'titleContainer'; // Set the id of the 'titleContainer' div to 'titleContainer'
 
    // Create a new h1 element and assign it to the variable 'titleText'
    const titleText = document.createElement('h1');
    titleText.textContent = 'WarCheckers'; // Set the text content of the 'titleText' h1 element to 'WarCheckers'
    titleContainer.appendChild(titleText); // Append the 'titleText' h1 element to the 'titleContainer' div
 
    // Insert the 'titleContainer' div as the first child of the body element
    document.body.insertBefore(titleContainer, document.body.firstChild);

    // Initialize variables
    let isBlack = false; // Represents the current turn color, false for red and true for black
    let selectedPiece = null; // Represents the currently selected game piece
    let airstrikeMode = false; // Indicates whether the game is in airstrike mode or not
    let redAirstrikesRemaining = 1; // Represents the number of remaining red airstrikes
    let blackAirstrikesRemaining = 1; // Represents the number of remaining black airstrikes

    // Function to create a cell element
    function createCell(row, col) {
        // Create a new div element and assign it to the variable 'cell'
        const cell = document.createElement('div');
        // Set the class name of the 'cell' div based on the value of 'isBlack' variable
        cell.className = `cell ${isBlack ? 'black' : 'white'}`;
        // Set the 'row' attribute of the 'cell' div to the value of 'row' variable converted to string
        cell.dataset.row = row.toString();
        // Set the 'col' attribute of the 'cell' div to the value of 'col' variable converted to string
        cell.dataset.col = col.toString();
        // Add a click event listener to the 'cell' div, which calls the 'cellClicked' function
        cell.addEventListener('click', cellClicked);
        // Return the created 'cell' div
        return cell;
    }

    // Function to create a game piece element
    function createPiece(row) {
        // Create a new div element and assign it to the variable 'piece'
        const piece = document.createElement('div');
        // Set the class name of the 'piece' div based on the value of 'row' variable
        piece.className = `piece ${row > 4 ? 'red-piece' : 'black-piece'}`;
        // Add a click event listener to the 'piece' div, which calls the 'pieceClicked' function
        piece.addEventListener('click', pieceClicked);
        // Return the created 'piece' div
        return piece;
    }

    // Function to promote a game piece to a kinged piece
    function promotePiece(piece) {
        piece.classList.add('kinged-piece'); // Add the 'kinged-piece' class to the piece element
    }

    // Function to move a game piece to a new cell
    function movePiece(piece, cell, isCaptureMove, pieceRow, pieceCol, cellRow, cellCol, pieceColor) {
        // Check if the move is a capture move
        if (isCaptureMove) {
            // Calculate the position of the opponent's piece
            const opponentRow = (pieceRow + cellRow) / 2;
            const opponentCol = (pieceCol + cellCol) / 2;
            // Get the cell containing the opponent's piece
            const opponentCell = getCell(opponentRow, opponentCol);
            // Get the opponent's piece
            const opponentPiece = opponentCell.querySelector(`.piece:not(.${pieceColor}-piece)`);
            // Remove the opponent's piece from the cell
            if (opponentPiece) {
                opponentCell.removeChild(opponentPiece);
            }
        }

        // Check if the moved piece should be promoted to a kinged piece
        const shouldPromote = (pieceColor === 'red' && cellRow === 0) || (pieceColor === 'black' && cellRow === 7);
        if (shouldPromote) {
            // Promote the piece to a kinged piece
            promotePiece(piece);
        }

        // Move the piece to the new cell
        cell.appendChild(piece);
        // Remove the 'selected' class from the piece
        piece.classList.remove('selected');
        // Reset the selectedPiece variable to null
        selectedPiece = null;
        // Toggle the turn to the next player
        toggleTurn();
        // Check for winning condition
        checkForWinningCondition();
    }

    // Function to handle the click event on a game piece
    function pieceClicked(event) {
        event.stopPropagation(); // Prevent the cell's click event from firing
        if (airstrikeMode) {
            performAirstrikeOnPiece(event.currentTarget); // Perform an airstrike on the clicked piece
            airstrikeMode = false; // Disable airstrike mode
            board.style.cursor = 'default'; // Reset the cursor style to default
            return;
        }
        if (selectedPiece) {
            selectedPiece.classList.remove('selected'); // Remove the 'selected' class from the previously selected piece
        }
        selectedPiece = event.currentTarget; // Set the clicked piece as the selected piece
        selectedPiece.classList.add('selected'); // Add the 'selected' class to the selected piece
    }

    // Function to handle the click event on a cell
    function cellClicked(event) {
        // Check if there is no selected piece or if the game is in airstrike mode
        if (!selectedPiece || airstrikeMode) return;

        const cell = event.currentTarget; // Get the clicked cell
        const piece = selectedPiece; // Get the selected piece

        // Check if the selected piece is already in the clicked cell
        if (piece.parentNode === cell) {
            piece.classList.remove('selected'); // Remove the 'selected' class from the piece
            selectedPiece = null; // Reset the selectedPiece variable to null
            return;
        }

        const pieceColor = piece.classList.contains('red-piece') ? 'red' : 'black'; // Get the color of the selected piece
        // Check if it's not the turn of the selected piece's color
        if ((isBlack && pieceColor !== 'black') || (!isBlack && pieceColor !== 'red')) {
            return;
        }

        const pieceRow = parseInt(piece.parentNode.dataset.row, 10); // Get the row of the selected piece
        const pieceCol = parseInt(piece.parentNode.dataset.col, 10); // Get the column of the selected piece
        const cellRow = parseInt(cell.dataset.row, 10); // Get the row of the clicked cell
        const cellCol = parseInt(cell.dataset.col, 10); // Get the column of the clicked cell

        const rowDirection = pieceColor === 'red' ? -1 : 1; // Determine the direction of movement based on the piece's color

        const rowDelta = cellRow - pieceRow; // Calculate the difference in rows between the piece and the clicked cell
        const colDelta = Math.abs(cellCol - pieceCol); // Calculate the absolute difference in columns between the piece and the clicked cell

        const isKinged = piece.classList.contains('kinged-piece'); // Check if the piece is a kinged piece

        // Check if it's a valid move for a regular piece or a kinged piece
        const isMove = (Math.abs(rowDelta) === 1 && colDelta === 1 && isKinged) || (rowDelta === rowDirection && colDelta === 1 && !isKinged);

        // Check if it's a valid forward capture move for a regular piece or a backward capture move for a kinged piece
        const isForwardCapture = (rowDelta === 2 * rowDirection && colDelta === 2);
        const isBackwardCapture = isKinged && Math.abs(rowDelta) === 2 && colDelta === 2;

        // Check if it's a valid move or capture move, and move the piece accordingly
        if (isMove || isForwardCapture || isBackwardCapture) {
            movePiece(piece, cell, isForwardCapture || isBackwardCapture, pieceRow, pieceCol, cellRow, cellCol, pieceColor);
        }
    }

    // Function to get a specific cell element based on its row and column
    function getCell(row, col) {
        // Use the querySelector method to select the cell element with the specified row and column attributes
        return board.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }

    // Function to perform an airstrike on a game piece
    function performAirstrikeOnPiece(piece) {
        const cell = piece.parentNode; // Get the parent cell of the piece
        cell.removeChild(piece); // Remove the piece from the cell
        updateAirstrikeCounters(); // Update the airstrike counters
        checkForWinningCondition(); // Check for winning condition
    }

    // Function to update the airstrike counters
    function updateAirstrikeCounters() {
        // Check if it's black's turn
        if (isBlack) {
            // Decrease the number of remaining black airstrikes
            blackAirstrikesRemaining--;
            // Update the text content of the blackAirstrikeCounter element
            blackAirstrikeCounter.textContent = `Black Airstrike: ${blackAirstrikesRemaining}`;
        } else {
            // Decrease the number of remaining red airstrikes
            redAirstrikesRemaining--;
            // Update the text content of the redAirstrikeCounter element
            redAirstrikeCounter.textContent = `Red Airstrike : ${redAirstrikesRemaining}`;
        }
        // Check the airstrike button status
        checkAirstrikeButton();
        // Toggle the turn to the next player
        toggleTurn();
    }

    // Function to position the cursor bomb element based on mouse coordinates
    function positionElement(e) {
        const mouseX = e.clientX; // Get the x-coordinate of the mouse
        const mouseY = e.clientY; // Get the y-coordinate of the mouse

        if (airstrikeMode) {
            cursorBomb.style.width = '32px'; // Set the width of the cursor bomb element to 32 pixels
            cursorBomb.style.height = '32px'; // Set the height of the cursor bomb element to 32 pixels
            const offsetX = 16; // Assuming cursorBomb width/2
            const offsetY = 16; // Assuming cursorBomb height/2

            cursorBomb.style.left = (mouseX - offsetX) + 'px'; // Set the left position of the cursor bomb element based on the mouse x-coordinate
            cursorBomb.style.top = (mouseY - offsetY) + 'px'; // Set the top position of the cursor bomb element based on the mouse y-coordinate
            cursorBomb.style.display = 'block'; // Display the cursor bomb element

            document.body.style.cursor = 'none'; // Hide the default cursor
            board.classList.add('airstrike-active'); // Add the 'airstrike-active' class to the board element
        } else {
            cursorBomb.style.display = 'none'; // Hide the cursor bomb element
            document.body.style.cursor = 'auto'; // Show the default cursor
            board.classList.remove('airstrike-active'); // Remove the 'airstrike-active' class from the board element
        }
    }

    // Add an event listener to the window object for the 'mousemove' event and call the 'positionElement' function
    window.addEventListener('mousemove', positionElement);

    // Add an event listener to the 'airstrikeButton' element for the 'click' event and define an anonymous function
    airstrikeButton.addEventListener('click', function () {
        // Toggle the 'airstrikeMode' variable between true and false
        airstrikeMode = !airstrikeMode;
        // Check if 'airstrikeMode' is true
        if (airstrikeMode) {
            // Set the display property of the 'cursorBomb' element to 'block'
            cursorBomb.style.display = 'block';
            // Set the cursor style of the body element to 'none'
            document.body.style.cursor = 'none';
        } else {
            // Set the display property of the 'cursorBomb' element to 'none'
            cursorBomb.style.display = 'none';
            // Set the cursor style of the body element to 'auto'
            document.body.style.cursor = 'auto';
        }
    });

    // Function to toggle the turn between black and red
    function toggleTurn() {
        isBlack = !isBlack; // Toggle the value of isBlack variable
        updateTurnDisplay(); // Update the turn display
        checkAirstrikeButton(); // Check the airstrike button status
    }

    // Function to update the turn display based on the current turn color
    function updateTurnDisplay() {
        turnDisplay.textContent = isBlack ? "Black's turn" : "Red's turn";
    }

    // Function to check the status of the airstrike button
    function checkAirstrikeButton() {
        // Disable the airstrike button if it's black's turn and there are no black airstrikes remaining,
        // or if it's red's turn and there are no red airstrikes remaining
        airstrikeButton.disabled = (isBlack && blackAirstrikesRemaining === 0) || (!isBlack && redAirstrikesRemaining === 0);
    }

    // Function to check for winning condition
    function checkForWinningCondition() {
        // Get the number of red pieces on the board
        const redPieces = document.querySelectorAll('.red-piece').length;
        // Get the number of black pieces on the board
        const blackPieces = document.querySelectorAll('.black-piece').length;

        // Check if there are no red pieces remaining
        if (redPieces === 0) {
            // Declare Blue as the winner
            declareWinner('Blue');
        } 
        // Check if there are no black pieces remaining
        else if (blackPieces === 0) {
            // Declare Red as the winner
            declareWinner('Red');
        }
    }

    // Function to declare the winner of the game
    function declareWinner(winner) {
        alert(`${winner} wins the game!`); // Display an alert message with the winner's name
        // Implement any end-of-game logic here, like disabling moves, etc.
    }

    // Loop through each row of the board
    for (let row = 0; row < 8; row++) {
        // Loop through each column of the board
        for (let col = 0; col < 8; col++) {
            // Create a new cell element using the createCell function
            const cell = createCell(row, col);
            // Append the cell element to the board element
            board.appendChild(cell);
            // Check if the cell should contain a game piece
            if ((row < 3 || row > 4) && (row + col) % 2 !== 0) {
                // Create a new game piece element using the createPiece function
                const piece = createPiece(row);
                // Append the game piece element to the cell element
                cell.appendChild(piece);
            }
            // Toggle the value of isBlack variable to alternate the cell colors
            isBlack = !isBlack;
        }
        // Toggle the value of isBlack variable to alternate the cell colors for the next row
        isBlack = !isBlack;
    }

    // Update the turn display based on the current turn color
    updateTurnDisplay();
    
    // Check the status of the airstrike button and disable it if necessary
    checkAirstrikeButton();
});














