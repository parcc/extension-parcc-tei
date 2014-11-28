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

<div class="panel creator-graphFunctionInteraction-range">
    <h3>{{__ "X axis"}}</h3>
    <label for="xMin" class="spinner">from</label>
    <input name="xMin" value="{{xMin}}" data-increment="1" type="text" />
    <label for="xMax" class="spinner">to</label>
    <input name="xMax" value="{{xMax}}" data-increment="1" type="text" />
</div>

<div class="panel creator-graphFunctionInteraction-range">
    <h3>{{__ "Y axis"}}</h3>
    <label for="yMin" class="spinner">from</label>
    <input name="yMin" value="{{yMin}}" data-increment="1" type="text" />
    <label for="yMax" class="spinner">to</label>
    <input name="yMax" value="{{yMax}}" data-increment="1" type="text" />
</div>

<hr/>

<div class="item-editor-color-picker">
    <h3>{{__ "Graph Appearance"}}</h3>
    <div class="color-picker-container sidebar-popup">
        <div class="color-picker"></div>
        <input class="color-picker-input" type="text" value="#000000">
        <a class="closer" href="#" data-close="#color-picker-container"></a>
    </div>
    <div class="panel">
        <label for="graphColor">{{__ "Color"}}</label>
        <span class="color-trigger" id="graphColor"></span>
        <input type="hidden" name="graphColor" value="{{graphColor}}"/>
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label for="graphWidth" class="spinner">{{__ "Thickness"}}</label>
        <input name="graphWidth" value="{{graphWidth}}" data-increment="1" data-min="1" type="text" class="incrementer">
    </div>
</div>

<hr/>

<div class="panel" id="creator-graphFunctionInteraction-available-graphs">
    <label for="" class="has-icon">{{__ "Available Graphs"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'Define which graphs are availabe for the test taker to use.'}}</div>
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