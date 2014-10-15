define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'tpl!graphFunctionInteraction/creator/tpl/propertiesForm',
    'lodash'
], function(stateFactory, Question, formElement, editor, formTpl, _){

    var StateQuestion = stateFactory.extend(Question, function(){
        
        //code to execute when entering this state

    }, function(){
        
        //code to execute when leaving this state

    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)
        
        var widget = this.widget, 
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration(),
            somePropValue = 'some prop value';
        
        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            someProp : somePropValue,
            identifier : interaction.attr('responseIdentifier')
        }));
        
        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            someProp : function(interaction, value){

                //update the pci property value:
                interaction.prop('someProp', value);

                //update rendering (if required to update the visual)
                //warning heavy operation : might be a good idea to use lodash.throttle()
                widget.refresh();
            },
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });
    };

    return StateQuestion;
});
