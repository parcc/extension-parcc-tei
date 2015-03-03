define(['jquery', 'lodash'], function($, _){

    'use strict';

    var _availableSizes = [
        {
            label : 'small',
            cssClass : 'passage240'
        },
        {
            label : 'medium',
            cssClass : 'passage440'
        },
        {
            label : 'large',
            cssClass : 'passage540'
        }
    ];

    var _availableTypes = [
        {
            label : 'simple',
            cssClass : 'passage-simple'
        },
        {
            label : 'scrolling',
            cssClass : 'passage-scrolling'
        },
        {
            label : 'paging',
            cssClass : 'passage-paging'
        }
    ];

    /**
     * generate a unique (multi-session safe) identifier for the passages 
     * 
     * @param {String} prefix
     * @returns {String}
     */
    function uniqueId(prefix){
        var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        for(var i = 0; i < 8; i++){
            prefix += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return _.uniqueId(prefix);
    }

    /**
     * Extract all the useful properties of the passage from its dom representation
     * 
     * @param {JQuery} $passage
     * @returns {Object}
     */
    function getPassagePropertiesFromMarkup($passage){

        var type = 'passage-simple',
            size,
            classAttr = $passage.attr('class');

        //find the passage type from the passage css class
        classAttr.replace(/(passage-paging|passage-scrolling)/, function($0, match){
            if(match){
                type = match;
            }
        });

        //find the passage size form the passage css class
        var regex = new RegExp('(' + _.pluck(_availableSizes, 'cssClass').join('|') + ')');
        classAttr.replace(regex, function($0, match){
            if(match){
                size = match;
            }
        });

        var props = {
            uid : $passage.data('passage-id'),
            title : $passage.attr('title'),
            type : type,
            size : size
        };

        return props;
    }

    /**
     * Load passages data from markup into interaction metaData
     * 
     * @param {Object} interaction - standard interaction object
     */
    function loadData(interaction){

        var $markup = $('<div>').html(interaction.markup);

        //to start with, clear all previously generated metaData
        interaction.removeData('passages');

        $markup.find('.passages .passage').each(function(){

            var $passage = $(this);
            var data = getPassagePropertiesFromMarkup($passage);

            if($passage.hasClass('passage-paging')){
                data.pages = [];
                $passage.children('.page').each(function(){
                    var $page = $(this);
                    data.pages.push({
                        uid : $page.data('page-id'),
                        content : $page.html()
                    });
                });
            }else{
                data.content = $passage.html();
            }

            addPassage(interaction, data);
        });
    }

    /**
     * Generate a nice title for a new passage
     * 
     * @param {Object} interaction - standard interaction object
     * @returns {String}
     */
    function generatePassageTitle(interaction){

        var passages = interaction.data('passages');
        var passage, title, index = passages.length + 1;
        do{
            title = 'Passage ' + index;
            passage = _.find(passages, {title : title});
            index++;
        }while(passage)

        return title;
    }

    /**
     * Add a new passage
     * 
     * @param {Object} interaction - standard interaction object
     * @param {Object} [attributes]
     * @returns {String} the new passage id
     */
    function addPassage(interaction, attributes){

        var passages = interaction.data('passages');
        var passage;

        if(!passages){
            //init passages data if not exist yet
            passages = [];
            interaction.data('passages', passages);
        }

        passage = _.defaults(attributes || {}, {
            uid : uniqueId('passage_'),
            title : generatePassageTitle(interaction),
            type : 'passage-simple'
        });

        //set default content
        if(!passage.content && !passage.pages){
            passage.content = '';
        }

        passages.push(passage);
        return passage.uid;
    }

    /**
     * Set the type of the passage
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @param {String} type
     */
    function setType(interaction, passageId, type){

        var passage = getPassage(interaction, passageId);
        if(passage.type !== type){

            //adapt the content:
            if(passage.type === 'passage-paging'){
                //the old passage has paging : merge the pages into a single content
                passage.content = '';
                var i = 0;
                _.each(_.pluck(passage.pages, 'content'), function(html){
                    if(i){
                        passage.content += '<hr/>';
                    }
                    passage.content += html;
                    i++;
                });
                delete passage.pages;
            }else if(type === 'passage-paging'){
                //the new passage has paging : add the content into a page
                passage.pages = [{content : passage.content, uid : uniqueId('page_converted_')}];
                delete passage.content;
            }

            //adapt the size
            if(type === 'passage-simple'){
                delete passage.size;
            }else if(passage.type === 'passage-simple'){
                passage.size = 'passage240';
            }

            passage.type = type;
        }
    }

    /**
     * Set the size of the passage 
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @param {String} sizeClass
     */
    function setSize(interaction, passageId, sizeClass){

        var passage = getPassage(interaction, passageId);
        passage.size = sizeClass;
    }

    /**
     * Set the title of the passage 
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @param {String} title
     */
    function setTitle(interaction, passageId, title){

        var passage = getPassage(interaction, passageId);
        passage.title = title;
    }

    /**
     * Get the passage object by its id
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @throws When the passage does not exist
     */
    function getPassage(interaction, passageId){
        var passages = interaction.data('passages');
        var passage = _.find(passages, {uid : passageId});
        if(passage){
            return passage;
        }else{
            throw 'the passage does not exist';
        }
    }

    /**
     * Add a new page to a passage
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @param {String} [afterPageId] - define the postion of the new page
     */
    function addPage(interaction, passageId, afterPageId){
        var passage = getPassage(interaction, passageId);
        if(passage.type === 'passage-paging'){
            var newPage = {
                uid : uniqueId('page_'),
                content : ''
            };
            if(afterPageId){

                //reinit pages object
                var pages = [];

                //add to the first one
                if(afterPageId === '_prepend'){
                    pages.push(newPage);
                }

                //insert to position
                _.each(passage.pages, function(page){
                    pages.push(page);
                    if(page.uid === afterPageId){
                        pages.push(newPage);
                    }
                });

                passage.pages = pages;
            }else{
                passage.pages.push(newPage);
            }
            return newPage.uid;
        }else{
            throw 'the passage is not of a paging type';
        }
    }

    /**
     * Set the content of a page
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @param {String} pageId
     * @param {String} content
     */
    function setPageContent(interaction, passageId, pageId, content){
        var passage = getPassage(interaction, passageId);
        if(passage.type === 'passage-paging'){
            passage.pages[pageId].content = content;
        }else{
            throw 'the passage is not of a paging type';
        }
    }

    /**
     * Set the content of a passage
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @param {String} content
     */
    function setPassageContent(interaction, passageId, content){
        var passage = getPassage(interaction, passageId);
        if(passage.type !== 'passage-paging'){
            passage.content = content;
        }else{
            throw 'the passage is of a paging type';
        }
    }

    /**
     * Remove a page from a passage
     * 
     * @param {Object} interaction - standard interaction object
     * @param {String} passageId
     * @param {String} pageId
     * @returns {Boolean}
     */
    function removePage(interaction, passageId, pageId){
        var passage = getPassage(interaction, passageId);
        if(passage.type === 'passage-paging'){
            _.remove(passage.pages, function(page){
                return (page.uid === pageId);
            });
        }else{
            throw 'the passage is not of a paging type';
        }
    }
    
    /**
     * Remove a passage
     * 
     * @param {Object} interaction - standard interaction object
     * @param {type} passageId
     * @returns {undefined}
     */
    function removePassage(interaction, passageId){
        var passages = interaction.data('passages');
        _.remove(passages, function(passage){
            return (passage.uid === passageId);
        });
    }

    return {
        getAvailableSizes : function(){
            return _.cloneDeep(_availableSizes);
        },
        getAvailableTypes : function(){
            return _.cloneDeep(_availableTypes);
        },
        getPassage : function(interaction, passageId){
            try{
                //read-only, pass a clone only,
                return _.clone(getPassage(interaction, passageId));
            }catch(e){
                return null;
            }
        },
        loadData : loadData,
        addPassage : addPassage,
        setType : setType,
        setSize : setSize,
        setTitle : setTitle,
        addPage : addPage,
        setPageContent : setPageContent,
        setPassageContent : setPassageContent,
        removePage : removePage,
        removePassage : removePassage
    };
});