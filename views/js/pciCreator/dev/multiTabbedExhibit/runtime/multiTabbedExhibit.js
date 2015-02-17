define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/lodash',
    'multiTabbedExhibit/runtime/lib/sly.min'
], function(
    $,
    qtiCustomInteractionContext,
    event,
    _
    ){

    'use strict';

    function buildConfig(config){
        return config;
    }

    var multiTabbedExhibit = {
        id : -1,
        getTypeIdentifier : function(){
            return 'multiTabbedExhibit';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){

            this.id = id;
            this.dom = dom;
            this.config = buildConfig(config || {});

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);
            $('.frame-container').each(function(){
                
                var $frameContainer = $(this);
                var $frame = $frameContainer.children('.frame');
                var $scrollbar = $frameContainer.children('.scrollbar');
                
                $frame.sly({
//                    smart : false,
//                    itemNav : 'forceCentered',
//                    activateOn: 'click',
//                    activateMiddle : true,
                    scrollBar : $scrollbar,
                    scrollBy : 12,
                    scrollTrap : true,
                    dragHandle : true,
                    mouseDragging : false
                });
            });
            return;
            var $dom = $(dom);
            var $sly = $dom.find('.passage.scrolling');
            $sly.addClass('frame').wrapInner($('<div>', {class : 'slidee'}));
            $sly.sly();

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

    qtiCustomInteractionContext.register(multiTabbedExhibit);
});
