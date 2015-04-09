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
    
    /**
     * Init the paging widget to a passage
     * @param {JQuery} $frameContainer
     * @return {Object} The paging API to control the paging component
     */
    function initPaging($frameContainer){

        var $frame = $frameContainer.children('.frame');
        var frameHalfHeight = Math.round($frame.height() / 2);
        var $pager = $frameContainer.children('.passage-pager');
        var $previous = $pager.find('.passage-pager-previous button');
        var $next = $pager.find('.passage-pager-next button');
        var $counterCurrent = $frameContainer.find('.counter-current');
        var $counterTotal = $frameContainer.find('.counter-total');
        var $pages = $frameContainer.find('.page');
        var $current;
        var pages = [];
        var current = 0;//page count starts at zero
        var scrolling = false;
        
        /**
         * Init paging widget
         */
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
                        bottom : Math.round(currentPos + pos.top + h),
                        $dom : $page,
                        id : $page.data('page-id'),
                        index : pages.length
                    });

                    //set page number:
                    $page.find('.page-number').html(pages.length);
                });
                $counterTotal.html(pages.length);
                moveCallback(currentPos);
            });
        }

        /**
         * Set the current page number in state
         * 
         * @param {Integer} num - the new page number (the page coutn starts from O)
         * @returns {undefined}
         */
        function setCurrent(num){
            var page;
            
            current = num;
            page = pages[current];
            
            $current = page.$dom;
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
        }
        
        /**
         * Programmatically scroll to a specific page location
         * 
         * @param {Integer} num - the index of the page to scroll to
         * @returns {undefined}
         */
        function scrollTo(num){
            var page = pages[num];
            scrolling = true;
            $frame.sly('slideTo', page.top, false);
            setCurrent(num);
        }
        
        /**
         * The callback to be executed after each move event
         * 
         * @param {Integer} newPos - the position.top 
         */
        function moveCallback(newPos){
            
            var threshold = newPos + frameHalfHeight + 20;
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
            if(scrolling){
                scrolling = false;
            }else{
                moveCallback(this.pos.cur);
            }
        }, 600));
        $frame.sly('on', 'load', _.throttle(init, 600));

        //init next/previous buttons
        $previous.on('click', function(){
            if(!$previous.hasClass('disabled') && current > 0){
                scrollTo(current - 1, true);
            }
        });
        $next.on('click', function(){
            if(!$next.hasClass('disabled') && current < pages.length - 1){
                scrollTo(current + 1, true);
            }
        });

        var pagingApi = {
            getMoveCallback : moveCallback,
            reload : init,
            getActive : function(){
                if($current){
                    return $current;
                }
            },
            setActive : function(pageId){
                var page = _.find(pages, {id : pageId});
                if(page){
                    scrollTo(page.index, true);
                }
            }
        };

        $frameContainer.data('paging-api', pagingApi);
        return pagingApi;
    }
    
    /**
     * Init scrolling widget
     * 
     * @param {Object} pci - the standard pci object
     * @param {JQuery} $frameContainer
     */
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

        //reload slider setting because the container might have been resized
        $(window).on('resize.multiTabbedExhibit.' + pci.id, function(){
            $frame.sly('reload');
        });
        pci.on('resize', function(){
            $frame.sly('reload');
        });
    }
    
    /**
     * Renders a template found in the pci
     * 
     * @param {Object} pci - the standard pci object
     * @param {String} tplName
     * @param {Object} data
     * @returns {String} 
     */
    function renderTemplate(pci, tplName, data){
        var source = pci.$dom.find(".templates ." + tplName).html();
        var template = handlebars.compile(source);
        return template(data || {});
    }
    
    /**
     * Prepare the markup for scrolling widget
     * 
     * @param {Object} pci - the standard pci object
     * @param {JQuery} $passage
     */
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
    
    /**
     * Prepare the markup for paging widget
     * 
     * @param {Object} pci - the standard pci object
     * @param {JQuery} $passage
     */
    function initPaggingPassageMarkup(pci, $passage){

        var tplData = {pages : []};
        $passage.find('.page').each(function(){
            var $page = $(this);
            tplData.pages.push({
                content : $page.html(),
                id : $page.data('page-id')
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
    
    /**
     * Main passages widgets according to their types
     * 
     * @param {Object} pci - the standard pci object
     */
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
    
    /**
     * Prepare the markup for tabbing widget
     * 
     * @param {Object} pci - the standard pci object
     */
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
                active : $passage.hasClass('active'),
                id : $passage.data('passage-id')
            });
            $passage.removeAttr('title');
        });

        //remove old markup:
        $tabContainer.children('.passages-tab-navigation').remove();
        $tabContainer.prepend(renderTemplate(pci, 'tab-navigation', tplData));
    }
    
    /**
     * Init tabbing component
     * 
     * @param {Object} pci
     * @returns {Object} - the tabbing api object to control the tabbing component
     */
    function initTabbing(pci){

        //create markup:
        initTabbingMarkup(pci);

        var $tabContainer = pci.$dom.find('.passages-tabs');
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
        //event
        $tabContainer.on('activate.tab', function(e, id){
            pci.trigger('activate', [id]);
        });
        
        /**
         * Activate a tab identified by its trigger <a>
         * 
         * @param {JQuery} $a
         */
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
                //update active element:
                $active = $a;
                //event
                $tab.trigger('activate.tab', [$tab.data('passage-id')]);
            }
        }

        var tabbingApi = {
            activate : function(passageId){
                var $trigger = $nav.find('a[data-passage-id=' + passageId + ']');
                activateTab($trigger);
            },
            getActive : function(){
                var $passage = $active.data('passage-tab');
                if($passage.length){
                    return $passage;
                }
            }
        };

        $tabContainer.attr('data-stuff', true);
        $tabContainer.data('tabbing-api', tabbingApi);
        return tabbingApi;
    }
    
    /**
     * The main function to init the ineractivity of the interaction
     * @param {Object} pci - the standard pci object
     */
    function init(pci){

        //init scrolling on all "scrollable" frame container
        initPassages(pci);

        //init tabbing
        var tabbed = pci.config['tabbed'];
        if(tabbed && tabbed !== 'false'){
            initTabbing(pci);
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
            this.config = config || {};

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            //load all widgets
            init(this);
            
            this.on('passagechange', function(markup, tabbed, state){

                var $newMarkup = $(markup);

                self.config.tabbed = tabbed;

                //replace markup
                self.$dom.children('.passages').replaceWith($newMarkup.children('.passages'));

                //reload all widgets
                init(self);

                //restore state if applicable
                if(state){
                    self.setSerializedState(state);
                }

                //fires event "reloaded"
                self.trigger('passagereload', [state]);
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
            //for consistency with the response processing declaration, returns always true
            return {base : {boolean : true}};
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

            this.$dom.off().empty();
            $(window).off('resize.multiTabbedExhibit.' + this.id);
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){

            if(state.passage){
                var $tabs = this.$dom.find('.passages-tabs');
                
                //restoring a state only when the passage has tabs
                if($tabs.length){
                    var tabApi = $tabs.data('tabbing-api');
                    tabApi.activate(state.passage);
                    if (state.page) {
                        var $passage = tabApi.getActive();
                        if ($passage && $passage.hasClass('passage-paging')) {
                            var pagingApi = $passage.data('paging-api');
                            pagingApi.setActive(state.page);
                        }
                    }
                }
            }

        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){

            var tabApi, pagingApi, $passage, $page, state = {};
            var $tabs = this.$dom.find('.passages-tabs');
            if($tabs.length){
                tabApi = $tabs.data('tabbing-api');
                $passage = tabApi.getActive();
                if($passage){
                    state.passage = $passage.data('passage-id');
                    if($passage.hasClass('passage-paging')){
                        pagingApi = $passage.data('paging-api');
                        $page = pagingApi.getActive();
                        if($page){
                            state.page = $page.data('page-id');
                        }
                    }
                }
            }

            return state;
        }
    };

    qtiCustomInteractionContext.register(multiTabbedExhibit);
});
