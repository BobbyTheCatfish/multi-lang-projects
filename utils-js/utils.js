// @ts-check
const colors = {
    blue: "\x1b[1;94m",
    red: "\x1b[1;91m",
    white: "\x1b[0m",
    green: "\x1b[1;92m",
    underline: "\x1b[4m"
};

const keymap = new Map([
    ["\u0003", "exit"],
    ["\u001b[D", "left"],
    ["\u001b[C", "right"],
    ["\u001b[A", "up"],
    ["\u001b[B", "down"],
    ["\r", "enter"],
    ["\b", "back"]
]);

/** @param {number} lineCount */
function clearLogs(lineCount) {
    for (let i = 0; i < lineCount; i++) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.moveCursor(0, -1);
    }
}

module.exports = { colors, keymap, clearLogs };