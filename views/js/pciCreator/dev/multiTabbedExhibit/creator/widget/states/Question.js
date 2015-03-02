define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'multiTabbedExhibit/creator/widget/helper/passageEditor',
    'tpl!multiTabbedExhibit/creator/tpl/propertiesForm',
    'tpl!multiTabbedExhibit/creator/tpl/tabForm',
    'lodash',
    'jquery'
], function(
    stateFactory,
    Question,
    formElement,
    containerEditor,
    passageEditor,
    formTpl,
    tabTpl,
    _,
    $){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

        var self = this,
            interaction = this.widget.element;

        //init passage editors
        this.initPassagesContentEditors();

        interaction.onPci('passagereload', function(){
            //init passage editors
            self.initPassagesContentEditors();
        });

    }, function(){

    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var self = this,
            widget = this.widget,
            interaction = widget.element,
            passages = interaction.data('passages') || {},
            tabbed = interaction.prop('tabbed'),
            $form = widget.$form;

        //render the form using the form template
        $form.html(formTpl({
            tabbed : tabbed
        }));

        var $panelTabManager = $form.find('.creator-multiTabbedExhibit'),
            $panelTabAdd = $panelTabManager.find('.tab-form-add'),
            $panelTabForms = $panelTabManager.find('.tab-form-container');

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            tabbed : function(i, value){
                interaction.prop('tabbed', value);

                //toggle tabbed editing panel visibility
                if(value){
                    $panelTabManager.show();
                }else{
                    $panelTabManager.hide();

                    //ask for confirmation first

                    //merge all tab together
                }

                //communicate change to pci
                self.refreshRendering();
            }
        });

        //toggle visibility of tabs editing panel
        if(!tabbed){
            $panelTabManager.hide();
        }

        //add tabs option forms
        _.each(passages, function(passage){
            $panelTabForms.append(renderPassageForm(passage));
        });

        //init add tab button
        $panelTabAdd.on('click', function(){
            //create a new passage
            var passageId = passageEditor.addPassage(interaction);

            //append the passage form
            var passage = passageEditor.getPassage(interaction, passageId);
            var $passageForm = $(renderPassageForm(passage));
            $panelTabForms.append($passageForm);

            //communicate change to pci
            self.refreshRendering();
        });

        //add delete button click event listener
        $panelTabManager.on('click', '.passage-form .passage-button-delete', function(){

            var $passageForm = $(this).parent('.passage-form');
            var id = $passageForm.data('passage-id');

            //delete the passage from the interaction model
            passageEditor.removePassage(interaction, id);

            //remove the form from dom
            $passageForm.remove();

            //communicate change to pci
            self.refreshRendering();

        }).on('change', 'select[name=type]', function(){

            var $select = $(this);
            var type = $select.val();
            var id = $select.parents('.passage-form').data('passage-id');

            passageEditor.setType(interaction, id, type);
            self.refreshRendering();
        });

    };

    function initContentEditor($editable, passage, interaction){
        if($editable.length){
            containerEditor.create($editable, {
                change : _.throttle(function(text){
                    passage.content = text;
                    interaction.updateMarkup();
                    interaction.triggerPci('resize');
                }, 600),
                markup : passage.content
            });
        }else{
            debugger;
        }
    }

    StateQuestion.prototype.initPassagesContentEditors = function(){
        
        var interaction = this.widget.element,
            $container = this.widget.$container;
        var passages = interaction.data('passages');
        
        _.each(passages, function(passage){

            switch(passage.type){
                case 'passage-simple':
                    initContentEditor($container.find('.passage-simple[data-passage-id=' + passage.uid + ']'), passage, interaction);
                    break;
                case 'passage-scrolling':
                    initContentEditor($container.find('.passage-scrolling[data-passage-id=' + passage.uid + '] .passage-content'), passage, interaction);
                    break;
                case 'passage-paging':
                    _.each(passage.pages, function(page){
                        initContentEditor($container.find('.passage-paging .page[data-page-id=' + passage.uid + '] .page-content'), page, interaction);
                    });
                    break;
                default:
                    throw 'unknown type of passage';
            }

        });
    };

    function renderPassageForm(passage){

        var data = {
            passageId : passage.uid,
            name : passage.title,
            hasSize : false
        };

        data.types = [];
        _.each(_availableTypes, function(type){
            if(passage.size === type.cssClass){
                type.selected = true;
            }
            data.types.push(type);
        });

        if(passage.type !== 'passage-simple'){
            data.hasSize = true;
            data.sizes = [];
            _.each(_availableSizes, function(size){
                if(passage.size === size.cssClass){
                    size.selected = true;
                }
                data.sizes.push(size);
            });
        }

        return tabTpl(data);
    }
    
    function destroyEditor($container){
        $container.find('.passage-simple, .passage-scrolling .passage-content, .passage-paging .page .page-content').each(function(){
            containerEditor.destroy($(this));
        });
    }
    
    StateQuestion.prototype.refreshRendering = function(){
        
        var interaction = this.widget.element,
            $container = this.widget.$container;
        
        //update the markup
        interaction.updateMarkup();

        //reload the pci
        interaction.triggerPci('passagechange', [interaction.markup, interaction.prop('tabbed')]);
        
        //destroy editors
        destroyEditor($container);
    };

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

    return StateQuestion;
});