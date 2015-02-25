define([
    'parccTei/pciCreator/dev/multiTabbedExhibit/creator/widget/helper/passageEditor',
    'taoQtiItem/qtiCreator/model/interactions/PortableCustomInteraction',
    'jquery',
    'lodash'
], function (passageEditor, PortableCustomInteraction, $, _) {

    'use strict';

    QUnit.test('loadData', function () {
        
        var $markupContainer = $('.multiTabbedExhibit-markup');
        QUnit.assert.ok($markupContainer.length, 'the markup is present');
        
        var interaction = new PortableCustomInteraction();
        interaction.markup = $markupContainer.html();
        
        passageEditor.loadData(interaction);
        
        var passages = interaction.data('passages');
        QUnit.assert.equal(_.size(passages), 3, 'passages loaded');
        console.log(passages);
    });
    
    QUnit.test('create and get', function () {
        
        var interaction = new PortableCustomInteraction();
        QUnit.assert.equal(interaction.data('passages'), undefined, 'passage empty');
        
        var passageId = passageEditor.create(interaction);
        
        QUnit.assert.equal(_.size(interaction.data('passages')), 1, 'passage created');
        
        var passage = passageEditor.getPassage(interaction, passageId);
        QUnit.assert.equal(passage.type, "passage-simple", 'new passage type correct');
        QUnit.assert.ok(passage.content, 'new passage has content');
    });
});