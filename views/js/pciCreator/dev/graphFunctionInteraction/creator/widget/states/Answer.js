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

    function initResponseDeclarationWidget(widget){
        
        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();

        if(_.isArray(responseDeclaration.correctResponse)){
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
        }

        //init editing widget event listener
        interaction.onPci('responseChange', function(response){

            console.log('responseChange', response);
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

        return;
        //test...
        setCorrectResponseRecordEntry(responseDeclaration, 'functionGraphType', 'string', 'abs');
        setCorrectResponseRecordEntry(responseDeclaration, 'points', 'string', '0 1, -1 3');
        setCorrectResponseRecordEntry(responseDeclaration, 'points', 'string', '0 1, -1 3, x x');
        console.log(responseDeclaration.correctResponse);

        return;



        var correct = responseDeclaration.correctResponse;
        var points = _.find(correct, {fieldIdentifier : 'points'});
        console.log(correct);
        console.log(points);
        points.value += ',9 9';
        console.log(correct);
        return;

        //find sample points:
        //_.find()

        //set correct response as defined in the model
        interaction.setResponse({
            base : {
                string : correct
            }
        });

        //init editing widget event listener
        interaction.onPci('responseChange', function(response){

            if(response && response.base && response.base.string){
                var correctResponse = response.base.string
                responseDeclaration.setCorrect(correctResponse);
            }
        });

    }
    
    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();
    }

    function setCorrectResponseRecordEntry(responseDeclaration, fieldIdentifier, baseType, value){
        var record = responseDeclaration.correctResponse;
        var recordEntry = _.find(record, {fieldIdentifier : fieldIdentifier});
        if(!recordEntry){
            recordEntry = {fieldIdentifier : fieldIdentifier};
            responseDeclaration.correctResponse.push(recordEntry);
        }
        recordEntry.baseType = baseType;
        recordEntry.value = value;
    }

    function getCorrectResponseRecordEntryValue(responseDeclaration, fieldIdentifier){
        var record = responseDeclaration.correctResponse;
        var recordEntry = _.find(record, {fieldIdentifier : fieldIdentifier});
        if(recordEntry){
            return recordEntry.value;
        }
    }

    return StateAnswer;
});
