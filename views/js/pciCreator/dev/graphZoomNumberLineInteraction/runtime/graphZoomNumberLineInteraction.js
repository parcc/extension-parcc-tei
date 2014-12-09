define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/scale.raphael',
    'PARCC/pointFactory',
    'graphZoomNumberLineInteraction/runtime/libs/axisFactory'
], function($, qtiCustomInteractionContext, _, event, scaleRaphael, pointFactory, axisFactory){

    function createCanvas($container, config){

        var padding = 2;
        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            620,
            120
            );

        //@todo make it responsive

        return paper;
    }

    function buildAxisConfig(rawConfig){

        var _color = rawConfig.graphColor || '#266d9c';

        return {
            top : 60,
            left : 50,
            unitSubDivision : 2,
            arrows : true,
            plot : {
                color : _color,
                thickness : rawConfig.graphWidth || 5
            },
            point : {
                color : _color,
                radius : 10
            }
        };
    }

    var graphZoomNumberLineInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphZoomNumberLineInteraction';
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
                _this = this;

            function initAxis($container, axisConfig){

                //create paper
                paper = createCanvas($container, axisConfig);
                axis = new axisFactory(paper, axisConfig);

                return;

                //for zoom number line interaction
                axis.clickable();

                //bind click event:
                axis.getSet().click(function(event){

                    // Get the coordinate of the click
                    var fx = event.layerX;

                    //set point position
                    addPoint(fx);
                });

            }

            function reset(){
                
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
            
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){

        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){

            var value = 0;

            return {base : {integer : value}};
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

        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         * 
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){

            return {};
        }
    };

    qtiCustomInteractionContext.register(graphZoomNumberLineInteraction);
});