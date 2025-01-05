// @ts-check
// steps
// parse multiplication and division
// parse addition and subtraction
// TODO:
// parse parenthases
// parse square
// parse sqrt


/** @type {{op: string, f: (param0: number, param1: number) => number}[][]} */
const operations = [
    [
        { op: "*", f: (a, b) => a * b },
        { op: "/", f: (a, b) => a / b }
    ],
    [
        { op: "+", f: (a, b) => a + b },
        { op: "-", f: (a, b) => a - b }
    ]
]

/** @param {string} input */
function parse(input) {
    const ogInput = input;
    // go in the correct order of operations
    for (const order of operations) {
        // make it so negative numbers don't have a missing operator
        if (input[0] === "-") input = "0" + input;
        // go through the equation until you find the right operator
        for (let i = 0; i < input.length; i++) {
            const op = order.find(o => o.op === input[i]);
            if (op) {
                // get the numbers immediately before and after the operator
                const beforeSide = input.slice(0, i);
                const afterSide = input.slice(i + 1);
                const beforeNum = beforeSide.match(/\-?\d+(\.\d+)?(e(\+|\-)\d+)?$/)?.[0];
                const afterNum = afterSide.match( /^\-?\d+(\.\d+)?(e(\+|\-)\d+)?/)?.[0];

                // check to make sure they're there
                if (beforeNum === undefined) throw new Error("Missing number before operator at " + i + `\n${input}\n${ogInput}`);
                else if (afterNum === undefined) throw new Error("Missing number after operator at " + i + `\n${input}\n${ogInput}`);

                // calculate the result
                const nums = { before: parseFloat(beforeNum), after: parseFloat(afterNum) };
                const newNum = op.f(nums.before, nums.after);

                // cut the current equation out of the input
                const index = beforeSide.length - beforeNum.length;
                const before = input.slice(0, index);
                const after = input.slice(beforeSide.length + 1 +afterNum.length);

                // double negative shenanigans
                let cancel = false;
                if (before && newNum > 0 && !["+", "-", "*", "/"].includes(before[before.length - 1])) cancel = true;
                let newNumStr = newNum.toString();
                if (cancel) newNumStr = "+" + newNumStr;

                // replace the previous equation with the result
                const backup = input;
                input = (before + newNumStr + after).replaceAll("--", "+");
                if (input.search(/\d+\.\d+\./) !== -1) throw new Error("Double decimal!\n" + ogInput + "\n" + backup + "\n" + input + "\n");

                // move the tracker to the end of the equation
                i = index + newNumStr.length - 1;
            }
        }
    }
    return input;
}

/** @param {string} input */
function commonErrChecks(input) {
    if (/(\+\+)|(\*\*)|(\/\/)/.test(input)) {
        throw new Error("Cannot have two opperators next to each other\n" + input);
    }
}

function testing() {
    const start = performance.now();
    const res = []
    for (let i = 0; i < tests; i++) {
        const input = randNum().replaceAll("--", "+");
        commonErrChecks(input);
        res.push([parse(input), eval(input)]);
    }
    const end = performance.now();
    console.log(res);
    console.log(end - start + "ms");
    console.log((end - start) / tests + "ms avg");
}


function randNum() {
    let input = "";
    for (let i = 0; i < tests; i++) {
        input += (100 - Math.random() * 200).toFixed(3);
        const order = operations[Math.floor(Math.random() * operations.length)];
        const op = order[Math.floor(Math.random() * order.length)].op;
        input += op;
    }
    input += (Math.random() * 100).toFixed(3);
    return input;
}

const tests = 50;
const input = process.argv.slice(2).join(" ")
    .replace(/[^0-9\*\+\/\-\.e]/g, "");

if (process.argv[2] === "test") testing();
else console.log(parse(input));
