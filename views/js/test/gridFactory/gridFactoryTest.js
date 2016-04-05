define([
    'PARCC/gridFactory',
    'OAT/scale.raphael',
    'jquery'
], function(gridFactory, scaleRaphael, $){

    QUnit.module('gridFactory');

    var gridParameters = [
        /* */
        { title: 'simple', input: {
            x : { start : -6, end : 10, unit : 20, weight : 3, step : 1 },
            y : { start : -10, end : 6, unit : 20, weight : 3, step : 1 }
        }, output: {
            width: 320, height: 320, x : { lines : 16, unit : 20 }, y : { lines : 16, unit : 20 }
        }, outputContainer: '.test_01' },

        { title: 'x > 0', input: {
            x : { start : 5, end : 10, unit : 20, step : 2 },
            y : { start : -6, end : 10, unit : 20, step : 2 }
        }, output: {
            width: 100, height: 320, x : { lines : 5, unit : 20 }, y : { lines : 16, unit : 20 }
        }, outputContainer: '.test_02' },

        { title: 'x < 0', input: {
            x : { start : -10, end : -2, unit : 30 },
            y : { start : -6, end : 10, unit : 10 }
        }, output: {
            width: 240, height: 160, x : { lines : 8, unit : 30 }, y : { lines : 16, unit : 10 }
        }, outputContainer: '.test_03' },

        { title: 'y > 0', input: {
            x : { start : -6, end : 10, unit : 5 },
            y : { start : 2, end : 6, unit : 15 }
        }, output: {
            width: 80, height: 60, x : { lines : 16, unit : 5 }, y : { lines : 4, unit : 15 }
        }, outputContainer: '.test_04' },

        { title: 'y < 0', input: {
            x : { start : -6, end : 10, unit : 17, step : 2 },
            y : { start : -8,  end : -1, unit : 14, step : 2 }
        }, output: {
            width: 272, height: 98, x : { lines : 16, unit : 17 }, y : { lines : 7, unit : 14 }
        }, outputContainer: '.test_05' },

        { title: 'x > 0 && y > 0', input: {
            x : { start : 5, end : 10, unit : 20 },
            y : { start : 5, end : 10, unit : 20 }
        }, output: {
            width: 100, height: 100, x : { lines : 5, unit : 20 }, y : { lines : 5, unit : 20 }
        }, outputContainer: '.test_06' },

        { title: 'x > 0 && y < 0', input: {
            x : { start : 5, end : 10, unit : 20 },
            y : { start : -10, end : -5, unit : 20 }
        }, output: {
            width: 100, height: 100, x : { lines : 5, unit : 20 }, y : { lines : 5, unit : 20 }
        }, outputContainer: '.test_07' },

        { title: 'x < 0 && y < 0', input: {
            x : { start : -10, end : -5, unit : 13 },
            y : { start : -10, end : -5, unit : 23 }
        }, output: {
            width: 65, height: 115, x : { lines : 5, unit : 13 }, y : { lines : 5, unit : 23 }
        }, outputContainer: '.test_08' },

        { title: 'x < 0 && y > 0', input: {
            x : { start : -10, end : -5, unit : 20 },
            y : { start : 5, end : 10, unit : 20 }
        }, output: {
            width: 100, height: 100, x : { lines : 5, unit : 20 }, y : { lines : 5, unit : 20 }
        }, outputContainer: '.test_09' },
/*
        { title: 'different scales', input: {
            height: 500,
            width: 500,
            x : { start : 0, end : 20, lines: 10 },
            y : { start : -100, end : 0, lines : 20 }
        }, output: {
            width: 500, height: 500, x : { lines : 10, unit : 50 }, y : { lines : 20, unit : 25 }
        }, outputContainer: '.test_10' }
        /* */
    ];

    QUnit
        .cases(gridParameters)
        .test('grid rendering', function test(data, assert) {
            var $container = $('<div class="test ' + data.outputContainer + '_actual"><h3 class="title">' + data.title + '</h2><pre class="grid-config"></pre><div class="shape-container"></div>');

            $container.find('.grid-config').append(formatJson(data.input));

            var grid = initGrid($container, data.input);

            assert.equal(grid.getUnits().x, data.output.x.unit, 'x units ok');
            assert.equal(grid.getUnits().y, data.output.y.unit, 'y units ok');
            assert.equal(grid.getWidth(),   data.output.width,  'width units ok');
            assert.equal(grid.getHeight(),  data.output.height, 'height units ok');
            // assert.equal(grid.getLines().x, data.output.x.lines, 'x lines ok');
            // assert.equal(grid.getLines().y, data.output.y.lines, 'y lines ok');

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

        var padding = 20*2,
            width = config.width || (config.x.end - config.x.start) * config.x.unit,
            height = config.height || (config.y.end - config.y.start) * config.y.unit;

        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            width + padding,
            height + padding
        );

        return paper;
    }

    function initGrid($container, gridConfig){

        var paper = createCanvas($container, gridConfig);
        var grid = gridFactory(paper, gridConfig);

        return grid;
    }

    function formatJson(json){
        return JSON.stringify(json, undefined, 2);
    }

});
