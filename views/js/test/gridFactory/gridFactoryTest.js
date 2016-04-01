define([
    'PARCC/gridFactory',
    'OAT/scale.raphael',
    'jquery'
], function(gridFactory, scaleRaphael, $){

    QUnit.module('gridFactory');

    var unitSize = 20;
    var gridParameters = [
        { title: 'simple', input: {
            x : {
                start : -6,
                end : 10,
                unit : unitSize
            },
            y : {
                start : -10,
                end : 6,
                unit : unitSize
            }
        }, outputContainer: '.test_01' },

        { title: 'x > 0', input: {
            x : {
                start : 5,
                end : 10,
                unit : unitSize
            },
            y : {
                start : -6,
                end : 10,
                unit : unitSize
            }
        }, outputContainer: '.test_02' },

        { title: 'x < 0', input: {
            x : {
                start : -10,
                end : -2,
                unit : unitSize
            },
            y : {
                start : -6,
                end : 10,
                unit : unitSize
            }
        }, outputContainer: '.test_03' },

        { title: 'y > 0', input: {
            x : {
                start : -6,
                end : 10,
                unit : unitSize
            },
            y : {
                start : 2,
                end : 6,
                unit : unitSize
            }
        }, outputContainer: '.test_04' },

        { title: 'y < 0', input: {
            x : {
                start : -6,
                end : 10,
                unit : unitSize
            },
            y : {
                start : -8,
                end : -1,
                unit : unitSize
            }
        }, outputContainer: '.test_05' },

        { title: 'x > 0 && y > 0', input: {
            x : {
                start : 5,
                end : 10,
                unit : unitSize
            },
            y : {
                start : 5,
                end : 10,
                unit : unitSize
            }
        }, outputContainer: '.test_06' },

        { title: 'x > 0 && y < 0', input: {
            x : {
                start : 5,
                end : 10,
                unit : unitSize
            },
            y : {
                start : -10,
                end : -5,
                unit : unitSize
            }
        }, outputContainer: '.test_07' },

        { title: 'x < 0 && y < 0', input: {
            x : {
                start : -10,
                end : -5,
                unit : unitSize
            },
            y : {
                start : -10,
                end : -5,
                unit : unitSize
            }
        }, outputContainer: '.test_08' },

        { title: 'x < 0 && y > 0', input: {
            x : {
                start : -10,
                end : -5,
                unit : unitSize
            },
            y : {
                start : 5,
                end : 10,
                unit : unitSize
            }
        }, outputContainer: '.test_09' },

        { title: 'different scales', input: {
            // height: 500,
            // width: 500,
            x : {
                start : 0,
                end : 10,
                unit: unitSize,
                step: 10
            },
            y : {
                start : -100,
                end : 0,
                unit: unitSize,
                step : 10
            }
        }, outputContainer: '.test_10' }
    ];

    QUnit
        .cases(gridParameters)
        .test('grid rendering', function test(data, assert) {
            var $container = $('<div class="test ' + data.outputContainer + '_actual"><h3 class="title">' + data.title + '</h2><pre class="grid-config"></pre><div class="shape-container"></div>');

            $container.find('.grid-config').append(formatJson(data.input));

            var grid = initGrid($container, data.input);

            $('#paper').append($container);

            assert.ok(
                $container.find('.shape-container').html() ===
                $(data.outputContainer + ' .shape-container').html());
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

        var padding = 20*2;
        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            (config.x.end - config.x.start) * config.x.unit + padding,
            (config.y.end - config.y.start) * config.y.unit + padding
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

    function test(testName, gridConfig){

        var $container = $('<div class="test"><h3 class="title">' + testName + '</h2><pre class="grid-config"></pre><div class="shape-container"></div></div>');
        $container.find('.grid-config').append(formatJson(gridConfig));
        var grid = initGrid($container, gridConfig);

        $('#paper').append($container);
    }

    return {
        test : test
    };

});
