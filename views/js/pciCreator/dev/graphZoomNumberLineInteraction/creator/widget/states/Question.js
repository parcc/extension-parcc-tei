define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!graphZoomNumberLineInteraction/creator/tpl/propertiesForm',
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

        containerEditor.destroy(this.widget.$container.find('.prompt'));
        this.widget.element.data('pci').reset();
    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration(),
            intervals = {
                'closed-closed' : {label : 'closed-closed'},
                'closed-open' : {label : 'closed-open'},
                'open-closed' : {label : 'open-closed'},
                'open-open' : {label : 'open-open'},
                'arrow-open' : {label : 'arrow-open'},
                'arrow-closed' : {label : 'arrow-closed'},
                'open-arrow' : {label : 'open-arrow'},
                'closed-arrow' : {label : 'closed-arrow'}
            };

        var intervalSet = interaction.prop('intervals');
        intervalSet = intervalSet ? intervalSet.split(',') : [];
        _.each(intervalSet, function(type){
            intervals[type].checked = true;
        });

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            intervals : intervals,
            identifier : interaction.attr('responseIdentifier')
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
        
        //manually get array of checked intervals
        var $intervals = $form.find('[name=intervals]');
        $intervals.on('change', function(){
            var checked = [];
            $intervals.filter(':checked').each(function(){
                checked.push($(this).val());
            });
            interaction.prop('intervals', checked.join(','));
            interaction.triggerPci('intervalschange', [checked]);
        });
    };

    return StateQuestion;
});