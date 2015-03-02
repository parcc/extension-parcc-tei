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
            $container = widget.$container,
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

        //add tabs option forms
        _.each(passages, function(passage){
            $panelTabForms.append(renderPassageForm(passage));
        });
        
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
        
        //init add tab button
        $panelTabAdd.on('click', function(){
            //create a new passage
            var passageId = passageEditor.addPassage(interaction);

            //append the passage form
            var passage = passageEditor.getPassage(interaction, passageId);
            var $passageForm = $(renderPassageForm(passage));
            $panelTabForms.append($passageForm);
            formElement.initWidget($passageForm);
            
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
            var $form = $select.parents('.passage-form');
            var id = $form.data('passage-id');

            passageEditor.setType(interaction, id, type);
            self.refreshRendering();
            
            //toggle size selection visibility
            if(type === 'passage-simple'){
                //hide size selector
                $form.find('.passage-size').hide();
            }else{
                $form.find('.passage-size').show();
            }
            
        }).on('change', 'select[name=size]', function(){
            
            var $select = $(this);
            var size = $select.val();
            var $form = $select.parents('.passage-form');
            var id = $form.data('passage-id');
            var oldSize = passageEditor.getPassage(interaction, id);
            
            passageEditor.setSize(interaction, id, size);
            
            //save the change in the model
            interaction.updateMarkup();
            
            //directly affect the dom
            $container.find('[data-passage-id=' + id + ']').removeClass(oldSize.size).addClass(size);
            
            //the container has been resized
            interaction.triggerPci('resize');
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
            //@todo remove me after completion
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
                    var $passage = $container.find('.passage-paging[data-passage-id=' + passage.uid + ']');
                    _.each(passage.pages, function(page){
                        var $page = $passage.find('.page[data-page-id=' + page.uid + ']');
                        initContentEditor($page.find('.page-content'), page, interaction);
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
        _.each(passageEditor.getAvailableTypes(), function(type){
            if(passage.type === type.cssClass){
                type.selected = true;
            }
            data.types.push(type);
        });
        
        if(passage.type !== 'passage-simple'){
            data.hasSize = true;
            data.sizes = [];
            _.each(passageEditor.getAvailableSizes(), function(size){
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

    return StateQuestion;
});