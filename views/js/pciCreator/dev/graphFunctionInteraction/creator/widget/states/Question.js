define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!graphFunctionInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, containerEditor, formTpl, _, $){

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

        this.initColorPickers();

    }, function(){

        //destroy editors
        containerEditor.destroy(this.widget.$container.find('.prompt'));

    });

    function graphPropChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('gridchange', [interaction.getProperties()]);
    }

    StateQuestion.prototype.initForm = function(){

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration(),
            graphs = {
                linear : {label : 'Linear'},
                absolute : {label : 'Absolute Value'},
                quadratic : {label : 'Quadratic'},
                exponential : {label : 'Exponential'},
                logarithmic : {label : 'Logarithmic'},
                cosine : {label : 'Sin/Cos'},
                tangent : {label : 'Tan/Cotan'}
            };

        var graphSet = interaction.prop('graphs');
        graphSet = graphSet ? graphSet.split(',') : [];
        _.each(graphSet, function(graph){
            graphs[graph].checked = true;
        });

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),
            graphs : graphs,
            xMin : interaction.prop('xMin'),
            xMax : interaction.prop('xMax'),
            yMin : interaction.prop('yMin'),
            yMax : interaction.prop('yMax'),
            graphColor : interaction.prop('graphColor'),
            graphWidth : interaction.prop('graphWidth')
        }));

        //init form javascript
        formElement.initWidget($form);

        //set change callbacks:
        var options = {
            updateCardinality : false,
            attrMethodNames : {set : 'prop', remove : 'removeProp'},
            callback : function(){
                interaction.triggerPci('gridchange', [interaction.getProperties()]);
            }
        };


        var xAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'xMin', 'xMax', options);
        var yAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'yMin', 'yMax', options);
        var changeCallbacks = {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            graphColor : graphPropChangeCallback,
            graphWidth : graphPropChangeCallback
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks)

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, changeCallbacks);

        var $graphs = $form.find('[name=graphs]');
        $graphs.on('change', function(){
            var checked = [];
            $graphs.filter(':checked').each(function(){
                checked.push($(this).val());
            });
            interaction.prop('graphs', checked.join(','));
            interaction.triggerPci('functionschange', [checked]);
        });
    };

    StateQuestion.prototype.initColorPickers = function(){

        var $colorTriggers = this.widget.$form.find('.color-trigger');
        
        $colorTriggers.each(function(){

            var $colorTrigger = $(this),
                $input = $colorTrigger.siblings('input'),
                color = $input.val();

            //set color recorded in the hidden input to the color trigger
            $colorTrigger.css('background-color', color);
        });

        $colorTriggers.on('click.color-picker', function(){

            var $colorTrigger = $(this),
                $context = $colorTrigger.closest('.item-editor-color-picker'),
                $container = $context.find('.color-picker-container').show(),
                $colorPicker = $container.find('.color-picker'),
                $colorPickerInput = $container.find('.color-picker-input'),
                $input = $colorTrigger.siblings('input[type="hidden"]'),
                color = $input.val();

            // Init the color picker
            $colorPicker.farbtastic('.color-picker-input', $context);

            // Set the color to the currently set on the form init
            $colorPickerInput.val(color).trigger('keyup');

            // Populate the input with the color on quitting the modal
            $container.find('.closer').off('click').on('click', function(){
                $container.hide();
            });
            
            //listen to color change
            $colorPicker.off('.farbtastic').on('colorchange.farbtastic', function(e, color){
                $input.val(color).trigger('change');
            });
            
        });
    };

    return StateQuestion;
});
