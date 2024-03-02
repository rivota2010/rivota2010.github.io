document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('checkersBoard');
    const turnDisplay = document.getElementById('turnDisplay');
    const redAirstrikeCounter = document.getElementById('redAirstrikeCounter');
    const blackAirstrikeCounter = document.getElementById('blackAirstrikeCounter');
    const airstrikeButton = document.getElementById('airstrikeButton');
    const cursorBomb = document.getElementById('bombCursor'); // Assuming bombCursor is the id of your image

    redAirstrikeCounter.textContent = 'Red Airstrike : 1';
    blackAirstrikeCounter.textContent = 'Black Airstrike: 1';

    const titleContainer = document.createElement('div');
    titleContainer.id = 'titleContainer';
 
    const titleText = document.createElement('h1');
    titleText.textContent = 'WarCheckers';
    titleContainer.appendChild(titleText);
 
    document.body.insertBefore(titleContainer, document.body.firstChild);

    let isBlack = false;
    let selectedPiece = null;
    let airstrikeMode = false;
    let redAirstrikesRemaining = 1;
    let blackAirstrikesRemaining = 1;

    function createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = `cell ${isBlack ? 'black' : 'white'}`;
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();
        cell.addEventListener('click', cellClicked);
        return cell;
    }

    function createPiece(row) {
        const piece = document.createElement('div');
        piece.className = `piece ${row > 4 ? 'red-piece' : 'black-piece'}`;
        piece.addEventListener('click', pieceClicked);
        return piece;
    }

    function promotePiece(piece) {
        piece.classList.add('kinged-piece');
    }

    function movePiece(piece, cell, isCaptureMove, pieceRow, pieceCol, cellRow, cellCol, pieceColor) {
        if (isCaptureMove) {
            const opponentRow = (pieceRow + cellRow) / 2;
            const opponentCol = (pieceCol + cellCol) / 2;
            const opponentCell = getCell(opponentRow, opponentCol);
            const opponentPiece = opponentCell.querySelector(`.piece:not(.${pieceColor}-piece)`);
            if (opponentPiece) {
                opponentCell.removeChild(opponentPiece);
            }
        }

        const shouldPromote = (pieceColor === 'red' && cellRow === 0) || (pieceColor === 'black' && cellRow === 7);
        if (shouldPromote) {
            promotePiece(piece);
        }

        cell.appendChild(piece);
        piece.classList.remove('selected');
        selectedPiece = null;
        toggleTurn();
        checkForWinningCondition();
    }

    function pieceClicked(event) {
        event.stopPropagation(); // Prevent the cell's click event
        if (airstrikeMode) {
            performAirstrikeOnPiece(event.currentTarget);
            airstrikeMode = false;
            board.style.cursor = 'default';
            return;
        }
        if (selectedPiece) {
            selectedPiece.classList.remove('selected');
        }
        selectedPiece = event.currentTarget;
        selectedPiece.classList.add('selected');
    }

    function cellClicked(event) {
        if (!selectedPiece || airstrikeMode) return;
    
        const cell = event.currentTarget;
        const piece = selectedPiece;
    
        if (piece.parentNode === cell) {
            piece.classList.remove('selected');
            selectedPiece = null;
            return;
        }
    
        const pieceColor = piece.classList.contains('red-piece') ? 'red' : 'black';
        if ((isBlack && pieceColor !== 'black') || (!isBlack && pieceColor !== 'red')) {
            return;
        }
    
        const pieceRow = parseInt(piece.parentNode.dataset.row, 10);
        const pieceCol = parseInt(piece.parentNode.dataset.col, 10);
        const cellRow = parseInt(cell.dataset.row, 10);
        const cellCol = parseInt(cell.dataset.col, 10);

        const rowDirection = pieceColor === 'red' ? -1 : 1;
    
        const rowDelta = cellRow - pieceRow;
        const colDelta = Math.abs(cellCol - pieceCol);
    
        const isKinged = piece.classList.contains('kinged-piece');
    
        const isMove = (Math.abs(rowDelta) === 1 && colDelta === 1 && isKinged) || (rowDelta === rowDirection && colDelta === 1 && !isKinged);
    
        const isForwardCapture = (rowDelta === 2 * rowDirection && colDelta === 2);
        const isBackwardCapture = isKinged && Math.abs(rowDelta) === 2 && colDelta === 2;
    
        if (isMove || isForwardCapture || isBackwardCapture) {
            movePiece(piece, cell, isForwardCapture || isBackwardCapture, pieceRow, pieceCol, cellRow, cellCol, pieceColor);
        }
    }

    function getCell(row, col) {
        return board.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }

    function performAirstrikeOnPiece(piece) {
        const cell = piece.parentNode;
        cell.removeChild(piece);
        updateAirstrikeCounters();
        checkForWinningCondition();
    }

    function updateAirstrikeCounters() {
        if (isBlack) {
            blackAirstrikesRemaining--;
            blackAirstrikeCounter.textContent = `Black Airstrike: ${blackAirstrikesRemaining}`;
        } else {
            redAirstrikesRemaining--;
            redAirstrikeCounter.textContent = `Red Airstrike : ${redAirstrikesRemaining}`;
        }
        checkAirstrikeButton();
        toggleTurn();
    }

    function positionElement(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        if (airstrikeMode) {
            cursorBomb.style.width = '32px';
            cursorBomb.style.height = '32px';
            const offsetX = 16; // Assuming cursorBomb width/2
            const offsetY = 16; // Assuming cursorBomb height/2

            cursorBomb.style.left = (mouseX - offsetX) + 'px';
            cursorBomb.style.top = (mouseY - offsetY) + 'px';
            cursorBomb.style.display = 'block';

            document.body.style.cursor = 'none';
            board.classList.add('airstrike-active');
        } else {
            cursorBomb.style.display = 'none';
            document.body.style.cursor = 'auto';
            board.classList.remove('airstrike-active');
        }
    }

    window.addEventListener('mousemove', positionElement);

    airstrikeButton.addEventListener('click', function () {
        airstrikeMode = !airstrikeMode;
        if (airstrikeMode) {
            cursorBomb.style.display = 'block';
            document.body.style.cursor = 'none';
        } else {
            cursorBomb.style.display = 'none';
            document.body.style.cursor = 'auto';
        }
    });

    function toggleTurn() {
        isBlack = !isBlack;
        updateTurnDisplay();
        checkAirstrikeButton();
    }

    function updateTurnDisplay() {
        turnDisplay.textContent = isBlack ? "Black's turn" : "Red's turn";
    }

    function checkAirstrikeButton() {
        airstrikeButton.disabled = (isBlack && blackAirstrikesRemaining === 0) || (!isBlack && redAirstrikesRemaining === 0);
    }

    function checkForWinningCondition() {
        const redPieces = document.querySelectorAll('.red-piece').length;
        const blackPieces = document.querySelectorAll('.black-piece').length;

        if (redPieces === 0) {
            declareWinner('Blue');
        } else if (blackPieces === 0) {
            declareWinner('Red');
        }
    }

    function declareWinner(winner) {
        alert(`${winner} wins the game!`);
        // Implement any end-of-game logic here, like disabling moves, etc.
    }

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = createCell(row, col);
            board.appendChild(cell);
            if ((row < 3 || row > 4) && (row + col) % 2 !== 0) {
                const piece = createPiece(row);
                cell.appendChild(piece);
            }
            isBlack = !isBlack;
        }
        isBlack = !isBlack;
    }

    updateTurnDisplay();
    checkAirstrikeButton();
});













