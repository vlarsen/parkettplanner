#!/usr/bin/env node

const argv = require('yargs-parser')(process.argv.slice(2),
    {
        alias: {
            startlen: ['s'],
            rx: ['x'],
            ry: ['y'],
            showlen: ['l'],
            showlabel: ['t']
        },
        coerce: {
            startlen: function(lenstr) {
                return lenstr.split("/").map(l => parseInt(l))
            }
        },
        default: {
            bx: 220,
            by: 19,
            minbx: 40,
            minby: 5,
            showlabel: false,
            showlen: false
        }
    });

const series_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const board_width = argv.by;
const board_length = argv.bx;
const min_rest_length = argv.minbx;
const min_board_width = argv.minby;
const room_width = argv.rx;
const room_height = argv.ry;
const series_lengths = argv.startlen;

console.log("/boardwidth " + board_width + " def");
console.log("/boardlength " + board_length + " def");

console.log("/showrowlabel " + (argv.showlabel ? "true" : "false") + " def");
console.log("/showlenstr " + (argv.showlen ? "true" : "false") + " def");

function rest_length_starting_at(x) {
    // start at x
    let sum_len = x;
    // add whole boards
    sum_len += Math.floor((room_width - sum_len) / board_length) * board_length;
    // return what is left
    return room_width - sum_len;
}
const global_rest_length = rest_length_starting_at(0);

// check end_piece constraint on initial offsets
series_lengths.forEach(function(x) {
    const end_piece = rest_length_starting_at(x);
    if (end_piece < min_rest_length) {
        console.error("WARNING: start length ${x} gives too short end piece: ${end_piece}");
        process.exit(1);
    }
});

function fraction_iter_max_len_with_valid_endpiece(startx) {
    // start searching at startx
    let candidate = startx;
    // in steps equal to the global rest length

    // go up to maximum board_length
    while (candidate <= board_length - global_rest_length) {
        candidate += global_rest_length;
    }
    // go down if the end piece is too short
    while (rest_length_starting_at(candidate) < min_rest_length) {
        candidate -= global_rest_length;
    }
    return candidate;
}

const series_restart_lenghts = series_lengths.map(fraction_iter_max_len_with_valid_endpiece);

let row = 0;
let series_idx = 0;

while (row * board_width < room_height) {
    row++;

    const this_length = series_lengths[series_idx];

    let row_length = this_length;
    const row_offsets = [this_length];

    row_length += board_length;
    while (row_length < room_width) {
        row_offsets.push(board_length);
        row_length += board_length;
    }
    const row_rest_length = row_length - room_width;
    const last_board_length = board_length - row_rest_length;
    row_offsets.push(last_board_length);

    // Add * to the label if you need to throw away the remaining piece
    console.log(`[ ${row_offsets.join(" ")} ] (${series_label[series_idx]}${((row_rest_length < min_rest_length) ? "*" : "")}) row`);

    series_lengths[series_idx] = (row_rest_length >= min_rest_length) ? row_rest_length : series_restart_lenghts[series_idx];
    series_idx = (series_idx + 1) % series_lengths.length;
}

const all_boards_total_width = row * board_width;
const extra_width = all_boards_total_width - room_height;
const last_row_actual_width = board_width - extra_width;
if (last_row_actual_width < min_board_width) {
    console.error(`WARNING: Last row is too narrow: ${last_row_actual_width}`);
    process.exit(1);
}