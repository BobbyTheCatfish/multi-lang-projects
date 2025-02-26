// @ts-check
const stdin = process.stdin;
stdin.setRawMode( true );

const colors = {
    blue: "\x1b[1;94m",
    red: "\x1b[1;91m",
    white: "\x1b[0m",
    green: "\x1b[1;92m"
}

// resume stdin in the parent process (node app won't quit all by itself)
stdin.resume();
stdin.setEncoding( 'utf8' );

let turn = 1;
let x = 1;
let y = 1;

const keys = new Map([
    ["\u0003", "exit"],
    ["\u001b[D", "left"],
    ["\u001b[C", "right"],
    ["\u001b[A", "up"],
    ["\u001b[B", "down"],
    ["\r", "enter"]
])

const board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]

const turnChars = ["□", "x", "o"]

/**
 * 
 * @param {boolean} [initial] 
 * @param {number[][]|null|false} [highlights] 
 */
function logBoard(initial = false, highlights) {
    if (!initial) {
        for (let i = 0; i < 4; i++) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.moveCursor(0, -1)
        }
    }

    process.stdout.write(`${colors.white}${turnChars[turn]}'s turn!\n`)
    for (let yi = 0; yi < board.length; yi++) {
        const line = board[yi].map((c, xi) => {
            const isSelected = (xi === x && yi === y);
            let str = colors[isSelected ? c === 0 ? "blue" : "red" : "white"];
            if (highlights === null) str = colors.red;
            else if (highlights && highlights.find(h => h[0] === yi && h[1] === xi)) str = colors.green;
            
            if (c === 0 && isSelected) str += turnChars[turn]
            else str += turnChars[c]
            return str + " ";
        }).join("") + colors.white + "\n"
        process.stdout.write(line)
    }
}

function won() {
    /** @type {number[][]} */
    const diags = [[], []];
    /** @type {string[]} */
    const full = [];
    const winner = ["111", "222"];

    for (let i = 0; i < board.length; i++) {
        const row = board[i];
        const col = [board[0][i], board[1][i], board[2][i]];
        if (winner.includes(row.join(""))) return [[i, 0], [i, 1], [i, 2]];
        if (winner.includes(col.join(""))) return [[0, i], [1, i], [2, i]];
        diags[0].push(board[i][i]);
        diags[1].push(board[i][2 - i]);
        full.push(row.join(""));
    }
    if (winner.includes(diags[0].join(""))) return [[0, 0], [1, 1], [2, 2]];
    if (winner.includes(diags[1].join(""))) return [[0, 2], [1, 1], [2, 0]];

    // draw
    if (!full.join("").includes("0")) return null;
    return false;
}

// on any data into stdin
stdin.on('data', (key) => {
    const input = keys.get(key.toString())

    switch (input) {
        case "exit": return process.exit();
        case "left": {
            if (x > 0) x--; break;
        }
        case "right": {
            if (x < 2) x++; break;
        }
        case "up": {
            if (y > 0) y--; break;
        }
        case "down": {
            if (y < 2) y++; break;
        }
        case "enter": {
            if (board[y][x] === 0) {
                board[y][x] = turn;
                turn = turn === 1 ? 2 : 1;
            }
            break;
        }
        default: return;
    }

    const status = won()
    logBoard(false, status)

    if (status) {
        console.log(`Player ${colors.blue}${turn === 1 ? "O" : "X"}${colors.white} won! Congrats!`);
        process.exit();
    } else if (status === null) {
        console.log("Looks like it's a tie! Better luck next time.");
        process.exit();
    }
});
const logo = 
"  _______         ______              ______          \n" +
" /_  __(_)____   /_  __/___ ______   /_  __/___  ___  \n" +
"  / / / / ___/    / / / __ `/ ___/    / / / __ \\/ _ \\ \n" +
" / / / / /__     / / / /_/ / /__     / / / /_/ /  __/ \n" +
"/_/ /_/\\___/    /_/  \\__,_/\\___/    /_/  \\____/\\___/  "

const controls = "\n\nControls:\nUse the arrow keys to move\nPress Enter to make a selection\nPress Ctrl+C to exit\n"

console.log(logo)
console.log(controls)
logBoard(true)
