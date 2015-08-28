define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/scale.raphael',
    'PARCC/pointFactory',
    'PARCC/axisFactory',
    'graphNumberLineInteraction/runtime/libs/intervalFactory'
], function($, qtiCustomInteractionContext, _, event, scaleRaphael, pointFactory, axisFactory, IntervalFactory){

    function createCanvas($container, config){

        var padding = 2;
        var width = 2 * padding + config.unitSize * (2 + config.max - config.min);
        var paper = scaleRaphael($('.shape-container', $container)[0], width, 120);

        return paper;
    }

    function buildAxisConfig(rawConfig){

        var _default = {
            top : 60,
            left : 50,
            unitSize : 50,
            min : -5,
            max : 5,
            unitSubDivision : 2,
            arrows : true,
            plot : {
                color : '#266d9c',
                thickness : 5
            },
            point : {
                color : '#266d9c',
                radius : 10
            }
        };
        return _.merge(_default, {
            min : (rawConfig.min === undefined) ? undefined : parseInt(rawConfig.min),
            max : (rawConfig.max === undefined) ? undefined : parseInt(rawConfig.max),
            unitSubDivision : (rawConfig.unitSubDivision === undefined) ? undefined : parseInt(rawConfig.unitSubDivision),
            plot : {
                color : rawConfig.graphColor,
                thickness : (rawConfig.graphWidth === undefined) ? undefined : parseInt(rawConfig.graphWidth)
            },
            point : {
                color : rawConfig.graphColor,
                radius : 10
            }
        });
    }

    function getAuthorizedIntervals(){
        return [
            'closed-closed',
            'closed-open',
            'open-closed',
            'open-open',
            'arrow-open',
            'arrow-closed',
            'open-arrow',
            'closed-arrow'
        ];
    }

    var graphNumberLineInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphNumberLineInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.config = config || {};

            var $container = $(dom);

            var paper,
                axis,
                intervalFactory,
                _this = this;

            function initAxis($container, axisConfig){

                //create paper
                paper = createCanvas($container, axisConfig);
                axis = new axisFactory(paper, axisConfig);
                intervalFactory = new IntervalFactory(axis, axisConfig.plot);
            }

            function activate(uid){

                _.forIn(intervals, function(interval, id){
                    if(id === uid){
                        interval.$control.find('.btn').removeClass('btn-info').addClass('btn-success');
                        interval.obj.enable();
                    }else{
                        interval.$control.find('.btn').removeClass('btn-success').addClass('btn-info');
                        interval.obj.disable();
                    }
                });

            }

            function reset(){
                _.each(intervals, function(interval){
                    interval.obj.destroy();
                    interval.$control.remove();
                    $intervalsOverlay.hide();
                });
                intervals = {};
            }

            //expose the reset() method
            this.reset = function(){
                reset();
            };

            /**
             * init rendering:
             */
            this.axisConfig = buildAxisConfig(this.config);
            initAxis($container, this.axisConfig);

            var $intervalsAvailable = $container.find('.intervals-available');
            var $intervalsOverlay = $container.find('.intervals-overlay');
            var $intervalsSelected = $container.find('.intervals-selected');
            var $intervalTemplate = $container.find('.intervals-template .interval');
            var selectionMax = 2;
            var intervals = {};

            function setAvailableIntervals(availableIntervals){
                $intervalsAvailable.find('.interval-available').each(function(){
                    var $this = $(this);
                    if(_.indexOf(availableIntervals, $this.attr('value')) >= 0){
                        $this.addClass('activated');
                    }else{
                        $this.removeClass('activated');
                    }
                });
                //need to reset all
                reset();
            }

            function setAxis(axisConfig){
                _this.axisConfig = buildAxisConfig(_.merge(_this.config, _this.axisConfig, axisConfig));
                initAxis($container, _this.axisConfig);
                reset();
            }

            function createInterval(intervalType, start, end){

                var $button, uid, $img, $tpl, interval;

                if(_.size(intervals) < selectionMax){

                    uid = _.uniqueId('interval_');
                    $button = $intervalsAvailable.find('button[value=' + intervalType + ']');
                    $img = $button.find('img').clone();

                    //append button
                    $tpl = $intervalTemplate.clone();
                    $tpl.find('.btn').append($img);
                    $tpl.attr('data-uid', uid);
                    $intervalsSelected.append($tpl);

                    //draw initial interval
                    interval = intervalFactory.plot(intervalType, start, end);

                    intervals[uid] = {
                        type : intervalType,
                        obj : interval,
                        $control : $tpl
                    };

                    //active the button & interval editing
                    activate(uid);

                    //response change
                    _this.trigger('responseChange', [_this.getRawResponse()]);

                    if(_.size(intervals) === selectionMax){
                        //deactivate the whole panel
                        $intervalsOverlay.show();
                    }
                }
            }

            var availableIntervals = this.config.intervals ? this.config.intervals.split(',') : getAuthorizedIntervals();
            setAvailableIntervals(availableIntervals);

            $container.on('click', '.intervals-available .btn-info', function(){

                //default interval value between 0 and 1
                createInterval($(this).val(), 0, 1);

            }).on('click', '.intervals-selected .btn-info', function(){

                var $parent = $(this).parent('.interval'),
                    uid = $parent.data('uid');

                //active the button & interval editing
                activate(uid);

            }).on('click', '.intervals-selected .deleter', function(){

                var $deleter = $(this),
                    $parent = $deleter.parent('.interval'),
                    uid = $parent.data('uid'),
                    interval = intervals[uid];

                interval.obj.destroy();
                $parent.remove();
                intervals = _.omit(intervals, uid);

                if(_.size(intervals) <= selectionMax){
                    //re-enable buttons
                    $intervalsOverlay.hide();
                }

                //response change event
                _this.trigger('responseChange', [_this.getRawResponse()]);

            }).on('change.interval', function(){

                //response change event
                _this.trigger('responseChange', [_this.getRawResponse()]);
            });

            //_this.trigger('responseChange', [_this.getResponse()]);
            this.on('intervalschange', setAvailableIntervals);
            this.on('axischange', setAxis);

            this.getRawResponse = function getRawResponse(){
                var response = [];
                _.each(intervals, function(interval){
                    var coords = interval.obj.getCoordinates();
                    response.push({
                        type : interval.type,
                        start : coords.start,
                        end : coords.end
                    });
                });
                return response;
            };

            this.setRawResponse = function(intervals){
                if(_.isArray(intervals)){
                    _.each(intervals, function(interval){
                        createInterval(interval.type, interval.start, interval.end);
                    });
                }
            };
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){

            var i, point, lineTypes, values, rawResponse = [];

            if(response &&
                _.isArray(response.record) &&
                response.record[0] &&
                response.record[1] &&
                response.record[0].name === 'lineTypes' &&
                response.record[0].base &&
                response.record[0].base.list &&
                _.isArray(response.record[0].base.list.string) &&
                response.record[1].name === 'values' &&
                response.record[1].base &&
                response.record[1].base.list &&
                _.isArray(response.record[1].base.list.pair) &&
                response.record[0].base.list.length === response.record[1].base.list.length
                ){

                lineTypes = response.record[0].base.list.string;
                values = response.record[1].base.list.pair;

                for(i = 0; i < lineTypes.length; i++){
                    point = values[i];
                    rawResponse.push({
                        type : lineTypes[i],
                        start : point[0],
                        end : point[1]
                    });
                }

                this.setRawResponse(rawResponse);
            }
        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){

            var types = [];
            var values = [];
            var rawResponse = this.getRawResponse();
            if(_.isArray(rawResponse) && _.size(rawResponse)){
                _.each(rawResponse, function(interval){
                    types.push(interval.type);
                    values.push([interval.start, interval.end]);
                });
                return {
                    record : [
                        {
                            name : 'lineTypes',
                            base : {
                                list : {
                                    'string' : types
                                }
                            }
                        },
                        {
                            name : 'values',
                            base : {
                                list : {
                                    pair : values
                                }
                            }
                        }
                    ]
                };
            }else{
                return {base : null};
            }
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){
            this.reset();
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy : function(){

            var $container = $(this.dom);
            $container.off().empty();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){
            this.setResponse(state);
        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return this.resetResponse(state);
        }
    };

    qtiCustomInteractionContext.register(graphNumberLineInteraction);
});
