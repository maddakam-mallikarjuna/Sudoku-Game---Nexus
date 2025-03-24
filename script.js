const gamebox = document.querySelector('#gamebox');
const inputsDiv = document.querySelector('.inputs');
const controlsDiv = document.querySelector('.controls');
let inputValue = 1;
let mistakes = 0;
let lastEnteredCells = [];

const createBoard = () => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.createElement('button');
            cell.classList.add('cell');
            cell.id = `${row}${col}`;
            gamebox.appendChild(cell);
        }
    }
    addCellEventListeners();
};

const generateEmptyGrid = () => Array.from({ length: 9 }, () => Array(9).fill(0));

const isValid = (grid, row, col, num) => {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
};

const fillSudoku = (grid, row = 0, col = 0) => {
    if (row === 9) return true;
    if (col === 9) return fillSudoku(grid, row + 1, 0);
    if (grid[row][col] !== 0) return fillSudoku(grid, row, col + 1);

    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (let num of numbers) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillSudoku(grid, row, col + 1)) return true;
            grid[row][col] = 0;
        }
    }
    return false;
};

const removeNumbers = (grid, holes = 10) => {
    let puzzle = grid.map(row => [...row]);
    while (holes > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            holes--;
        }
    }
    return puzzle;
};

const renderSudoku = (grid) => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.getElementById(`${row}${col}`);
            if (grid[row][col] !== 0) {
                cell.textContent = grid[row][col];
                cell.disabled = true;
                cell.classList.add('disable');
            } else {
                cell.textContent = "";
            }
        }
    }
};

const generateSudoku = () => {
    let grid = generateEmptyGrid();
    fillSudoku(grid);
    solutionGrid = grid.map(row => [...row]);
    let puzzle = removeNumbers(grid);
    renderSudoku(puzzle);
};

const createNumberInputs = () => {
    for (let num = 1; num <= 9; num++) {
        let inputbtn = document.createElement('button');
        inputbtn.classList.add('inputbtns', `${num}`);
        inputbtn.textContent = num;
        inputsDiv.appendChild(inputbtn);
    }
    setupInputButtons();
};

const setupInputButtons = () => {
    const inputbtns = document.querySelectorAll('.inputbtns');
    inputbtns[0].style.backgroundColor = 'red';
    inputbtns.forEach(btn => {
        btn.addEventListener('click', () => {
            inputbtns.forEach(b => b.style.backgroundColor = '');
            btn.style.backgroundColor = 'red';
            inputValue = btn.innerText;
        });
    });
};

const checkGameCompletion = () => {
    const cells = document.querySelectorAll('.cell');
    let count = 0

    // Check each entered cell
    for (let cell of cells) {
        if (cell.innerText != "") {
            if (cell.innerText == solutionGrid[cell.id[0]][cell.id[1]]) {
                count++;
            }
        }
    }

    // If all entered values are correct and the grid is completed, show success
    if (count == 81) {
        newGameBtn.textContent = "Next Game";  // Change button text to "Next Game"
        showSuccessMessage(1);  // Display success message
        setTimeout(() => {
            showSuccessMessage(0);  // Hide success message after 5 seconds
        }, 2000);
    }
};

const showSuccessMessage = (show) => {
    if (show == 1) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('success-message');

        const message = document.createElement('p');
        message.textContent = `Congratulations! You completed Level `;
        messageContainer.appendChild(message);
        document.body.appendChild(messageContainer);
    }
    else {
        const msgbox = document.querySelector(".success-message");
        document.body.removeChild(msgbox);
    }
};

const addCellEventListeners = () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (!cell.disabled) {
                cell.innerText = inputValue;
                cell.disabled = true;
                cell.classList.add('inputed');
                lastEnteredCells.push(cell);
                checkValueCompletion();
                updateInputCounts()
                if (updateMistakes(cell)) {
                    cell.style.border = `1px solid red`;
                }
                checkGameCompletion();
            }
        });
    });
};

const checkValueCompletion = () => {
    const cells = document.querySelectorAll('.cell');
    const inputbtns = document.querySelectorAll('.inputbtns');
    let counts = {};

    cells.forEach(cell => {
        if (cell.innerText != "") {
            if (cell.innerText in counts) {
                counts[cell.innerText] += 1;
            } else {
                counts[cell.innerText] = 1;
            }
        }
    });

    // Reset all input button styles first
    inputbtns.forEach(btn => {
        btn.style.backgroundColor = '';
        btn.disabled = false;
    });

    let firstNotCompleted = null;

    Object.entries(counts).forEach(([key, value]) => {
        let btn = inputbtns[Number(key) - 1];

        if (value >= 9) {
            btn.disabled = true;
        } else if (!firstNotCompleted) {
            firstNotCompleted = btn;
        }
    });

    if (firstNotCompleted) {
        firstNotCompleted.style.backgroundColor = 'red';
        inputValue = Number(firstNotCompleted.textContent);
    }
};

const updateInputCounts = () => {
    const inputbtns = document.querySelectorAll('.inputbtns');
    let counts = Array(9).fill(9); // Initially, each number can appear 9 times

    document.querySelectorAll('.cell').forEach(cell => {
        let value = parseInt(cell.innerText);
        if (!isNaN(value)) {
            counts[value - 1]--; // Decrease count for used numbers
        }
    });

    inputbtns.forEach((btn, index) => {
        btn.setAttribute('data-count', counts[index]); // Update count dynamically
    });
};

const eraseLastEnteredCell = () => {
    if (lastEnteredCells.length > 0) {
        const lastCell = lastEnteredCells.pop();
        lastCell.innerText = "";
        lastCell.disabled = false;
        lastCell.classList.remove('inputed');
        lastCell.style.border = `1px solid #ccc`
        checkValueCompletion();
    }
};

const updateMistakes = (cell) => {
    let [row, col] = cell.id.split('').map(Number);
    totalInputs++;

    if (parseInt(cell.textContent) !== solutionGrid[row][col]) {
        mistakes++;
        document.getElementById('mistakesCount').innerText = `Mistakes: ${mistakes}`;
        cell.classList.add('mistake');
    } else {
        correctInputs++;
        cell.classList.remove('mistake');
    }

    updateAccuracy();
    return parseInt(cell.textContent) !== solutionGrid[row][col];
};

const createControls = () => {
    let eraseBtn = document.createElement('button');
    eraseBtn.textContent = 'Erase';
    eraseBtn.classList.add('Erase');
    eraseBtn.addEventListener('click', () => {
        eraseLastEnteredCell();
        updateInputCounts();
    });
    controlsDiv.appendChild(eraseBtn);

    let showLevel = document.createElement('p');
    showLevel.id = 'showLevel';
    showLevel.textContent = 'Level: 0';
    controlsDiv.appendChild(showLevel);

    let mistakesDisplay = document.createElement('p');
    mistakesDisplay.id = 'mistakesCount';
    mistakesDisplay.textContent = 'Mistakes: 0';
    controlsDiv.appendChild(mistakesDisplay);

    let accuracyDisplay = document.createElement('p');
    accuracyDisplay.id = 'accuracyCount';
    accuracyDisplay.textContent = 'Accuracy: 100%';
    controlsDiv.appendChild(accuracyDisplay);
};

let holes = 10; // Default starting holes
let consecutiveCompletions = 0;
let totalInputs = 0;
let correctInputs = 0;

const updateAccuracy = () => {
    let accuracy = totalInputs > 0 ? (correctInputs / totalInputs) * 100 : 100;
    document.getElementById('accuracyCount').innerText = `Accuracy: ${accuracy.toFixed(2)}%`;
};

const resetGame = () => {
    const cells = document.querySelectorAll('.cell');
    lastEnteredCells = [];

    mistakes = 0;
    document.getElementById('mistakesCount').innerText = `Mistakes: ${mistakes}`;

    cells.forEach(cell => {
        if (!cell.classList.contains('disable')) {
            cell.innerText = "";
            cell.disabled = false;
            cell.classList.remove('inputed', 'mistake');
            cell.style.border = "1px solid #ccc";
        }
    });
    updateInputCounts();
    // Reset doesn't affect accuracy
};

const newGame = (isLevelUp) => {
    if (isLevelUp == 1) {
        consecutiveCompletions++;
    }
    else {
        consecutiveCompletions = 0;
    }
    gamebox.innerHTML = ""; // Clear board
    lastEnteredCells = [];
    mistakes = 0;
    totalInputs = 0;
    correctInputs = 0;
    
    document.getElementById('mistakesCount').innerText = `Mistakes: ${mistakes}`;
    document.getElementById('accuracyCount').innerText = `Accuracy: 100%`;
    document.getElementById("showLevel").innerText = `Level: ${consecutiveCompletions}`;

    createBoard();
    let grid = generateEmptyGrid();
    fillSudoku(grid);
    solutionGrid = grid.map(row => [...row]);

    holes = Math.min(10 + consecutiveCompletions* 2, 70); // Increase holes per completion
    let puzzle = removeNumbers(grid, holes);
    renderSudoku(puzzle);
    updateInputCounts();
    checkValueCompletion();
};

const newGameBtn = document.querySelector('.NewGame');
const resetBtn = document.querySelector('.Reset');

newGameBtn.addEventListener('click', () => {
    if (newGameBtn.innerText == `Next Game`) {
        newGame(1);
        newGameBtn.innerText = "New Game";
    }
    else {
        newGame(0);
    }
})
resetBtn.addEventListener('click', resetGame);

createBoard();
createNumberInputs();
generateSudoku();
createControls();
updateInputCounts();
checkValueCompletion();
