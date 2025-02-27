// @ts-check
const { colors, keymap, clearLogs } = require("../../utils-js/utils");

process.stdin
.setRawMode(true)
.resume()
.setEncoding("utf-8");

/**
 * @typedef Task
 * @prop {string} title
 * @prop {number} created
 * @prop {boolean} completed
 * @prop {string} id
 */

/** @type {Task[]} */
let db = [];
db = require("./tasks.json");

const config = {
    maxPerPage: 25
}

/** @type {Task} */
let modifying;
// view, create, edit, delete
let mode = 0;
let x = 2;
let y = 1;
let pendingStr = "";

/**
 * @param {Buffer<ArrayBufferLike>} [key]
 * @param {number} [prevLines]
*/
function del(key, prevLines) {
    if (!key && prevLines) {
        clearLogs(prevLines);
        process.stdout.write("Are you sure you want to delete this note? (y/n)\n")
    } else if (key) {
        const mapped = keymap.get(key.toString());
        if (mapped === "enter" && pendingStr.length > 0) {
            mode = 0;
            if (pendingStr.toLowerCase().startsWith("y")) {
                db = db.filter(d => d.id !== modifying.id)
            }
            view("", 2)
            x = 2;
            pendingStr = "";
            return;
        } else if (mapped === "back") {
            pendingStr = pendingStr.substring(0, pendingStr.length - 2);
            process.stdout.moveCursor(-1, 0)
            process.stdout.clearLine(1)
        } else if (/[a-z]/i.test(key.toString()[0])) {
            pendingStr += key;
            process.stdout.write(key);
        }
    }
}

/**
 * @param {string} key
 * @param {number} [prevLines]
 * @param {number} [pageNum]
*/
function view(key, prevLines, pageNum = 0) {
    let maxLength = 0;
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
                del(undefined, Math.max(3, excerpt.length + 2));
                return;
            }
        }
        default: break;
    }

    const page = excerpt.map((p, yi) => {
        if (p.title.length > maxCols[3]) maxCols[3] = p.title.length;
        return ["D", "E", p.title, p.completed ? "☑" : "◻"];
    })


    page.unshift(["DELETE", "EDIT", "NOTE DETAILS", "STATUS"]);
    
    if (page.length === 1) {
        page.push(["", "", "NO NOTES", ""]);
        y = 2;
        x = 3;
    }
    page.push(["", "", "", "NEW"])

    if (prevLines !== undefined) clearLogs(prevLines);
    else clearLogs(page.length)

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
    switch (mode) {
        case 0: if (keyType) return view(keyType); break;
        case 1: return create(keyType)
        case 2: return edit(keyType)
        case 3: return del(key)
        default: if (keyType) return view(keyType); break;
    }
});

view("", 0)

// hack to let ts-check like me
module.exports = {}