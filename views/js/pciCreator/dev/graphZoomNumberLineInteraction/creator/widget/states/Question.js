define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!graphZoomNumberLineInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, containerEditor, formTpl, _, $){
    
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
        var pci = this.widget.element.data('pci');
        if(pci){
            pci.reset();
        }
    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration();

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),
            min : interaction.prop('min'),
            max : interaction.prop('max'),
            unitSubDivision : interaction.prop('unitSubDivision'),
            snapTo : interaction.prop('snapTo'),
            increment : interaction.prop('increment')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });

        //prevent user to enter start > end
        var $start = $('[name="min"]','#creator-graphFunctionInteraction-axis'),
            $end = $('[name="max"]','#creator-graphFunctionInteraction-axis');
        $start.on('change',function(){
            // If start >= end , set it to end - 1
            if (parseInt($start.val()) >= parseInt($end.val())) {
                $start.val(parseInt($end.val())-1);
            }
        });
        $end.on('change',function(){
            // If end <= start, set it to start + 1
            if (parseInt($end.val()) <= parseInt($start.val())) {
                $end.val(parseInt($start.val())+1);
            }
        });

        $form.find('#creator-graphFunctionInteraction-axis input').on('change',function(){
            var property = $(this).attr('name'),
            value = $(this).val(),
            result = {};
            result[property] = value;
            interaction.prop(property,parseInt(value));
            interaction.triggerPci('axischange', [result] );
        });
    };

    return StateQuestion;
});
