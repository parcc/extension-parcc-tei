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
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!parccTei/test/samples/graphFunction.json'
], function ($, _, qtiItemRunner, ciRegistry, pciTestProvider, itemData){

    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    //manually register the pci from its manifest
    pciTestProvider.addManifestPath(
        'graphFunctionInteraction',
        'parccTei/pciCreator/ims/graphFunctionInteraction/imsPciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    module('Graph Function Interaction', {
        teardown : function (){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('rendering', function (assert){

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){

                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                assert.equal($container.find('.qti-customInteraction .graphFunctionInteraction').length, 1, 'the custom interaction is a fraction model');

                QUnit.start();
            })
            .on('error', function(error) {
                window.console.log(error);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('response', function (assert){
        var response = {
            record : [
                {
                    name : 'functionGraphType',
                    base : {string : 'linear'}
                },
                {
                    name : 'points',
                    base : {string : '-2 -8,6 1'}
                }
            ]
        };

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){
                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                interaction.setResponse(response);
            })
            .on('responsechange', function (res){
                QUnit.start();

                //if the state has been set, the response should have changed
                assert.ok(_.isPlainObject(res), 'response changed');
                assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
            })
            .on('error', function(error) {
                window.console.log(error);
            })
            .init()
            .render($container);

    });

    QUnit.asyncTest('state', function (assert){

        var response = {
            record : [
                {
                    name : 'functionGraphType',
                    base : {string : 'linear'}
                },
                {
                    name : 'points',
                    base : {string : '-2 -8,6 1'}
                }
            ]
        };
        var state = {RESPONSE : response};
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){
                assert.deepEqual(this.getState(), state, 'state set/get ok');

                QUnit.start();
            })
            .on('error', function(error) {
                window.console.log(error);
            })
            .init()
            .render($container, { state: state });
    });

    QUnit.module('Visual test');

    QUnit.asyncTest('display and play', function(assert){
        var $container = $('#' + outsideContainerId);

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                assert.equal($container.children().length, 1, 'the container a elements');
                QUnit.start();
            })
            .on('error', function(error) {
                window.console.log(error);
            })
            .init()
            .render($container);
    });

});
