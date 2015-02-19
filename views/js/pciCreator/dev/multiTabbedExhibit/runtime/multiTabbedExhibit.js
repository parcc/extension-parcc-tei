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

    function initPaging($frameContainer){

        var $frame = $frameContainer.children('.frame');
        var frameHalfHeight = Math.round($frame.height()/2);
        var $pager = $frameContainer.children('.passage-pager');
        var $previous = $pager.find('.passage-pager-previous button');
        var $next = $pager.find('.passage-pager-next button');
        var $counterCurrent = $frameContainer.find('.counter-current');
        var $counterTotal = $frameContainer.find('.counter-total');
        var $pages = $frameContainer.find('.page');
        var pages = [];
        var current = 0;//page count starts at zero
        var total = 0;//numimum one page

        $pages.each(function(){
            var $page = $(this);
            var pos = $page.position();
            var h = $page.outerHeight();
            pages.push({
                top : Math.round(pos.top),
                middle : Math.round(pos.top + h / 2),
                bottom : Math.round(pos.top + h)
            });
            total++;
        });
        $counterTotal.html(total);
        
        /**
         * Set the current page number 
         * 
         * @param {Integer} num - the new page number (the page coutn starts from O)
         * @param {Boolean} [slideTo] - tells if the frame should be scrolled to position of the page
         * @returns {undefined}
         */
        function setCurrent(num, slideTo){
            current = num;
            $counterCurrent.html(num + 1);
            if(num === 0){
                $previous.addClass('disabled');
            }else{
                $previous.removeClass('disabled');
            }
            if(num === total-1){
                $next.addClass('disabled');
            }else{
                $next.removeClass('disabled');
            }
            if(slideTo){
                var page = pages[current];
                $frame.sly('slideTo', page.top, false);
            }
        }

        /**
         * The callback to be executed after 
         */
        function moveCallback(){

            var pos = this.pos;
            var currentPage = 0;

            //check position of the pages
            for(var i in pages){
                i = parseInt(i);
                if(pos.cur + frameHalfHeight > pages[i].top && (!pages[i + 1] || pos.cur  + frameHalfHeight < pages[i + 1].top)){
                    currentPage = i;
                    break;
                }
            }

            //set current page:
            setCurrent(currentPage);
        }
        
        //bind the move event to callback
        $frame.sly('on', 'move', _.throttle(moveCallback, 600));
        
        //init next/previous buttons
        $previous.on('click', function(){
            if(!$previous.hasClass('disabled') && current > 0){
                setCurrent(current - 1, true);
            }
        });
        $next.on('click', function(){
            if(!$next.hasClass('disabled') && current < total-1){
                setCurrent(current + 1, true);
            }
        });

        return {
            getMoveCallback : function getMoveCallback(){
                return moveCallback;
            },
            setPage : setCurrent
        };
    }

    function initScrolling($frameContainer){

        if(!$frameContainer.hasClass('frame-container')){
            throw 'the container has not the right css class';
        }

        var $frame = $frameContainer.children('.frame');
        var $scrollbar = $frameContainer.children('.scrollbar');
        
        //init the sly scrollbar
        $frame.sly({
            scrollBar : $scrollbar,
            scrollBy : 20,
            scrollTrap : true,
            dynamicHandle : true,
            clickBar : true,
            dragHandle : true,
            mouseDragging : false
        });
        
        //init paging if needed
        if($frameContainer.hasClass('passage-paging')){
            initPaging($frameContainer).setPage(0);
        }

    }

    function initTabbing($tabContainer){

        if(!$tabContainer.hasClass('passages-tabs')){
            throw 'the container has not the right css class';
        }

        var $tabs = $tabContainer.children('.passage');
        var $nav = $tabContainer.children('.passages-tab-navigation');
        var i = 0;
        var $active = $nav.find('li:first-child a');

        $tabs.hide();
        $nav.children('li').each(function(){
            var $li = $(this),
                $a = $li.children('a');

            if(i < $tabs.length){
                var $tab = $($tabs[i]);
                $a.data('passage-tab', $tab);

                if($li.hasClass('passages-tab-active')){
                    $active = $a;
                }
            }else{
                $a.hide();
            }
            i++;
        });
        $nav.on('click', 'a', function(){
            activateTab($(this));
        });
        //activate initial tab:
        activateTab($active);

        function activateTab($a){
            var $li = $a.parent();
            var $tab = $a.data('passage-tab');
            if($tab && $tab.length){
                //toggle visibility:
                $tab.show().siblings('.passage').hide();
                //change li class:
                $li.addClass('passages-tab-active').siblings('li').removeClass('passages-tab-active');
            }
        }
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

            //init scrolling on all "scrollable" frame container
            $('.frame-container').each(function(){
                initScrolling($(this));
            });

            //init tabbing
            var $tabContainer = $('.passages-tabs');
            initTabbing($tabContainer);

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
