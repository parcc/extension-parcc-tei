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
            width: 320, height: 320
        }, outputContainer: '.test_01' },

        { title: 'x > 0', input: {
            x : { start : 5, end : 10, unit : 20, step : 2 },
            y : { start : -6, end : 10, unit : 20, step : 2 }
        }, output: {
            width: 100, height: 320
        }, outputContainer: '.test_02' },

        { title: 'x < 0', input: {
            x : { start : -10, end : -2, unit : 30 },
            y : { start : -6, end : 10, unit : 10 }
        }, output: {
            width: 240, height: 160
        }, outputContainer: '.test_03' },

        { title: 'y > 0', input: {
            x : { start : -6, end : 10, unit : 5 },
            y : { start : 2, end : 6, unit : 15 }
        }, output: {
            width: 80, height: 60
        }, outputContainer: '.test_04' },

        { title: 'y < 0', input: {
            x : { start : -6, end : 10, unit : 17, step : 2 },
            y : { start : -8,  end : -1, unit : 14, step : 2 }
        }, output: {
            width: 272, height: 98
        }, outputContainer: '.test_05' },

        { title: 'x > 0 && y > 0', input: {
            x : { start : 5, end : 10, unit : 20 },
            y : { start : 2, end : 9, unit : 20, step : 3 }
        }, output: {
            width: 100, height: 140
        }, outputContainer: '.test_06' },

        { title: 'x > 0 && y < 0', input: {
            x : { start : 5, end : 10, unit : 20 },
            y : { start : -10, end : -5, unit : 20 }
        }, output: {
            width: 100, height: 100
        }, outputContainer: '.test_07' },

        { title: 'x < 0 && y < 0', input: {
            x : { start : -10, end : -5, unit : 13 },
            y : { start : -10, end : -5, unit : 23 }
        }, output: {
            width: 65, height: 115
        }, outputContainer: '.test_08' },

        { title: 'x < 0 && y > 0', input: {
            x : { start : -10, end : -5, unit : 20 },
            y : { start : 5, end : 10, unit : 20 }
        }, output: {
            width: 100, height: 100
        }, outputContainer: '.test_09' },

        { title: 'different scales oneQuadrant', input: {
            x : { start : 0, end : 7, unit : 43, step : 1 },
            y : { start : -100, end : 0, unit : 3.4, step : 10 }
        }, output: {
            width: 301, height: 340
        }, outputContainer: '.test_10' },

        { title: 'different scales coordinates', input: {
            x : { start : -60, end : 80, unit : 3.6, step : 10 },
            y : { start : -6, end : 8, unit : 36, step : 1 }
        }, output: {
            width: 504, height: 504
        }, outputContainer: '.test_11' }
        /* */
    ];

    QUnit
        .cases(gridParameters)
        .test('grid rendering', function test(data, assert) {
            var $container = $('<div class="test ' + data.outputContainer + '_actual"><h3 class="title">' + data.title + '</h2><pre class="grid-config"></pre><div class="shape-container"></div>');

            $container.find('.grid-config').append(formatJson(data.input));

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

        var padding = 20*2,
            width = (config.x.end - config.x.start) * config.x.unit,
            height= (config.y.end - config.y.start) * config.y.unit;

        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            width + padding,
            height + padding
        );

        return paper;
    }

    function formatJson(json){
        return JSON.stringify(json, undefined, 2);
    }

});
