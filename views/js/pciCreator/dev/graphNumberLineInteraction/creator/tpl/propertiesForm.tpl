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

<hr/>
<div class="panel" id="creator-graphFunctionInteraction-axis">
    <h3>{{__ "Interval"}}</h3>
    <label for="min" class="spinner">{{__ "Start point"}}</label>
    <input name="min" value="{{min}}" data-increment="1" type="text" />
    <label for="max" class="spinner">{{__ "End Point"}}</label>
    <input name="max" value="{{max}}" data-increment="1" type="text" />
    <label for="unitSubdivision" class="spinner">{{__ "Small Mark"}}</label>
    <input name="unitSubdivision" value="{{unitSubDivision}}" data-increment="1" data-min="1" type="text">
    <label for="snapTo" class="spinner">{{__ "Snap to Int."}}</label>
    <input name="snapTo" value="{{snapTo}}" data-increment="1" data-min="1" type="text">
</div>
<hr/>
<div class="panel" id="creator-graphFunctionInteraction-available-graphs">
    <label for="" class="has-icon">{{__ "Available Intervals"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'Define which interval types are availabe for the test taker to use.'}}</div>
    <ul class="plain" data-role="intervals">
        {{#each intervals}}
        <li>
            <label>
                <input name="intervals" value="{{@key}}" type="checkbox" {{#if checked}}checked="checked"{{/if}}/>
                       <span class="icon-checkbox"></span>
                {{label}}
            </label>
        </li>
        {{/each}}
    </ul>
</div>
