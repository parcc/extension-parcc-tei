define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!parccTei/test/samples/pointLineGraph.json'
], function ($, _, qtiItemRunner, fractionData){

    'use strict';

    var runner;
    var fixtureContainerId = 'outside-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
            name : 'portableElementLocation',
            handle : function handlePortableElementLocation(url){
                if(/graphPointLineGraph/.test(url.toString())){
                    return '../../../parccTei/views/js/pciCreator/dev/' + url.toString();
                }
            }
        }, {
            name : 'default',
            handle : function defaultStrategy(url){
                return url.toString();
            }
        }];

    module('Point Line Graph Interaction');

    QUnit.asyncTest('rendering', function (assert){

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', fractionData)
            .on('render', function (){

                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                // assert.equal($container.find('.qti-customInteraction .graphPointLineGraphInteraction').length, 1, 'the custom interaction is a fraction model');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* * /
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

        runner = qtiItemRunner('qti', fractionData)
            .on('render', function (){

                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                assert.equal($container.find('.qti-customInteraction .graphPointLineGraphInteraction').length, 1, 'the custom interaction is a fraction model');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('response', function (assert){

        var response = {
            record : [
                {
                    name : 'functionGraphType',
                    base : {'string' : 'plotLinear'}
                },
                {
                    name : 'points',
                    list : {
                        point : [
                            [-2, -8],
                            [6, -1]
                        ]
                    }
                }
            ]
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', fractionData)
            .on('render', function (){

                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                //set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function (res){

                QUnit.start();

                assert.ok(_.isPlainObject(res), 'response changed');
                assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
            })
            .assets(strategies)
            .init()
            .render($container);

    });

    QUnit.asyncTest('state', function (assert){

        var response = {
            record : [
                {
                    name : 'functionGraphType',
                    base : {'string' : 'plotLinear'}
                },
                {
                    name : 'points',
                    list : {
                        point : [
                            [-2, -8],
                            [6, -1]
                        ]
                    }
                }
            ]
        };
        var state = {RESPONSE : response};
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', fractionData)
            .on('render', function (){

                this.setState(state);
                assert.deepEqual(this.getState(), state, 'state set/get ok');
            })
            .on('responsechange', function (res){

                QUnit.start();

                //if the state has been set, the response should have changed
                assert.ok(_.isPlainObject(res), 'response changed');
                assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
            })
            .assets(strategies)
            .init()
            .render($container);

    });
    /* */
});

