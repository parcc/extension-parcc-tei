/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2014 (original work) Parcc, Inc..
 */

define([
    'OAT/raphael'
], function(Raphael){
    QUnit.module('Raphael snapping behaviour');

     QUnit.module('subIncrement');

     var snapValues = [
         // with a list of snap-to values, tolerance is a <= or >= comparison
         { title: '7 => 7',  input: { value: 7,  tolerance: 2, values: [0, 10, 20] }, output: 7 },
         { title: '8 => 10', input: { value: 8,  tolerance: 2, values: [0, 10, 20] }, output: 10 },

         // and mutual border results in a ceil snapping
         { title: '14.9 => 10', input: { value: 14.9,  tolerance: 5, values: [0, 10, 20] }, output: 10 },
         { title: '15   => 20', input: { value: 15,    tolerance: 5, values: [0, 10, 20] }, output: 20 },
         { title: '15.1 => 20', input: { value: 15.1,  tolerance: 5, values: [0, 10, 20] }, output: 20 },

         // with a step instead of a list of values, tolerance is a strict < or > comparison...
         { title: '8 => 8',  input: { value: 8,  tolerance: 2, values: 10 }, output: 8 },
         { title: '8 => 10', input: { value: 8,  tolerance: 3, values: 10 }, output: 10 },

         // so mutual borders are not snapped!
         { title: '14 => 10', input: { value: 14,  tolerance: 5, values: 10 }, output: 10 },
         { title: '15 => 15', input: { value: 15,  tolerance: 5, values: 10 }, output: 15 }, // <= surprising...
         { title: '16 => 20', input: { value: 16,  tolerance: 5, values: 10 }, output: 20 },

         // tolerance conflicts results in a ceil snapping
         { title: '22 => 20', input: { value: 22, tolerance: 3, values: 5 }, output: 20 },
         { title: '23 => 25', input: { value: 23, tolerance: 3, values: 5 }, output: 25 },
         { title: '24 => 25', input: { value: 24, tolerance: 3, values: 5 }, output: 25 },

         // real-world examples for implementation of snapping functionality with Step and subStep

         // width: 300,  0 < x < 7,  step: 1,  substep: 2,  unit: 43
         // [0] ..12,25.. [21,5] ..33.75.. [43] ... [64,5] ... [86] ...  [107,5] ... [129] ... (px)
         //  0                               1                   2                      3  ... (units)
         { title: '12    => 0',     input: { value: 12,     tolerance: 12.25, values: 21.5 }, output: 0 },
         { title: '12.25 => 21.5',  input: { value: 12.25,  tolerance: 12.25, values: 21.5 }, output: 21.5 },
         { title: '13    => 21.5',  input: { value: 13,     tolerance: 12.25, values: 21.5 }, output: 21.5 },
         { title: '50    => 43',    input: { value: 50,     tolerance: 12.25, values: 21.5 }, output: 43 },
         { title: '100   => 107.5', input: { value: 100,    tolerance: 12.25, values: 21.5 }, output: 107.5 },

         // height: 340, 0 < y < 100,  step: 10, substep: 2,  unit: 3.4
         // [0] ..3,4..6,8..10,2..13,6.. [17] ..20,4..23,8..27,2..30,6.. [34] ... [51] ... [68] ... (px)
         //  0                                                            10                20  ... (units)
         { title: '12 => 17', input: { value: 12, tolerance: 8.5, values: 17 }, output: 17 },
         { title: '20 => 17', input: { value: 20, tolerance: 8.5, values: 17 }, output: 17 },
         { title: '25 => 17', input: { value: 25, tolerance: 8.5, values: 17 }, output: 17 },
         { title: '50 => 51', input: { value: 50, tolerance: 8.5, values: 17 }, output: 51 },

         // width: 500, 0 < x < 100, step: 10, substep: 5, unit: 5
         // [0] ..2.. [4] ..6.. [8] ..10.. [12] ..14.. [16] ..18.. [20] ... (px)
         //  0                                                      10  ... (units)
         { title: '5 => 4', input: { value: 5, tolerance: 2, values: 4 }, output: 4 },
         { title: '6 => 6 (WRONG)', input: { value: 6, tolerance: 2, values: 4 }, output: 6 }, // <= this is not snapped !!! (see above)
         { title: '7 => 8', input: { value: 7, tolerance: 2, values: 4 }, output: 8 },

         // let's try with a list of snap-to values...
         { title: '5 => 4', input: { value: 5, tolerance: 2, values: [0, 4, 8] }, output: 4 },
         { title: '6 => 8', input: { value: 6, tolerance: 2, values: [0, 4, 8] }, output: 8 }, // <= works
         { title: '7 => 8', input: { value: 7, tolerance: 2, values: [0, 4, 8] }, output: 8 }

         // bottom line, list of snap-to values makes more sense...
     ];

     QUnit
     .cases(snapValues)
     .test('Raphael.snapTo', function test(data, assert) {
         var snappedValue = Raphael.snapTo(data.input.values, data.input.value, data.input.tolerance);
         assert.equal(snappedValue, data.output, ' snapping ' + data.input.value + ' => ' + snappedValue);
     });

});
