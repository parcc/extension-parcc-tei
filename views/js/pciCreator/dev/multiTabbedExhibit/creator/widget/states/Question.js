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

        var interaction = this.widget.element,
            $container = this.widget.$container;

        //load passages content into authoring model
        passageEditor.loadData(interaction);

        //init passage editors


        interaction.onPci('passagereload', function(){
            //init passage editors
            console.log('passagereload');

        });

    }, function(){

    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
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
                refreshRendering(interaction);
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
            $panelTabForms.append(renderPassageForm(passage));

            //communicate change to pci
            refreshRendering(interaction);
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
            refreshRendering(interaction);
        });

    };

    function renderPassageForm(passage){

        var data = {
            passageId : passage.uid,
            name : passage.title,
            hasSize : false
        };

        if(passage.type !== 'passage-simple'){
            data.hasSize = true;
            data.sizes = [];
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
            _.each(_availableSizes, function(size){
                if(passage.size === size.cssClass){
                    size.selected = true;
                }
                data.sizes.push(size);
            });
        }

        return tabTpl(data);
    }
    
    function refreshRendering(interaction){
        
        //update the markup
        interaction.updateMarkup();
        
        //reload the pci
        interaction.triggerPci('passagechange', [interaction.markup, interaction.prop('tabbed')]);
    }
    
    return StateQuestion;
});