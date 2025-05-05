const fs = require('fs');
const path = require('path');

function copyFolderSync(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (let entry of entries) {
        const sourcePath = path.join(source, entry.name);

        if (entry.isDirectory()) {
            copyFolderSync(sourcePath, destination); // Flatten by keeping the same destination
        } else {
            const destinationPath = path.join(destination, entry.name);
            fs.copyFileSync(sourcePath, destinationPath);
        }
    }
}


// note it is getting to the point I set up rollup: TODO
function copyBuild() {
    const foldersToCopy = ['template', 'src', 'sdk', 'libs', 'css', 'images'];
    const distFolder = path.join(process.cwd(), '_dist');

    if (!fs.existsSync(distFolder)) {
        fs.mkdirSync(distFolder, { recursive: true });
    }

    for (let folder of foldersToCopy) {
        const sourceFolder = path.join(process.cwd(), folder);

        if (fs.existsSync(sourceFolder)) {
            if (folder === 'images') {
                const imagesDestination = path.join(distFolder, folder);
                copyFolderSync(sourceFolder, imagesDestination); // Copy the folder as-is
            } else {
                copyFolderSync(sourceFolder, distFolder); // Flatten by using the same distFolder
            }
            
        } else {
            console.warn(`Source folder "${folder}" does not exist.`);
        }
    }
}

copyBuild();