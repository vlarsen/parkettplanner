#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2),
    {
        string: [ "rowstart", "rowrestart" ],
        default: {
            bx: 220,
            by: 19,
            miny: 40
        }
    });

const series_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const bord_bredde = argv.by;
const bord_lengde = argv.bx;
const min_rest = argv.miny;
const room_width = argv.rx;
const room_height = argv.ry;
const series_offset = argv.rowstart.split("/").map(x => parseInt(x))


console.log("/boardwidth " + bord_bredde + " def");
console.log("/boardlength " + bord_lengde + " def");

console.log("/showrowlabel " + (argv.showlabel ? "true" : "false") + " def");
console.log("/showlenstr " + (argv.showlen ? "true" : "false") + " def");

function fraction_length_from(x) {
    // start at x
    var sum_len = x;
    // add whole boards
    sum_len += Math.floor((room_width - sum_len) / bord_lengde) * bord_lengde;
    // return what is left
    return room_width - sum_len;
}
var fraction_length = fraction_length_from(0);
// console.log("fraction: " + fraction_length);

// check end_piece constraint on initial offsets
series_offset.forEach(x => {
    var end_piece = fraction_length_from(x);
    if (end_piece < min_rest) {
        console.error("WARNING: start length " + x + " gives too short end piece: " + end_piece);
        process.exit(0);
    }
})

function fraction_iter_max_len_with_valid_endpiece(startx) {
    // start searching at startx
    var candidate = startx;
    // in steps equal to the global fraction length

    // go up to maximum bord_lengde
    while (candidate < bord_lengde) {
        candidate += fraction_length;
    }
    // go down if the end piece is too short
    while (fraction_length_from(candidate) < min_rest) {
        candidate -= fraction_length;
    }
    return candidate;
}

const series_restart = series_offset.map(x => fraction_iter_max_len_with_valid_endpiece(x))
// console.log("rowstart: " + series_offset);
// console.log("restart : " + series_restart);

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
