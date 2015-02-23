define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!multiTabbedExhibit/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(
    stateFactory,
    Question,
    formElement,
    containerEditor,
    formTpl,
    _,
    $){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

        var interaction = this.widget.element,
            $container = this.widget.$container;

        //init prompt editor
        containerEditor.create($container.find('.prompt'), {
            change : function(text){
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction
        });

    }, function(){

        containerEditor.destroy(this.widget.$container.find('.prompt'));
    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form;

        //render the form using the form template
        $form.html(formTpl({
            tabbed : interaction.prop('tabbed')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            tabbed : function(i, value){
                interaction.prop('tabbed', value);
                
                //toggle tabbed editing panel visibility
                
                //communicate change to pci:
            }
        });
        
        //toggle visibility of tabs editing panel
        
        //add tabs option forms
        
        //init add tab button
        
    };

    return StateQuestion;
});