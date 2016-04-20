define([
    'PARCC/gridFactory',
    'OAT/scale.raphael',
    'jquery'
], function(gridFactory, scaleRaphael, $){
    QUnit.module('gridFactory');

    var outputContainer = "#paper";
    // var outputContainer = "#paper-hidden";

    var gridParameters = [
        { title: 'simple', input: {
            graphTitle : 'simple',
            x : { start : -6, end : 10, unit : 20, step : 1, label: 'x' },
            y : { start : -10, end : 6, unit : 20, step : 1, label: 'y' }
        }, output: {
            width: 320, height: 320
        }, outputContainer: 'test_01' },

        { title: 'x > 0', input: {
            graphTitle : 'x > 0',
            x : { start : 5, end : 10, unit : 20, step : 2, label: 'x' },
            y : { start : -6, end : 10, unit : 20, step : 2, label: 'y' }
        }, output: {
            width: 100, height: 320
        }, outputContainer: 'test_02' },

        { title: 'x < 0', input: {
            graphTitle : 'x < 0',
            x : { start : -10, end : -2, unit : 30, label: 'x' },
            y : { start : -6, end : 10, unit : 10, label: 'y' }
        }, output: {
            width: 240, height: 160
        }, outputContainer: 'test_03' },

        { title: 'y > 0', input: {
            graphTitle : 'y > 0',
            x : { start : -6, end : 10, unit : 5, label: 'x' },
            y : { start : 2, end : 6, unit : 15, label: 'y' }
        }, output: {
            width: 80, height: 60
        }, outputContainer: 'test_04' },

        { title: 'y < 0', input: {
            graphTitle : 'y < 0',
            x : { start : -6, end : 10, unit : 17, step : 2, label: 'x' },
            y : { start : -8,  end : -1, unit : 14, step : 2, label: 'y' }
        }, output: {
            width: 272, height: 98
        }, outputContainer: 'test_05' },

        { title: 'x > 0 && y > 0', input: {
            graphTitle : 'x > 0 && y > 0',
            x : { start : 5, end : 10, unit : 20, label: 'Time (hours)' },
            y : { start : 2, end : 9, unit : 20, step : 3, label: 'Money ($)' }
        }, output: {
            width: 100, height: 140
        }, outputContainer: 'test_06' },

        { title: 'x > 0 && y < 0', input: {
            graphTitle : 'x > 0 && y < 0',
            x : { start : 5, end : 10, unit : 20, label: 'Time (hours)' },
            y : { start : -10, end : -5, unit : 20, label: 'Money ($)' }
        }, output: {
            width: 100, height: 100
        }, outputContainer: 'test_07' },

        { title: 'x < 0 && y < 0', input: {
            graphTitle : 'x < 0 && y < 0',
            x : { start : -10, end : -5, unit : 13, label: 'Time (hours)' },
            y : { start : -10, end : -5, unit : 23, label: 'Money ($)' }
        }, output: {
            width: 65, height: 115
        }, outputContainer: 'test_08' },

        { title: 'x < 0 && y > 0', input: {
            graphTitle : 'x < 0 && y > 0',
            x : { start : -10, end : -5, unit : 20, label: 'Time (hours)' },
            y : { start : 5, end : 10, unit : 20, label: 'Money ($)' }
        }, output: {
            width: 100, height: 100
        }, outputContainer: 'test_09' },

        { title: 'different scales oneQuadrant', input: {
            graphTitle : 'different scales oneQuadrant',
            x : { start : 0, end : 7, unit : 58, step : 1, label: 'Time (hours)' },
            y : { start : -500, end : 0, unit : 0.8, step : 50, label: 'A whole lot of money ($$$$)' }
        }, output: {
            width: 406, height: 400
        }, outputContainer: 'test_10' },

        { title: 'different scales coordinates', input: {
            graphTitle : 'different scales coordinates',
            x : { start : -60, end : 80, unit : 3.6, step : 10, label: 'x' },
            y : { start : -6, end : 8, unit : 36, step : 1, label: 'y' }
        }, output: {
            width: 504, height: 504
        }, outputContainer: 'test_11' },

        { title: 'size in pixels coordinates', input: {
            graphTitle : 'size in pixels coordinates',
            width : 450, height : 300,
            x : { start : -5, end : 5, step : 1, label: 'Time (hours)' },
            y : { start : -50, end : +50, step : 10, label: 'Money ($)' }
        }, output: {
            width: 450, height: 300
        }, outputContainer: 'test_12' },

        { title: 'size in pixels one quadrant', input: {
            graphTitle : 'size in pixels one quadrant',
            width : 450, height : 300,
            x : { start : 0, end : 15, step : 1, label: 'Time (hours)' },
            y : { start : -50, end : 0, step : 5, label: 'Money ($)' }
        }, output: {
            width: 450, height: 300
        }, outputContainer: 'test_13' },

        { title: 'onequadrant, no x label', input: {
            graphTitle : 'onequadrant, no x label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1 },
            y : { start : -50, end : 0, step : 10, label: 'Money ($)' }
        }, output: {
            width: 250, height: 200
        }, outputContainer: 'test_14' },

        { title: 'onequadrant, no y label', input: {
            graphTitle : 'onequadrant, no y label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1, label: 'Time (hours)' },
            y : { start : -50, end : 0, step : 10 }
        }, output: {
            width: 250, height: 200
        }, outputContainer: 'test_15' },

        { title: 'onequadrant, no label', input: {
            graphTitle : 'onequadrant, no label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1 },
            y : { start : -50, end : 0, step : 10 }
        }, output: {
            width: 250, height: 200
        }, outputContainer: 'test_16' },

        { title: 'coordinates, no x label', input: {
            graphTitle : 'coordinates, no x label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1 },
            y : { start : -50, end : 50, step : 10, label: 'y' }
        }, output: {
            width: 250, height: 250
        }, outputContainer: 'test_17' },

        { title: 'coordinates, no y label', input: {
            graphTitle : 'coordinates, no y label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1, label: 'x' },
            y : { start : -50, end : 50, step : 10 }
        }, output: {
            width: 250, height: 250
        }, outputContainer: 'test_18' },

        { title: 'coordinates, no label', input: {
            graphTitle : 'coordinates, no label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1 },
            y : { start : -50, end : 50, step : 10 }
        }, output: {
            width: 250, height: 250
        }, outputContainer: 'test_19' }
    ];

    QUnit
        .cases(gridParameters)
        .test('grid rendering', function test(data, assert) {
            var $container = $('<div class="test ' + data.outputContainer + '_actual"><h3 class="title">' + data.title + '</h3><pre class="grid-config"></pre><div class="shape-container"></div>');

            // display title for all samples
            data.input.graphTitleRequired = true;

            // uncomment to display input parameters above the graph
            // $container.find('.grid-config').append(JSON.stringify(data.input, undefined, 2));

            var grid = initGrid($container, data.input);

            assert.equal(grid.getWidth(),   data.output.width,  'width units ok');
            assert.equal(grid.getHeight(),  data.output.height, 'height units ok');

            $(outputContainer).append($container);

            assert.ok(
                $container.find('.shape-container').html() ===
                $('.' + data.outputContainer + ' .shape-container').html(),
                'rendered markup ok');
        });

    function initGrid($container, gridConfig){

        var paper = createCanvas($container, gridConfig);
        var grid = gridFactory(paper, gridConfig);

        return grid;
    }

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

});
