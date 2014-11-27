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


<h3>{{__ "X  Axis"}}
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'Configure the x axis.'}}
    </span>
</h3>

<div>
    <label for="xMin" class="spinner">From</label>
    <input name="xMin" value="{{xMin}}" data-increment="1" type="text" />
</div>
<div>
    <label for="xMax" class="spinner">To</label>
    <input name="xMax" value="{{xMax}}" data-increment="1" type="text" />
</div>


<h3>{{__ "Y Axis"}}
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'COnfigure the y axis.'}}
    </span>
</h3>

<div>
    <label for="yMin" class="spinner">From</label>
    <input name="yMin" value="{{yMin}}" data-increment="1" type="text" />
</div>
<div>
    <label for="yMax" class="spinner">To</label>
    <input name="yMax" value="{{yMax}}" data-increment="1" type="text" />
</div>


<div class="panel">
    
    <label for="" class="has-icon">{{__ "Available Graphs"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'Define which graphs is availabe for the test taker to use.'}}</div>

    <ul class="plain" data-role="graphs">
        {{#each graphs}}
        <li>
            <label>
                <input name="graphs" value="{{@key}}" type="checkbox" {{#if checked}}checked="checked"{{/if}}/>
                       <span class="icon-checkbox"></span>
                {{label}}
            </label>
        </li>
        {{/each}}
    </ul>
</div>