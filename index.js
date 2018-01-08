#!/usr/bin/env node

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

const bord_bredde = 19;
const bord_lengde = 220;
const rom_bredde = 400;

console.log(argv);

var row = 1;
while (row*bord_bredde < rom_bredde) {
	console.log("row " + row);
	row++;
}
