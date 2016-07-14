define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!graphFunctionInteraction/creator/tpl/answerForm'
], function(_, $, __, stateFactory, Answer, formElement, answerFormTpl){

    var StateAnswer = stateFactory.extend(Answer, function(){

        initResponseDeclarationWidget(this.widget);
        initResponseDeclarationForm(this.widget);
    }, function(){
        
        destroyResponseDeclarationWidget(this.widget);
    });

    /**
     * Init the form to edit the response declaration option
     *
     * @param widget
     */
    function initResponseDeclarationForm(widget){

        var responseDeclaration = widget.element.getResponseDeclaration();
        var $form = $(answerFormTpl({
            equation : getCorrectResponseRecordEntryValue(responseDeclaration, 'equation')
        }));
        widget.$responseForm.append($form);

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, responseDeclaration, {
            equation : function updateEquation(r, value){
                setCorrectResponseRecordEntry(responseDeclaration, 'equation', 'string', value);
            }
        });
    }

    /**
     * Set the correct response to the state of interaction and set the correct response listener
     *
     * @param widget
     */
    function initResponseDeclarationWidget(widget){
        
        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();
        var graphType = getCorrectResponseRecordEntryValue(responseDeclaration, 'functionGraphType');
        var samplePoints = getCorrectResponseRecordEntryValue(responseDeclaration, 'samplePoints');
        if(graphType && samplePoints){
            samplePoints = samplePoints.split(',');
            interaction.setResponse({
                record : [
                    {
                        name: 'functionGraphType',
                        base : {'string' : graphType}
                    },
                    {
                        name : 'points',
                        list : {
                            string : samplePoints
                        }
                    }
                ]
            });
        }

        //init editing widget event listener
        interaction.onPci('responseChange', function(response){
            if(response &&
                _.isArray(response.record) &&
                response.record[0] &&
                response.record[1] &&
                response.record[0].name === 'functionGraphType' &&
                response.record[0].base &&
                response.record[0].base.string &&
                response.record[1].name === 'points' &&
                response.record[1].list &&
                _.isArray(response.record[1].list.string)
            ){
                setCorrectResponseRecordEntry(responseDeclaration, 'functionGraphType', 'string', response.record[0].base.string);
                setCorrectResponseRecordEntry(responseDeclaration, 'samplePoints', 'string', response.record[1].list.string.join(','));
                setCorrectResponseRecordEntry(responseDeclaration, 'vertex', 'string', response.record[1].list.string[0] || '');
            }
        });

        //remove the response processing mode selector as this interaction only supports custom rp
        widget.$responseForm.find('select[name="template"]').closest('.panel').remove();
    }

    /**
     * Restore default interaction state and remove listeners
     *
     * @param widget
     */
    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();
    }

    /**
     * Set an entry into the record typed correct response
     *
     * @param responseDeclaration
     * @param fieldIdentifier
     * @param baseType
     * @param value
     */
    function setCorrectResponseRecordEntry(responseDeclaration, fieldIdentifier, baseType, value){
        var record = responseDeclaration.correctResponse;
        var recordEntry = _.find(record, {fieldIdentifier : fieldIdentifier});
        if(!recordEntry){
            recordEntry = {fieldIdentifier : fieldIdentifier};
            responseDeclaration.correctResponse[fieldIdentifier] = recordEntry;
        }
        recordEntry.baseType = baseType;
        recordEntry.value = value;
    }

    /**
     * Get an entry from the record typed correct response
     *
     * @param responseDeclaration
     * @param fieldIdentifier
     * @returns {*}
     */
    function getCorrectResponseRecordEntryValue(responseDeclaration, fieldIdentifier){
        var record = responseDeclaration.correctResponse;
        var recordEntry = _.find(record, {fieldIdentifier : fieldIdentifier});
        if(recordEntry){
            return recordEntry.value;
        }
    }

    return StateAnswer;
});
