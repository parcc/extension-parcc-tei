define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/lodash',
    'multiTabbedExhibit/runtime/lib/sly.min'
], function (
        $,
        qtiCustomInteractionContext,
        event,
        _
        ) {

    'use strict';

    function buildConfig(config) {
        return config;
    }

    var multiTabbedExhibit = {
        id: -1,
        getTypeIdentifier: function () {
            return 'multiTabbedExhibit';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize: function (id, dom, config) {

            this.id = id;
            this.dom = dom;
            this.config = buildConfig(config || {});

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            //init scrolling
            $('.frame-container').each(function () {

                var $frameContainer = $(this);
                var $frame = $frameContainer.children('.frame');
                var $scrollbar = $frameContainer.children('.scrollbar');

                $frame.sly({
                    scrollBar: $scrollbar,
                    scrollBy: 20,
                    scrollTrap: true,
                    dragHandle: true,
                    mouseDragging: false
                });
            });

            //init tabbing
            var $tabContainer = $('.passages-tabs');
            var $tabs = $tabContainer.children('.passage');
            var $nav = $tabContainer.children('.passages-tab-navigation');
            var i = 0;
            var $active = $nav.find('li:first-child a');
            
            $tabs.hide();
            $nav.children('li').each(function () {
                var $li = $(this),
                        $a = $li.children('a');

                if (i < $tabs.length) {
                    var $tab = $($tabs[i]);
                    $a.data('passage-tab', $tab);

                    if ($li.hasClass('passages-tab-active')) {
                        $active = $a;
                    }
                } else {
                    $a.hide();
                }
                i++;
            });
            $nav.on('click', 'a', function () {
                activateTab($(this));
            });
            //activate initial tab:
            activateTab($active);
            
            function activateTab($a){
                var $li = $a.parent();
                var $tab = $a.data('passage-tab');
                if ($tab && $tab.length) {
                    //toggle visibility:
                    $tab.show().siblings('.passage').hide();
                    //change li class:
                    $li.addClass('passages-tab-active').siblings('li').removeClass('passages-tab-active');
                }
            }
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse: function (response) {

        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse: function () {

            var value = 0;

            return {base: {integer: value}};
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse: function () {

        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy: function () {

            var $container = $(this.dom);
            $container.off().empty();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState: function (state) {

        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState: function () {

            return {};
        }
    };

    qtiCustomInteractionContext.register(multiTabbedExhibit);
});
