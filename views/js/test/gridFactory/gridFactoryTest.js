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
 * Copyright (c) 2015-2017 Parcc, Inc.
 */


define([
    'PARCC/gridFactory',
    'OAT/scale.raphael',
    'jquery'
], function(gridFactory, scaleRaphael, $){
    'use strict';
    QUnit.module('gridFactory');

    var outputContainer = "#paper";
    // var outputContainer = "#paper-hidden";

    var gridFactoryParameters = [
        /* */
        { title: 'simple, no title', input: {
            graphTitle : null,
            x : { start : -6, end : 10, unit : 20, step : 1, label: 'x' },
            y : { start : -10, end : 6, unit : 20, step : 1, label: 'y' }
        }, output: {
            width: 320, height: 320,
            paperWidth: 404, paperHeight: 404
        }, outputContainer: 'test_01' },

        { title: 'x > 0', input: {
            graphTitle : 'x > 0',
            x : { start : 5, end : 10, unit : 20, step : 2, label: 'x' },
            y : { start : -6, end : 10, unit : 20, step : 2, label: 'y' }
        }, output: {
            width: 100, height: 320,
            paperWidth: 184, paperHeight: 444
        }, outputContainer: 'test_02' },

        { title: 'x < 0', input: {
            graphTitle : 'x < 0',
            x : { start : -10, end : -2, unit : 30, label: 'x' },
            y : { start : -6, end : 10, unit : 10, label: 'y' }
        }, output: {
            width: 240, height: 160,
            paperWidth: 324, paperHeight: 284
        }, outputContainer: 'test_03' },

        { title: 'y > 0', input: {
            graphTitle : 'y > 0',
            x : { start : -6, end : 10, unit : 5, label: 'x' },
            y : { start : 2, end : 6, unit : 15, label: 'y' }
        }, output: {
            width: 80, height: 60,
            paperWidth: 164, paperHeight: 184
        }, outputContainer: 'test_04' },

        { title: 'y < 0', input: {
            graphTitle : 'y < 0',
            x : { start : -6, end : 10, unit : 17, step : 2, label: 'x' },
            y : { start : -8,  end : -1, unit : 14, step : 2, label: 'y' }
        }, output: {
            width: 272, height: 98,
            paperWidth: 356, paperHeight: 222
        }, outputContainer: 'test_05' },

        { title: 'x > 0 && y > 0', input: {
            graphTitle : 'x > 0 && y > 0',
            x : { start : 5, end : 10, unit : 20, label: 'h', title: 'Time (hours)' },
            y : { start : 2, end : 9, unit : 20, step : 3, label: '$', title:  'Money' }
        }, output: {
            width: 100, height: 140,
            paperWidth: 220, paperHeight: 276
        }, outputContainer: 'test_06' },

        { title: 'x > 0 && y < 0', input: {
            graphTitle : 'x > 0 && y < 0',
            x : { start : 5, end : 10, unit : 20, label: 'h', title: 'Time (hours)' },
            y : { start : -10, end : -5, unit : 20, label: '$', title:  'Money' }
        }, output: {
            width: 100, height: 100,
            paperWidth: 220, paperHeight: 260
        }, outputContainer: 'test_07' },

        { title: 'x < 0 && y < 0', input: {
            graphTitle : 'x < 0 && y < 0',
            x : { start : -10, end : -5, unit : 13, label: 'h', title: 'Time (hours)' },
            y : { start : -10, end : -5, unit : 23, label: '$', title:  'Money' }
        }, output: {
            width: 65, height: 115,
            paperWidth: 161, paperHeight: 275
        }, outputContainer: 'test_08' },

        { title: 'x < 0 && y > 0', input: {
            graphTitle : 'x < 0 && y > 0',
            x : { start : -10, end : -5, unit : 20, label: 'h', title: 'Time (hours)' },
            y : { start : 5, end : 10, unit : 20, label: '$', title:  'Money' }
        }, output: {
            width: 100, height: 100,
            paperWidth: 196, paperHeight: 236
        }, outputContainer: 'test_09' },

        { title: 'different scales oneQuadrant', input: {
            graphTitle : 'different scales oneQuadrant',
            x : { start : 0, end : 7, unit : 58, step : 1, label: 'h', title: 'Time (hours)' },
            y : { start : -500, end : 0, unit : 0.8, step : 50, label: '$', title: 'A whole lot of money' }
        }, output: {
            width: 406, height: 400,
            paperWidth: 526, paperHeight: 560
        }, outputContainer: 'test_10' },

        { title: 'different scales coordinates', input: {
            graphTitle : 'different scales coordinates',
            x : { start : -60, end : 80, unit : 3.6, step : 10, label: 'x' },
            y : { start : -6, end : 8, unit : 36, step : 1, label: 'y' }
        }, output: {
            width: 504, height: 504,
            paperWidth: 588, paperHeight: 628
        }, outputContainer: 'test_11' },

        { title: 'size in pixels coordinates', input: {
            graphTitle : 'size in pixels coordinates',
            width : 450, height : 300,
            x : { start : -5, end : 5, step : 1, label: 'h', title: 'Time (hours)' },
            y : { start : -50, end : +50, step : 10, label: '$', title:  'Money' }
        }, output: {
            width: 450, height: 300,
            paperWidth: 570, paperHeight: 460
        }, outputContainer: 'test_12' },

        { title: 'size in pixels one quadrant', input: {
            graphTitle : 'size in pixels one quadrant',
            width : 450, height : 300,
            x : { start : 0, end : 15, step : 1, label: 'h', title: 'Time (hours)' },
            y : { start : -50, end : 0, step : 5, label: '$', title:  'Money' }
        }, output: {
            width: 450, height: 300,
            paperWidth: 570, paperHeight: 460
        }, outputContainer: 'test_13' },

        { title: 'onequadrant, no x label', input: {
            graphTitle : 'onequadrant, no x label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1 },
            y : { start : -50, end : 0, step : 10, label: '$', title: 'Money' }
        }, output: {
            width: 250, height: 200,
            paperWidth: 346, paperHeight: 324
        }, outputContainer: 'test_14' },

        { title: 'onequadrant, no y label', input: {
            graphTitle : 'onequadrant, no y label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1, label: 't', title: 'Time' },
            y : { start : -50, end : 0, step : 10 }
        }, output: {
            width: 250, height: 200,
            paperWidth: 334, paperHeight: 336
        }, outputContainer: 'test_15' },

        { title: 'onequadrant, no label', input: {
            graphTitle : 'onequadrant, no label',
            width : 250, height : 200,
            x : { start : 0, end : 10, step : 1 },
            y : { start : -50, end : 0, step : 10 }
        }, output: {
            width: 250, height: 200,
            paperWidth: 310, paperHeight: 300
        }, outputContainer: 'test_16' },

        { title: 'coordinates, no x label', input: {
            graphTitle : 'coordinates, no x label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1 },
            y : { start : -50, end : 50, step : 10, label: 'y' }
        }, output: {
            width: 250, height: 250,
            paperWidth: 310, paperHeight: 374
        }, outputContainer: 'test_17' },

        { title: 'coordinates, no y label', input: {
            graphTitle : 'coordinates, no y label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1, label: 'x' },
            y : { start : -50, end : 50, step : 10 }
        }, output: {
            width: 250, height: 250,
            paperWidth: 334, paperHeight: 350
        }, outputContainer: 'test_18' },

        { title: 'coordinates, no label', input: {
            graphTitle : 'coordinates, no label',
            width : 250, height : 250,
            x : { start : -5, end : 5, step : 1 },
            y : { start : -50, end : 50, step : 10 }
        }, output: {
            width: 250, height: 250,
            paperWidth: 310, paperHeight: 350
        }, outputContainer: 'test_19' },
        /* */
        { title: 'Bouncing ball experiment', input: {
            //graphTitle : 'Bouncing ball experiment',
            width : 500, height : 500,
            x : { start : 0, end : 275,  step : 25, label: 'i', title: 'Height of Drop (in inches)' },
            y : { start : -325, end : 0,  step : 25, label: 'i', title: 'Height of Bounce (in inches)' }
        }, output: {
            width: 495, height: 487.5,
            paperWidth: 615, paperHeight: 607.5
        }, outputContainer: 'test_20' }
        /* */
    ];

    QUnit
        .cases(gridFactoryParameters)
        .test('grid rendering', function test(data, assert) {
            var $container = $('<div class="test ' + data.outputContainer + '_actual"><h3 class="title">' + data.title + '</h3><pre class="grid-config"></pre><div class="shape-container"></div>');
            $(outputContainer).append($container);

            // display title for all samples
            data.input.graphTitleRequired = true;

            // uncomment to display input parameters above the graph
            // $container.find('.grid-config').append(JSON.stringify(data.input, undefined, 2));

            var paperSize = gridFactory.getPaperSize(data.input),
                grid = initGrid($container, data.input, paperSize);

            assert.equal(grid.getWidth(),   data.output.width,  'width ok');
            assert.equal(grid.getHeight(),  data.output.height, 'height ok');
            assert.equal(paperSize.width,   data.output.paperWidth,  'paper width ok');
            assert.equal(paperSize.height,  data.output.paperHeight, 'paper height ok');

            assert.ok(
                $container.find('.shape-container svg').html() ===
                $('.' + data.outputContainer + ' .shape-container svg').html(),
                'rendered markup ok');
        });

    function initGrid($container, gridConfig, paperSize){

        var paper = createCanvas($container, paperSize);
        var grid = gridFactory(paper, gridConfig);

        return grid;
    }

    function createCanvas($container, paperSize){
        var paper = scaleRaphael(
                $('.shape-container', $container)[0],
                paperSize.width,
                paperSize.height
            );
        return paper;
    }

});
