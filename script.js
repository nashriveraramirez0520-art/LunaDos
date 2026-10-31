console.log("LunaDOS script loaded");

const output = document.getElementById("output");
const commandInput = document.getElementById("command-input");
const prompt = document.getElementById("prompt");

const fileSystem = {
    name: "C:",
    type: "directory",
    children: {
        SYSTEM: {
            name: "SYSTEM",
            type: "directory",
            children: {}
        },

        DOCUMENTS: {
            name: "DOCUMENTS",
            type: "directory",
            children: {}
        },

        GAMES: {
            name: "GAMES",
            type: "directory",
            children: {
                "SNAKE.EXE": {
                    name: "SNAKE.EXE",
                    type: "file",
                    content: "LunaDOS Snake"
                }
            }
        },

        "README.TXT": {
            name: "README.TXT",
            type: "file",
            content: "Welcome to LunaDOS 1.0!"
        }
    }
};

let currentDirectory = fileSystem;
let currentPath = ["C:"];

function saveFileSystem() {
    localStorage.setItem("lunaDOSFileSystem", JSON.stringify(fileSystem));
}

function loadFileSystem() {
    const savedFileSystem = localStorage.getItem("lunaDOSFileSystem");

    if (!savedFileSystem) {
        return;
    }

    const savedData = JSON.parse(savedFileSystem);

    if (!savedData || !savedData.children) {
        localStorage.removeItem("lunaDOSFileSystem");
        return;
    }

    fileSystem.children = savedData.children;
}

loadFileSystem();

function updatePrompt() {
    if (currentPath.length === 1) {
        prompt.textContent = "C:\\>";
        return;
    }

    prompt.textContent = `${currentPath.join("\\")}>`;
}

function getDirectoryFromPath(path) {
    let directory = fileSystem;

    for (let i = 1; i < path.length; i++) {
        directory = directory.children[path[i]];
    } 

    return directory;
}

function printLine(text = "") {
    const line = document.createElement("div");
    line.textContent = text;
    output.appendChild(line);
}

let snakeRunning = false;
let snakeGameOver = false;
let snake = [];
let snakeDirection = {x: 1, y: 0};
let snakeFood = {x: 0, y: 0};
let snakeScore = 0;
let snakeInterval = null;

const snakeWidth = 28;
const snakeHeight = 14;

function startSnake() {
    snakeRunning = true;
    snakeGameOver = false;

    snake = [
        {x: 7, y: 7},
        {x: 6, y: 7},
        {x: 5, y: 7}
    ];

    snakeDirection = {x: 1, y: 0};
    snakeScore = 0;

    commandInput.style.display = "none";
    prompt.style.display = "none";

    createSnakeFood();
    drawSnake();


    if (snakeInterval !== null) {
    clearInterval(snakeInterval);
}

    snakeInterval = setInterval(moveSnake, 150);
}

function createSnakeFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * snakeWidth),
            y: Math.floor(Math.random() * snakeHeight)
        };
    } while (
        snake.some(function(segment) {
            return segment.x === newFood.x && segment.y === newFood.y;
        })
    );
    
    snakeFood = newFood;
}

function drawSnake() {
    let screen = "";

    screen += "LUNADOS SNAKE\n";
    screen += `SCORE: ${snakeScore}\n`;
    screen += "+" + "-".repeat(snakeWidth) + "+\n";

    for (let y = 0; y < snakeHeight; y++) {
        let row = "|";

        for (let x = 0; x < snakeWidth; x++) {
            const snakeIndex = snake.findIndex(function(segment) {
                return segment.x === x && segment.y === y;
            });

            if(snakeIndex === 0) {
                if (snakeDirection.x === 1) {
                    row += ">";
                } else if (snakeDirection.x === -1) {
                    row += "<";
                } else if (snakeDirection.y === -1) {
                    row += "^";
                } else {
                    row += "v";
                }
            } else if (snakeIndex > 0) {
                row += "o";
            } else if (snakeFood.x === x && snakeFood.y === y) {
                row += "*";
            } else {
                row += " ";
            }
        }

        row += "|";
        screen += row + "\n";
    }

    screen += "+" + "-".repeat(snakeWidth) + "+\n";
    screen += "Arrow keys = move | ESC = exit";

    output.textContent = screen;
}

function moveSnake() {
    const head = snake[0];

    const newHead = {
        x: head.x + snakeDirection.x,
        y: head.y + snakeDirection.y
    };

    if (
        newHead.x < 0 ||
        newHead.x >= snakeWidth ||
        newHead.y < 0 ||
        newHead.y >= snakeHeight
    ) {
        endSnakeGame();
        return;
    }

    if (
        snake.some(function(segment) {
            return segment.x === newHead.x && segment.y === newHead.y;
        })
    ) {
        endSnakeGame();
        return;
    }

    snake.unshift(newHead);

    if (newHead.x === snakeFood.x && newHead.y === snakeFood.y) {
        snakeScore++;
        createSnakeFood();
    } else {
        snake.pop();
    }

    drawSnake();
}

function endSnakeGame() {
    clearInterval(snakeInterval);
    snakeInterval = null;
    snakeGameOver = true;

    drawSnake();

    printLine("");
    printLine("GAME OVER");
    printLine(`FINAL SCORE: ${snakeScore}`);
    printLine("");
    printLine("Press ENTER to try again.");
    printLine("Press ESC to return to LunaDOS.");
}

function exitSnake() {
    if (snakeInterval !== null) {
        clearInterval(snakeInterval);
        snakeInterval = null;
    }

    snakeRunning = false;

    output.replaceChildren();

    commandInput.style.display = "";
    prompt.style.display = "";

    updatePrompt();
    commandInput.value = "";
    commandInput.focus();

    printLine("Returned to LunaDOS.");
}

function runCommand(command) {
    const cleanCommand = command.trim();
    const parts = cleanCommand.split(" ");

    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commandName === "") {
        return;
    }

    const commands = {
        help: function() {
            printLine("Available commands:");
            printLine("HELP     Displays available commands.");
            printLine("VER      Displays the LunaDOS version.");
            printLine("ECHO     Displays a message.");
            printLine("CLS      Clears the screen.");
            printLine("DIR      Displays files and directories.");
            printLine("CD       Changes the current directory.");
            printLine("TYPE     Displays the contents of a text file.");
            printLine("MKDIR    Creates a new directory.");
            printLine("RMDIR    Removes an empty directory.");
            printLine("DEL      Deletes a file.");
        },

        ver: function() {
            printLine("LunaDOS Version 1.0");
        },

        echo: function() {
            const redirectIndex = args.indexOf(">");

            if (redirectIndex === -1) {
                printLine(args.join(" "));
                return;
            }

            const content = args.slice(0, redirectIndex).join(" ");
            const fileName = args.slice(redirectIndex + 1).join(" ").toUpperCase();

            if (!fileName) {
                printLine("The syntax of the command is incorrect.");
                return;
            }

            currentDirectory.children[fileName] = {
                name: fileName,
                type: "file",
                content: content
            };

            saveFileSystem();

            printLine(`File ${fileName} created.`);

        },

        cls: function() {
            output.replaceChildren();
        },

        dir: function() {
            printLine(" Volume in drive C is LUNADOS");
            printLine(` Directory of ${currentPath.join("\\")}`);
            printLine("");

            const items = Object.values(currentDirectory.children);

            items.forEach(function(item) {
                if (item.type === "directory") {
                    printLine(`${item.name.padEnd(16)} <DIR>`);
                } else {
                    printLine(item.name);
                }
            });

            printLine("");
            printLine(`${items.length} item(s)`);
        },

        cd: function() {
            if (args.length === 0) {
                printLine(currentPath.join("\\"));
                return;
            }

            const destination = args[0].toUpperCase();

            if (destination === "..") {
                if (currentPath.length === 1) {
                    return;
                }

                currentPath.pop();
                currentDirectory = getDirectoryFromPath(currentPath);
                updatePrompt();
                return;
            }

            const target = currentDirectory.children[destination];

            if (!target || target.type !== "directory") {
                printLine("The system cannot find the path specified.");
                return;
            }

            currentDirectory = target;
            currentPath.push(target.name);
            updatePrompt();
        },

        type: function() {
            if (args.length === 0) {
                printLine("The syntax of the command is incorrect.");
                return;
            }

            const fileName = args[0].toUpperCase();
            const target = currentDirectory.children[fileName];

            if (!target || target.type !== "file") {
                printLine("File not found.");
                return;
            }

            printLine(target.content);
        },

        mkdir: function() {
            if (args.length === 0) {
                printLine("The syntax of the command is incorrect.");
                return;
            }

            const directoryName = args[0].toUpperCase();

            if (currentDirectory.children[directoryName]) {
                printLine("A file or directory with that name already exists.");
                return;
            }

            currentDirectory.children[directoryName] = {
                name: directoryName,
                type: "directory",
                children: {}
            };

            saveFileSystem();

            printLine(`Directory ${directoryName} created.`);
        },

        rmdir: function() {
            if (args.length === 0) {
                printLine("The syntax of the command is incorrect.");
                return;
            }

            const directoryName = args[0].toUpperCase();
            const target = currentDirectory.children[directoryName];

            if (!target || target.type !== "directory") {
                printLine("Directory not found.");
                return;
            }

            if (Object.keys(target.children).length > 0) {
                printLine("The directory is not empty.");
                return;
            }

            delete currentDirectory.children[directoryName];

            saveFileSystem();

            printLine(`Directory ${directoryName} removed.`);
        },

        del: function() {
            if (args.length === 0) {
                printLine("The syntax of the command is incorrect.");
                return;
            }

            const fileName = args[0].toUpperCase();
            const target = currentDirectory.children[fileName];

            if (!target || target.type !== "file") {
                printLine("File not found.");
                return;
            }

            delete currentDirectory.children[fileName];
            saveFileSystem();

            printLine(`File ${fileName} deleted.`);
        }
    }
    
    const executableName = cleanCommand.toUpperCase();
    const executable = currentDirectory.children[executableName];

    if (executable && executable.type === "file" && executableName.endsWith(".EXE")) {
        if (executableName === "SNAKE.EXE") {
            startSnake();
            return;
        }
    }

    

    const selectedCommand = commands[commandName];

    if (selectedCommand) {
        selectedCommand();
    } else {
        printLine(`Bad command or file name: ${command}`);
    }
}

document.addEventListener("keydown", function(event) {
    if (snakeRunning) {
        if (event.key === "Escape") {
            event.preventDefault();
            exitSnake();
            return;
        }

        if (snakeGameOver && event.key === "Enter") {
            event.preventDefault();
            startSnake();
            return;
        }

        if (snakeInterval === null) {
            return;
        }

        if (event.key === "ArrowUp" && snakeDirection.y !== 1) {
            event.preventDefault();
            snakeDirection = { x: 0, y: -1 };
            return;
        }

        if (event.key === "ArrowDown" && snakeDirection.y !== -1) {
            event.preventDefault();
            snakeDirection = { x: 0, y: 1 };
            return;
        }

        if (event.key === "ArrowLeft" && snakeDirection.x !== 1) {
            event.preventDefault();
            snakeDirection = { x: -1, y: 0 };
            return;
        }

        if (event.key === "ArrowRight" && snakeDirection.x !== -1) {
            event.preventDefault();
            snakeDirection = { x: 1, y: 0 };
            return;
        }

        return;
    }

    if (event.key === "Enter") {
        const command = commandInput.value;

        printLine(`${prompt.textContent} ${command}`);
        runCommand(command);

        commandInput.value = "";
    }
});

