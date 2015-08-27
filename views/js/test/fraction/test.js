define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!parccTei/test/samples/fraction.json'
], function($, _, qtiItemRunner, fractionData){
    'use strict';


    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
        name : 'portableElementLocation',
        handle : function handlePortableElementLocation(url){
            if(/fractionModelInteraction/.test(url.toString())){
                return '../../../parccTei/views/js/pciCreator/dev/' + url.toString();
            }
        }
    }, {
        name : 'default',
        handle : function defaultStrategy(url){
            return url.toString();
        }
    }];

    module('Fraction Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('renders', 11, function(assert){
        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', fractionData)
            .on('render', function(){

                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                assert.equal($container.find('.qti-customInteraction .fractionModelInteraction').length, 1, 'the custom interaction is a fraction model');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');
                assert.equal($container.find('.qti-customInteraction .shape-panel').length, 1, 'the interaction contains the shape panel');
                assert.equal($container.find('.qti-customInteraction .shape-controls button').length, 3, 'the interaction contains 3 controls');
                assert.equal($container.find('.qti-customInteraction .shape-container svg').length, 1, 'the interaction contains the svg element');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('more partitions', 11, function(assert){
        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', fractionData)
            .on('error', function(err){
                assert.ok(false, err);
            })
            .on('render', function(){
                var $more,
                    state;

                assert.equal($container.find('.qti-customInteraction .fractionModelInteraction').length, 1, 'the custom interaction is a fraction model');

                state = this.getState();
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(_.isArray(state.RESPONSE.list), 'The state contains a well formated response');
                assert.equal(_.filter(state.RESPONSE.list).length, 0, 'No selected partition by default');
                assert.equal(state.RESPONSE.list.length, 2, 'There is 2 partitions by default');

                $more = $('.fractionModelInteraction .shape-controls button.more', $container);
                assert.equal($more.length, 1, 'the more button is there');

                $more.click();
            })
            .on('statechange', function(state){

                assert.ok(_.isArray(state.RESPONSE.list), 'The state contains a well formated response');
                assert.equal(_.filter(state.RESPONSE.list).length, 0, 'No selected partition in the state');
                assert.equal(state.RESPONSE.list.length, 3, '3 partitions in the state');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('less partitions', 11, function(assert){
        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        //update the sample to start with 4 partitions
        var updatedFractionData = _.cloneDeep(fractionData);
        updatedFractionData.body.elements['interaction_portablecustominteraction_55d335dc09320426692022'].properties.partitionInit = 4;

        runner = qtiItemRunner('qti', updatedFractionData)
            .on('error', function(err){
                assert.ok(false, err);
            })
            .on('render', function(){
                var $fewer,
                    state;

                assert.equal($container.find('.qti-customInteraction .fractionModelInteraction').length, 1, 'the custom interaction is a fraction model');

                state = this.getState();
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(_.isArray(state.RESPONSE.list), 'The state contains a well formated response');
                assert.equal(_.filter(state.RESPONSE.list).length, 0, 'No selected partition by default');
                assert.equal(state.RESPONSE.list.length, 4, 'There is 4 partitions by default');

                $fewer = $('.fractionModelInteraction .shape-controls button.fewer', $container);
                assert.equal($fewer.length, 1, 'the less button is there');

                $fewer.click();
            })
            .on('statechange', function(state){

                assert.ok(_.isArray(state.RESPONSE.list), 'The state contains a well formated response');
                assert.equal(_.filter(state.RESPONSE.list).length, 0, 'No selected partition in the state');
                assert.equal(state.RESPONSE.list.length, 3, '3 partitions in the state');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('select partitions', 11, function(assert){
        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        //update the sample to start with 4 partitions
        var updatedFractionData = _.cloneDeep(fractionData);
        updatedFractionData.body.elements['interaction_portablecustominteraction_55d335dc09320426692022'].properties.partitionInit = 4;

        runner = qtiItemRunner('qti', updatedFractionData)
            .on('error', function(err){
                assert.ok(false, err);
            })
            .on('render', function(){
                var $partitions,
                    state;

                assert.equal($container.find('.qti-customInteraction .fractionModelInteraction').length, 1, 'the custom interaction is a fraction model');

                state = this.getState();
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(_.isArray(state.RESPONSE.list), 'The state contains a well formated response');
                assert.equal(_.filter(state.RESPONSE.list).length, 0, 'No selected partition by default');
                assert.equal(state.RESPONSE.list.length, 4, 'There is 4 partitions by default');

                $partitions = $('.fractionModelInteraction .shape-container svg > path', $container);
                assert.equal($partitions.length, 4, 'There is 4 partitions in the canvas');

                var event = document.createEvent("SVGEvents");
                event.initEvent("click",true,true);
                $partitions[0].dispatchEvent(event);
            })
            .on('statechange', function(state){

                assert.ok(_.isArray(state.RESPONSE.list), 'The state contains a well formated response');
                assert.equal(_.filter(state.RESPONSE.list).length, 1, '1 partition is selected');
                assert.equal(state.RESPONSE.list.length, 4, '4 partitions in the state');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('set state', 10, function(assert){
        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', fractionData)
            .on('error', function(err){
                assert.ok(false, err);
            })
            .on('render', function(){
                var $partitions,
                    state;

                assert.equal($container.find('.qti-customInteraction .fractionModelInteraction').length, 1, 'the custom interaction is a fraction model');

                state = this.getState();
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(_.isArray(state.RESPONSE.list), 'The state contains a well formated response');
                assert.equal(_.filter(state.RESPONSE.list).length, 0, 'No selected partition by default');
                assert.equal(state.RESPONSE.list.length, 2, 'There is 2 partitions by default');

                $partitions = $('.fractionModelInteraction .shape-container svg > path', $container);
                assert.equal($partitions.length, 2, 'There is 2 partitions in the canvas');

                this.setState({
                    RESPONSE : {
                        list : [false, true, false, true, true]
                    }
                 });

                _.defer(function(){
                    $partitions = $('.fractionModelInteraction .shape-container svg > path', $container);
                    assert.equal($partitions.length, 5, 'There is 2 partitions in the canvas');
                    assert.equal($partitions.filter('[fill="#ff0000"]').length, 3, 'There is 3 selected partitions in the canvas');

                    QUnit.start();
                });
            })
            .assets(strategies)
            .init()
            .render($container);
    });
});

