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

    function clear(interaction){
        interaction.removeData('passages');
    }

    /**
     * Load passages data from markup into interaction metaData
     * 
     * @param {Object} interaction
     */
    function loadData(interaction){

        var $markup = $('<div>').html(interaction.markup);

        clear(interaction);

        $markup.find('.passages .passage').each(function(){
            
            var $passage = $(this);
            var data = getPassagePropertiesFromMarkup($passage);

            if($passage.hasClass('passage-paging')){
                data.pages = [];
                $passage.children('.page').each(function(){
                    var $page = $(this);
                    data.pages.push({
                        uid : $page.attr('page-id'),
                        content : $page.html()
                    });
                });
            }else{
                data.content = $passage.html();
            }

            addPassage(interaction, data);
        });
    }

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

    function addPassage(interaction, attributes){

        var passages = interaction.data('passages');
        var passage;

        if(!passages){
            //init passages data if not exist yet
            passages = [];
            interaction.data('passages', passages);
        }

        passage = _.defaults(attributes || {}, {
            uid : _.uniqueId('passage_'),
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
                passage.pages = [{content : passage.content, uid : _.uniqueId('page_converted_')}];
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

    function setSize(interaction, passageId, sizeClass){

        var passage = getPassage(interaction, passageId);
        passage.size = sizeClass;
    }

    function getPassage(interaction, passageId){
        var passages = interaction.data('passages');
        var passage = _.find(passages, {uid : passageId});
        if(passage){
            return passage;
        }else{
            throw 'the passage does not exist';
        }
    }

    function addPage(interaction, passageId){
        var passage = getPassage(interaction, passageId);
        if(passage.type === 'passage-paging'){
            var uid = _.uniqueId('page_');
            passage.pages.push({
                uid : uid,
                content : ''
            });
            return uid;
        }else{
            throw 'the passage is not of a paging type';
        }
    }

    function setPageContent(interaction, passageId, pageId, content){
        var passage = getPassage(interaction, passageId);
        if(passage.type === 'passage-paging'){
            passage.pages[pageId].content = content;
        }else{
            throw 'the passage is not of a paging type';
        }
    }

    function setPassageContent(interaction, passageId, content){
        var passage = getPassage(interaction, passageId);
        if(passage.type !== 'passage-paging'){
            passage.content = content;
        }else{
            throw 'the passage is of a paging type';
        }
    }

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

    function removePassage(interaction, passageId){
        var passages = interaction.data('passages');
        _.remove(passages, function(passage){
            return (passage.uid === passageId);
        });
    }

    return {
        getAvailableSize : function(){
            return _.clone(_availableSizes);
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
        addPage : addPage,
        setPageContent : setPageContent,
        setPassageContent : setPassageContent,
        removePage : removePage,
        removePassage : removePassage
    };
});