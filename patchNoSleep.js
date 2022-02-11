import fs from 'fs';
import path from 'path';

const typesPath = path.resolve('node_modules', 'nosleep.js', 'src', 'index.js');

fs.readFile(typesPath, 'utf8', (err, data) => {
    if (err) throw err;

    let lines = data.split('\n');
    lines[39] = lines[39].replace('"No Sleep"', '"Sudoku By dancras"');

    fs.writeFile(typesPath, lines.join('\n'), 'utf8', function(err) {
        if (err) throw err;
    });
});
