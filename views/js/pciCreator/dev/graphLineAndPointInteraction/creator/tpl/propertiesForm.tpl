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

<div class="panel creator-pointAndLineFunctionInteraction">
    <h3>{{__ "X axis"}}</h3>
    <label for="xMin" class="spinner">from</label>
    <input name="xMin" value="{{xMin}}" data-increment="1" type="text" />
    <label for="xMax" class="spinner">to</label>
    <input name="xMax" value="{{xMax}}" data-increment="1" type="text" />
</div>

<div class="panel creator-pointAndLineFunctionInteraction">
    <h3>{{__ "Y axis"}}</h3>
    <label for="yMin" class="spinner">from</label>
    <input name="yMin" value="{{yMin}}" data-increment="1" type="text" />
    <label for="yMax" class="spinner">to</label>
    <input name="yMax" value="{{yMax}}" data-increment="1" type="text" />
</div>

<div class="panel" id="creator-pointAndLineFunctionInteraction-available-graphs">
    <label for="" class="has-icon">{{__ "Type of Elements"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'Define which type of elements for the test taker to use.'}}</div>
    <select name="graphs">
        {{#each graphs}}
        <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
        {{/each}}
    </select>
</div>
<div class="panel pointAndLineFunctionInteraction">
    <label for="nbElement">{{__ "Number of Elements"}}</label>
    <input name="nbElement" value="{{nbElement}}" data-increment="1" data-min="1" type="text">
</div>
