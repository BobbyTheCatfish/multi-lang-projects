// @ts-check
const { colors, keymap, clearLogs } = require("../../utils-js/utils");
const readline = require("readline");
const fs = require("fs");

const taskFilePath = "./tasks.json";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});
process.stdin
.setRawMode(true)
.resume()
.setEncoding("utf-8");
/**
 * @typedef Task
 * @prop {string} title
 * @prop {number} created
 * @prop {boolean} completed
 */

/** @type {Task[]} */
let db = [];

if (!fs.existsSync(taskFilePath)) {
    fs.writeFileSync(taskFilePath, "[\n]")
}

db = require(taskFilePath);

const config = {
    maxPerPage: 25
}

/** @type {Task} */
let modifying;
// view, create, edit, delete
let mode = 0;
let x = 2;
let y = 1;

function save() {
    fs.writeFileSync(taskFilePath, JSON.stringify(db, undefined, 2))
}

/**
 * @param {number} prevLines
*/
function del(prevLines) {
    clearLogs(prevLines + 1);
    rl.question("Are you sure you want to delete this note? (y/n)\n", (answer) => {
        if (answer.toLowerCase().startsWith("y")) {
            db = db.filter(d => d.created !== modifying.created)
            save();
        }
        x = 2;
        clearLogs(3);
        process.stdout.write("\n\n")
        view(undefined, 0)
        mode = 0;
        return;
    })
}

/**
 * @param {number} prevLines
*/
function create(prevLines) {
    clearLogs(prevLines + 1);
    rl.question("What do you want to call this note? (leave blank to cancel)\n", (answer) => {
        if (answer) {
            db.push({
                completed: false,
                title: answer,
                created: Date.now()
            })
            save();
        }
        x = 2;
        clearLogs(3);
        process.stdout.write("\n\n")
        view(undefined, 0)
        mode = 0;
        return;
    })
}

/**
 * @param {number} prevLines
*/
function edit(prevLines) {
    clearLogs(prevLines + 1);
    rl.question("What do you want to call this note? (leave blank to cancel)\n", (answer) => {
        if (answer && answer !== modifying.title) {
            for (let i = 0; i < db.length; i++) {
                if (db[i].created === modifying.created) {
                    db[i].title = answer;
                    break;
                }
            }
        }
        x = 2;
        clearLogs(3);
        process.stdout.write("\n\n")
        view(undefined, 0)
        mode = 0;
        return;
    })
    rl.write(modifying.title)
}

/**
 * @param {string} [key]
 * @param {number} [prevLines]
 * @param {number} [pageNum]
*/
function view(key, prevLines, pageNum = 0) {
    const excerpt = db.slice(pageNum * 25, pageNum * 25 + config.maxPerPage - 1);

    let maxCols = [
        "DELETE".length,
        "EDIT".length,
        "NOTE DETAILS".length,
        "STATUS".length
    ];

    switch (key) {
        case "left": x = Math.max(0, x - 1); break;
        case "right": x = Math.min(3, x + 1); break;
        case "up": y = Math.max(1, y - 1); break;
        case "down": y = Math.min(Math.max(excerpt.length + 1, 2), y + 1); break;
        case "enter": {
            if (x === 0) {
                mode = 3;
                modifying = excerpt[y - 1];
                del(Math.max(3, excerpt.length + 2));
                return;
            } else if (x === 1) {
                mode = 2;
                modifying = excerpt[y - 1];
                edit(Math.max(3, excerpt.length + 2))
                return;
            } else if (x === 3) {
                if (y > Math.max(excerpt.length, 1)) {
                    mode = 1
                    create(Math.max(3, excerpt.length + 2))
                    return;
                } else {
                    const mod = excerpt[y - 1]
                    for (let i = 0; i < db.length; i++) {
                        if (db[i].created === mod.created) db[i].completed = !mod.completed;
                    }
                }
            }
        }
        default: break;
    }

    const page = excerpt.map((p, yi) => {
        if (p.title.length > maxCols[2]) maxCols[2] = p.title.length;
        return ["D", "E", p.title, p.completed ? "☑" : "◻"];
    })


    page.unshift(["DELETE", "EDIT", "NOTE DETAILS", "STATUS"]);
    
    if (page.length === 1) {
        page.push(["", "", "NO NOTES", ""]);
    }
    page.push(["", "", "", "NEW"])

    if (prevLines !== undefined) clearLogs(prevLines);
    else clearLogs(page.length + (key === "enter" ? 1 : 0))

    for (let yi = 0; yi < page.length; yi++) {
        let str = ""
        for (let xi = 0; xi < page[yi].length; xi++) {
            let cell = page[yi][xi]
            const color = (xi === x && yi === y) ? colors.blue : ""
            str += color + colors.underline + " " + cell.padEnd(maxCols[xi], "⠀") + " " + colors.white + "|"
        }
        process.stdout.write("|" + str + "\n");
    }
}

process.stdin.on('data', (key) => {
    const keyType = keymap.get(key.toString());

    if (keyType === "exit") return process.exit();
    if (mode === 0 && keyType) return view(keyType);
});

view(undefined, 0)

// hack to let ts-check like me
module.exports = {}