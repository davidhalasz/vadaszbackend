const fs = require('fs');

// Read the text file into a string
let telepulesek = fs.readFileSync('telepulesek.txt', 'utf8');
let megyek = fs.readFileSync('megyek.txt', 'utf8');

let linesTelep = telepulesek.split('\n');
let linesMegyek = megyek.split('\n');

console.log(linesMegyek);

let objects = [];

linesTelep.forEach(function (telepules, i) {
    objects.push(JSON.parse(`{ "nev": "${telepules}", "megye": "${linesMegyek[i]}" }`));
})

fs.writeFileSync('data.json', JSON.stringify(objects, null, 2));
