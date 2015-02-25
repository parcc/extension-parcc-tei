define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/lodash',
    'OAT/handlebars',
    'multiTabbedExhibit/runtime/lib/sly.min'
], function(
    $,
    qtiCustomInteractionContext,
    event,
    _,
    handlebars
    ){

    'use strict';

    function buildConfig(config){
        return config;
    }

    function initPaging($frameContainer){

        var $frame = $frameContainer.children('.frame');
        var frameHalfHeight = Math.round($frame.height() / 2);
        var $pager = $frameContainer.children('.passage-pager');
        var $previous = $pager.find('.passage-pager-previous button');
        var $next = $pager.find('.passage-pager-next button');
        var $counterCurrent = $frameContainer.find('.counter-current');
        var $counterTotal = $frameContainer.find('.counter-total');
        var $pages = $frameContainer.find('.page');
        var pages = [];
        var current = 0;//page count starts at zero

        function init(){
            
            //reset pages registry
            pages = [];
            $frame.sly('getCurrentPos', function(currentPos){
                $pages.each(function(){
                    
                    var $page = $(this);
                    var pos = $page.position();
                    var h = $page.outerHeight();
                    
                    //append page position object
                    pages.push({
                        top : Math.round(currentPos + pos.top),
                        middle : Math.round(currentPos + pos.top + h / 2),
                        bottom : Math.round(currentPos + pos.top + h)
                    });
                    
                    //set page number:
                    $page.find('.page-number').html(pages.length);
                });
                $counterTotal.html(pages.length);
                moveCallback(currentPos);
            });
        }

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
            if(num === pages.length - 1){
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
         * 
         */
        function moveCallback(newPos){

            var threshold = newPos + frameHalfHeight + 80;
            var currentPage = 0;

            //check position of the pages
            for(var i in pages){
                i = parseInt(i);
                if(threshold > pages[i].top && (!pages[i + 1] || threshold < pages[i + 1].top)){
                    currentPage = i;
                    break;
                }
            }

            //set current page:
            setCurrent(currentPage);
        }

        //start pager
        init();

        //bind event listeners to the sly scrollbar
        $frame.sly('on', 'move', _.throttle(function(){
            moveCallback(this.pos.cur);
        }, 600));
        $frame.sly('on', 'load', _.throttle(init, 600));

        //init next/previous buttons
        $previous.on('click', function(){
            if(!$previous.hasClass('disabled') && current > 0){
                setCurrent(current - 1, true);
            }
        });
        $next.on('click', function(){
            if(!$next.hasClass('disabled') && current < pages.length - 1){
                setCurrent(current + 1, true);
            }
        });

        return {
            getMoveCallback : moveCallback,
            setPage : setCurrent,
            reload : init
        };
    }

    function initScrolling(pci, $frameContainer){
        
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
        $(window).on('resize.multiTabbedExhibit.' + pci.id, function(){
            //reload slider setting because the container might have been resized
            $frame.sly('reload');
        });
    }
    
    function renderTemplate(pci, tplName, data){
        var source = pci.$dom.find(".templates ."+tplName).html();
        var template = handlebars.compile(source);
        return template(data || {});
    }
    
    function initScrollingPassageMarkup(pci, $passage){
        
        //prepare content
        var passageContent = renderTemplate(pci, 'simple', {
            content : $passage.html()
        });
        //add scrollbar
        $passage.html(renderTemplate(pci, 'scrolling', {
            content : passageContent
        }));
    }
    
    function initPaggingPassageMarkup(pci, $passage){
        
        var tplData = {pages:[]};
        $passage.find('.page').each(function(){
            tplData.pages.push({
                content:$(this).html()
            });
        });
        //prepare content
        var passageContent = renderTemplate(pci, 'pages', tplData);
        //add scrollbar
        $passage.html(renderTemplate(pci, 'scrolling', {
            content : passageContent
        }));
        //add pager
        $passage.append(renderTemplate(pci, 'pager'));
    }
    
    function initPassages(pci){

        pci.$dom.find('.passage-scrolling').each(function(){
            var $passage = $(this);
            initScrollingPassageMarkup(pci, $passage);
            initScrolling(pci, $passage);
        });

        pci.$dom.find('.passage-paging').each(function(){
            var $passage = $(this);
            initPaggingPassageMarkup(pci, $passage);
            initScrolling(pci, $passage);
            initPaging($passage);
        });
    }

    function initTabbingMarkup(pci){
        
        var tplData = {
            passages : []
        };
        var $tabContainer = pci.$dom.children('.passages').addClass('passages-tabs');
        var $passages = $tabContainer.children('.passage').addClass('passage-tab');
        $passages.each(function(){
            var $passage = $(this);
            tplData.passages.push({
                title : $passage.attr('title'),
                active : $passage.hasClass('active')
            });
        });

        //clear old markup:
        $tabContainer.children('.passages-tab-navigation').remove();
        $tabContainer.prepend(renderTemplate(pci, 'tab-navigation', tplData));
    }

    function initTabbing(pci){

        //create markup:
        initTabbingMarkup(pci);

        var $tabContainer = $('.passages-tabs');
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
                //reload scrollbar settings:
                $tab.find('.frame').sly('reload');
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

            var self = this;

            this.id = id;
            this.$dom = $(dom);
            this.config = buildConfig(config || {});

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            //init scrolling on all "scrollable" frame container
            initPassages(this);

            //init tabbing
            initTabbing(this);

            this.on('passagechange', function(){
                self.trigger('passagereload');
            });
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
            $(window).off('resize.multiTabbedExhibit.' + this.id);
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
