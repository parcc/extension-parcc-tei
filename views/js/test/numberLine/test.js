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
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!parccTei/test/samples/numberLine.json'
], function($, _, qtiItemRunner, itemData){

    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
            name : 'portableElementLocation',
            handle : function handlePortableElementLocation(url){
                if(/graphNumberLineInteraction/.test(url.toString())){
                    return '../../../parccTei/views/js/pciCreator/dev/' + url.toString();
                }
            }
        }, {
            name : 'default',
            handle : function defaultStrategy(url){
                return url.toString();
            }
        }];

    module('Number Line Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('rendering', function(assert){

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){

                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                assert.equal($container.find('.qti-customInteraction .graphNumberLineInteraction').length, 1, 'the custom interaction is a fraction model');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');

                QUnit.start();
            })
            .on('responsechange', function(response){
                console.log(response.RESPONSE);
            })
            .assets(strategies)
            .init()
            .render($container);

    });

    QUnit.asyncTest('response', function(assert){

        var response = {
            record : [
                {
                    name : 'lineTypes',
                    base : {
                        list : {
                            'string' : ['open-closed', 'open-arrow']
                        }
                    }
                },
                {
                    name : 'values',
                    base : {
                        list : {
                            pair : [
                                [-5, -2],
                                [3.5, null]
                            ]
                        }
                    }
                }
            ]
        };
        var $container = $('#' + fixtureContainerId);
        var i = 0;
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){

                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                //set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function(res){

                if(++i == 2){
                    QUnit.start();
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
                }
            })
            .assets(strategies)
            .init()
            .render($container);

    });

    QUnit.asyncTest('state', function(assert){

        var response = {
            record : [
                {
                    name : 'lineTypes',
                    base : {
                        list : {
                            'string' : ['open-closed', 'open-arrow']
                        }
                    }
                },
                {
                    name : 'values',
                    base : {
                        list : {
                            pair : [
                                [-5, -2],
                                [3.5, null]
                            ]
                        }
                    }
                }
            ]
        };
        var i = 0;
        var state = {RESPONSE : response};
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){

                this.setState(state);
                assert.deepEqual(this.getState(), state, 'state set/get ok');
            })
            .on('responsechange', function(res){

                if(++i == 2){
                    QUnit.start();

                    //if the state has been set, the response should have changed
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
                }
            })
            .assets(strategies)
            .init()
            .render($container);

    });

});
