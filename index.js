#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2),
    {
        "string": [ "rowstart", "rowrestart" ]
    });

const bord_bredde = 19;
const bord_lengde = 220;
const min_rest = 40;
const series_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const room_width = argv.rx;
const room_height = argv.ry;
const series_offset = argv.rowstart.split("/").map(x => parseInt(x))
const series_restart = argv.rowrestart.split("/").map(x => parseInt(x))


if (argv.showlabel) {
    console.log("/showrowlabel true def");
} else {
    console.log("/showrowlabel false def");
}

if (argv.showlen) {
    console.log("/showlenstr true def");
} else {
    console.log("/showlenstr false def");
}


var row = 1;
var series_idx = 0;

while (row * bord_bredde < room_height) {
    var output_line = "";
	// console.log("row " + row);

    var this_offset = series_offset[series_idx];

    // console.log("using series " + series_label[series_idx] + " with offset " + this_offset);

    var row_length = this_offset;
    var row_offsets = [ this_offset ];

    row_length += bord_lengde;
    while (row_length < room_width) {
        row_offsets.push(bord_lengde);
        row_length += bord_lengde;
    }
    var row_rest = row_length - room_width;
    var last_offset = bord_lengde - row_rest;
    row_offsets.push(last_offset);

    // console.log("results: " + row_offsets);

    output_line += "[";
    row_offsets.forEach(function (value) {
        output_line += " " + value; })
    output_line += " ] (" + series_label[series_idx] + ") row";
    console.log(output_line);

    if (row_rest >= min_rest) {
        series_offset[series_idx] = row_rest;
    } else {
        series_offset[series_idx] = series_restart[series_idx];
    }

    series_idx = (series_idx + 1) % series_offset.length;

	row++;
}
