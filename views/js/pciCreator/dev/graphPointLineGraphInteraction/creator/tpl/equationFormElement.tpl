<div class="panel equation-scoring">
    <label>
        <input name="equationScoring" type="checkbox" data-role="defineCorrect"{{#if equationScoring}} checked="checked"{{/if}} />
        <span class="icon-checkbox"></span>
        {{__ "Swtich to equation based scoring"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Define equation based resposne processing."}}</span>
</div>