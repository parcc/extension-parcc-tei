define([
    'PARCC/gridFactory',
    'OAT/scale.raphael',
    'OAT/raphael',
    'jquery'
], function(gridFactory, scaleRaphael, Raphael, $){
    QUnit.module('gridFactory');

    var gridParameters = [
        /* */
        { title: 'simple', input: {
            graphTitle : 'simple',
            x : { start : -6, end : 10, unit : 20, step : 1, label: 'x' },
            y : { start : -10, end : 6, unit : 20, step : 1, label: 'y' }
        }, output: {
            width: 320, height: 320
        }, outputContainer: '.test_01' },

        { title: 'x > 0', input: {
            graphTitle : 'x > 0',
            x : { start : 5, end : 10, unit : 20, step : 2, label: 'x' },
            y : { start : -6, end : 10, unit : 20, step : 2, label: 'y' }
        }, output: {
            width: 100, height: 320
        }, outputContainer: '.test_02' },

        { title: 'x < 0', input: {
            graphTitle : 'x < 0',
            x : { start : -10, end : -2, unit : 30, label: 'x' },
            y : { start : -6, end : 10, unit : 10, label: 'y' }
        }, output: {
            width: 240, height: 160
        }, outputContainer: '.test_03' },

        { title: 'y > 0', input: {
            graphTitle : 'y > 0',
            x : { start : -6, end : 10, unit : 5, label: 'x' },
            y : { start : 2, end : 6, unit : 15, label: 'y' }
        }, output: {
            width: 80, height: 60
        }, outputContainer: '.test_04' },

        { title: 'y < 0', input: {
            graphTitle : 'y < 0',
            x : { start : -6, end : 10, unit : 17, step : 2, label: 'x' },
            y : { start : -8,  end : -1, unit : 14, step : 2, label: 'y' }
        }, output: {
            width: 272, height: 98
        }, outputContainer: '.test_05' },

        { title: 'x > 0 && y > 0', input: {
            graphTitle : 'x > 0 && y > 0',
            x : { start : 5, end : 10, unit : 20, label: 'Time (hours)' },
            y : { start : 2, end : 9, unit : 20, step : 3, label: 'Money ($)' }
        }, output: {
            width: 100, height: 140
        }, outputContainer: '.test_06' },

        { title: 'x > 0 && y < 0', input: {
            graphTitle : 'x > 0 && y < 0',
            x : { start : 5, end : 10, unit : 20, label: 'Time (hours)' },
            y : { start : -10, end : -5, unit : 20, label: 'Money ($)' }
        }, output: {
            width: 100, height: 100
        }, outputContainer: '.test_07' },

        { title: 'x < 0 && y < 0', input: {
            graphTitle : 'x < 0 && y < 0',
            x : { start : -10, end : -5, unit : 13, label: 'Time (hours)' },
            y : { start : -10, end : -5, unit : 23, label: 'Money ($)' }
        }, output: {
            width: 65, height: 115
        }, outputContainer: '.test_08' },

        { title: 'x < 0 && y > 0', input: {
            graphTitle : 'x < 0 && y > 0',
            x : { start : -10, end : -5, unit : 20, label: 'Time (hours)' },
            y : { start : 5, end : 10, unit : 20, label: 'Money ($)' }
        }, output: {
            width: 100, height: 100
        }, outputContainer: '.test_09' },

        { title: 'different scales oneQuadrant', input: {
            graphTitle : 'different scales oneQuadrant',
            x : { start : 0, end : 7, unit : 43, step : 1, label: 'Time (hours)' },
            y : { start : -100, end : 0, unit : 3.4, step : 10, label: 'Money ($)' }
        }, output: {
            width: 301, height: 340
        }, outputContainer: '.test_10' },

        { title: 'different scales coordinates', input: {
            graphTitle : 'different scales coordinates',
            x : { start : -60, end : 80, unit : 3.6, step : 10, label: 'x' },
            y : { start : -6, end : 8, unit : 36, step : 1, label: 'y' }
        }, output: {
            width: 504, height: 504
        }, outputContainer: '.test_11' },

        { title: 'size in pixels coordinates', input: {
            graphTitle : 'size in pixels coordinates',
            width : 450, height : 300,
            x : { start : -5, end : 5, step : 1, label: 'Time (hours)' },
            y : { start : -50, end : +50, step : 10, label: 'Money ($)' }
        }, output: {
            width: 450, height: 300
        }, outputContainer: '.test_12' },

        { title: 'size in pixels one quadrant', input: {
            graphTitle : 'size in pixels one quadrant',
            width : 450, height : 300,
            x : { start : 0, end : 15, step : 1, label: 'Time (hours)' },
            y : { start : -50, end : 0, step : 5, label: 'Money ($)' }
        }, output: {
            width: 450, height: 300
        }, outputContainer: '.test_13' },

        { title: 'onequadrant, no x label', input: {
            graphTitle : 'onequadrant, no x label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1 },
            y : { start : -50, end : 0, step : 10, label: 'Money ($)' }
        }, output: {
            width: 250, height: 200
        }, outputContainer: '.test_14' },

        { title: 'onequadrant, no y label', input: {
            graphTitle : 'onequadrant, no y label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1, label: 'Time (hours)' },
            y : { start : -50, end : 0, step : 10 }
        }, output: {
            width: 250, height: 200
        }, outputContainer: '.test_15' },

        { title: 'onequadrant, no label', input: {
            graphTitle : 'onequadrant, no label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1 },
            y : { start : -50, end : 0, step : 10 }
        }, output: {
            width: 250, height: 200
        }, outputContainer: '.test_16' },

        { title: 'coordinates, no x label', input: {
            graphTitle : 'coordinates, no x label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1 },
            y : { start : -50, end : 50, step : 10, label: 'y' }
        }, output: {
            width: 250, height: 250
        }, outputContainer: '.test_17' },

        { title: 'coordinates, no y label', input: {
            graphTitle : 'coordinates, no y label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1, label: 'x' },
            y : { start : -50, end : 50, step : 10 }
        }, output: {
            width: 250, height: 250
        }, outputContainer: '.test_18' },

        { title: 'coordinates, no label', input: {
            graphTitle : 'coordinates, no label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1 },
            y : { start : -50, end : 50, step : 10 }
        }, output: {
            width: 250, height: 250
        }, outputContainer: '.test_19' }
        /* */
    ];
    /* */
    QUnit
        .cases(gridParameters)
        .test('grid rendering', function test(data, assert) {
            var $container = $('<div class="test ' + data.outputContainer + '_actual"><h3 class="title">' + data.title + '</h3><pre class="grid-config"></pre><div class="shape-container"></div>');

            // uncomment to display input above the graph
            // $container.find('.grid-config').append(JSON.stringify(data.input, undefined, 2));

            var grid = initGrid($container, data.input);

            assert.equal(grid.getWidth(),   data.output.width,  'width units ok');
            assert.equal(grid.getHeight(),  data.output.height, 'height units ok');

            $('#paper').append($container);

            assert.ok(
                $container.find('.shape-container').html() ===
                $(data.outputContainer + ' .shape-container').html(),
                'rendered markup ok');
        });

    function initGrid($container, gridConfig){

        var paper = createCanvas($container, gridConfig);
        var grid = gridFactory(paper, gridConfig);

        return grid;
    }
    /**
     * Create the minimum canvas and display it
     * @param  {Object} $container jQuery node
     * @param  {Object} config     configuration ( cleaned )
     * @return {Object}            Paper ( RaphaelJS )
     */
    function createCanvas($container, config){

        var width = (config.width) ? config.width : (config.x.end - config.x.start) * config.x.unit,
            height = (config.height) ? config.height : (config.y.end - config.y.start) * config.y.unit;

        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            width + 20*2 + 28, // we assume a label with default size
            height + 20*2 + 28 + 40 // we assume a label and a title with default size
        );

        return paper;
    }

    /* * /
     QUnit.module('subIncrement');

     var snapValues = [
     // with a list of snap-to values, tolerance is a <= or >= comparison
     { title: '7 => 7',  input: { value: 7,  tolerance: 2, values: [0, 10, 20] }, output: 7 },
     { title: '8 => 10', input: { value: 8,  tolerance: 2, values: [0, 10, 20] }, output: 10 },

     // and mutual border results in a ceil snapping
     { title: '14.9 => 20', input: { value: 14.9,  tolerance: 5, values: [0, 10, 20] }, output: 10 },
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
     /* */


});
