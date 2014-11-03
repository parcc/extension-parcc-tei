define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!fractionModelInteraction/creator/tpl/propertiesForm',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function(_, $, stateFactory, Question, formElement, simpeEditor, containerEditor, formTpl){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

        $('.color-trigger', this.widget.$form).each(function(){
            var $context = $(this).closest('.panel'),
                color = $('input', $context).val();
            $(this).css('background-color', color);
        });

        //code to execute when entering this state
        $('.color-trigger').on('click', function(){
            var $context = $(this).closest('.item-editor-color-picker'),
                $this = $(this),
                input = $this.siblings('input[type="hidden"]')[0],
                $container = $($('.color-picker-container', $context)).show(),
                color = $('input', $(this).closest('.panel')).val();

            // Init the color picker
            $('.color-picker', $context).farbtastic('.color-picker-input', $context);
            // Set the color to the currently set on the form init
            $('.color-picker-input', $context).val(color).trigger('keyup');
            // Populate the input with the color on quitting the modal
            $('[data-close]', $container).off('click').on('click', function(){
                var color = $('.color-picker-input', $context).val();
                $container.hide();
                $(input, $context).val(color).trigger('change');
            });
        });
        
        //init event listeners
        var interaction = this.widget.element;
        interaction.onPci('responsechange.question', function(response){
            if(response && response.base && response.base.directedPair){
                interaction.prop('selectedPartitionsInit', response.base.directedPair[0]);
                interaction.prop('partitionInit', response.base.directedPair[1]);
            }
        }).onPci('selectedparition', function(selectedPartitions){
            interaction.prop('selectedPartitions', JSON.stringify(_.values(selectedPartitions)));
        });

    }, function(){
        
        //remove event listeners
        this.widget.element.offPci('.question');
    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration();

        function _getChangeCallback(refresh){
            return function(interaction, value, name){
                interaction.prop(name, value);
                if(refresh){
                    widget.refresh();
                }
            };
        }

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            radius : interaction.prop('radius'),
            selectedPartitionsColor : interaction.prop('selectedPartitionsColor'),
            partitionColor : interaction.prop('partitionColor'),
            outlineColor : interaction.prop('outlineColor'),
            outlineThickness : interaction.prop('outlineThickness'),
            identifier : interaction.attr('responseIdentifier')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            radius : _getChangeCallback(true),
            selectedPartitionsColor : _getChangeCallback(true),
            partitionColor : _getChangeCallback(true),
            outlineColor : _getChangeCallback(true),
            outlineThickness : _getChangeCallback(true),
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });
    };

    return StateQuestion;
});
