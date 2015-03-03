<div class="panel">
    <label>
        <input name="tabbed" type="checkbox" {{#if tabbed}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Enable multi tab"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Enable multi tabbed passages."}}</span>
</div>

<div class="panel creator-multiTabbedExhibit">

    <h3>{{__ "Tabs"}}</h3>

    <div class="tab-form-container">
    </div>
    
    <div class="tab-form-add">
        <button class="btn btn-info small">Add Tab</button>
    </div>
</div>