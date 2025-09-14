board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
]

turn = 1
x = 1
y = 1

turnChars = ["□", "x", "o"]

def win_check():
    diags = [[], []]
    full = []
    winner = ["111", "222"]

    for i in range(board):
        row = board[i]
        col = [board[0][i], board[1][i], board[2][i]]
        
        if str.join("", col) in winner:
            return [[i, 0], [i, 1], [i, 2]]
        if str.join("", row) in winner:
            return [[0, i], [1, i], [2, i]];

        diags[0].append(board[i][i])
        diags[1].append(board[i][2 - i])

        full.append(str.join("", row))

    if str.join("", diags[0]) in winner:
        return [[0, 0], [1, 1], [2, 2]]
    if str.join("", diags[1]) in winner:
        return [[0, 2], [1, 1], [2, 0]]
    
    if not "0" in str.join("", full):
        return None
    
    return False

def user_input(key):
    if key == "exit":
        return
    if key == "left":
        if (x > 0):
            x = x - 1
    elif key == "right":
        if x < 2:
            x = x + 1
    elif key == "up":
        if y > 0:
            y = y - 1
    elif key == "down":
        if y < 2:
            y = y + 1
    elif key == "enter":
        if board[y][x] == 0:
            board[y][x] = turn
            turn = 2 if turn == 1 else 1