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

    }, function(){

        //destroy editors
        containerEditor.destroy(this.widget.$container.find('.prompt'));

    });

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
            yMax : interaction.prop('yMax')
        }));

        //init form javascript
        formElement.initWidget($form);
        
        //set change callbacks:
        var options = {
            updateCardinality: false,
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
            }
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

    return StateQuestion;
});
