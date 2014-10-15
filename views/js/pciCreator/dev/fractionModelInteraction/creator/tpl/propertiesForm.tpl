<div class="panel">
    <label for="someProp">{{__ "Some Property"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Some Property Description"}}</span>
    <select name="someProp" class="select2" data-has-search="false">
        {{#each someProps}}
        <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
        {{/each}}
    </select>
</div>

<div class="panel">
    <label for="" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text" 
           name="identifier" 
           value="{{identifier}}" 
           placeholder="e.g. RESPONSE" 
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>