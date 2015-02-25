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
            title : $passage.attr('title'),
            type : type,
            size : size
        };

        return props;
    }

    /**
     * Load passages data from markup into interaction metaData
     * 
     * @param {Object} interaction
     */
    function loadData(interaction){

        var passagesData = {};
        var $markup = $('<div>').html(interaction.markup);
        $markup.find('.passages .passage').each(function(){

            var $passage = $(this);
            var data = getPassagePropertiesFromMarkup($passage);

            if($passage.hasClass('passage-paging')){
                data.pages = [];
                $passage.children('.page').each(function(){
                    data.pages.push({
                        content : $(this).html()
                    });
                });
            }else{
                data.content = $passage.html();
            }

            passagesData[_.uniqueId('passage_')] = data;
        });
        interaction.data('passages', passagesData);
    }

    function create(interaction){
        
        var uid = _.uniqueId('passage_');
        var passages = interaction.data('passages');
        if(!passages){
            passages = {};
            interaction.data('passages', passages);
        }
        passages[uid] = {
            type : 'passage-simple',
            content : ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec mi eu turpis molestie egestas. In hac habitasse platea dictumst. Fusce efficitur sed nibh sed dictum. Sed blandit arcu ut nunc facilisis, nec tincidunt ante scelerisque. Ut augue orci, convallis sit amet elementum sed, gravida non turpis. Sed posuere ipsum et placerat suscipit.'
        };
        return uid;
    }

    function setType(interaction, passageId, type){

        var passage = getPassage(interaction, passageId);
        if(passage.type !== type){
            if(passage.type === 'passage-paging'){
                //the old passage has paging : merge the pages into a single content
                passage.content = '';
                var i = 0;
                _.each(_.pluck(passage.pages, 'content'), function(html){
                    if(!i){
                        passage.content += '<hr/>';
                    }
                    passage.content += html;
                    i++;
                });
            }else if(type === 'passage-paging'){
                //the new passage has paging : add the content into a page
                passage.pages = [{content : passage.content}];
                delete passage.content;
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
        var passage = passages[passageId];
        if(passage){
            return passage;
        }else{
            throw 'the passage does not exist';
        }
    }
    
    function addPage(interaction, passageId){
        var passage = getPassage(interaction, passageId);
        if(passage.type === 'passage-paging'){
            passage.pages.push({content : ''});
            return passage.pages.length;
        }else{
            throw 'the passage is not of a paging type';
        }
    }
    
    function setPageContent(interaction, passageId, pageId, content){
        var passage = getPassage(interaction, passageId);
        if(passage.type === 'passage-paging'){
            pageId = parseInt(pageId);
            passage.pages[pageId].content = content;
        }else{
            throw 'the passage is not of a paging type';
        }
    }
    
    function setPassageContent(interaction, passageId, content){
        var passage = getPassage(interaction, passageId);
        if(!passage.type === 'passage-paging'){
            passage.content = content;
        }else{
            throw 'the passage is of a paging type';
        }
    }
    
    return {
        loadData : loadData,
        create : create,
        setType : setType,
        setSize : setSize,
        getPassage : function(interaction, passageId){
            return _.clone(getPassage(interaction, passageId));
        },
        addPage : addPage,
        setPageContent : setPageContent,
        setPassageContent : setPassageContent
    };
});