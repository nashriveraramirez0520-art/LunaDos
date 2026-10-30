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
        }
    }
    

    const selectedCommand = commands[commandName];

    if (selectedCommand) {
        selectedCommand();
    } else {
        printLine(`Bad command or file name: ${command}`);
    }
}

commandInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const command = commandInput.value;

        printLine(`${prompt.textContent} ${command}`);
        runCommand(command);

        commandInput.value = "";
    }
});

document.addEventListener("click", function() {
    commandInput.focus();
});

commandInput.focus();

