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

<div class="panel">
    <h3>{{__ "Graph properties"}}</h3>
    <div class="panel">
        <label for="graphTitle">{{__ "Title"}}</label>
        <input name="graphTitle" value="{{graphTitle}}" type="text" />
    </div>
    <label>
        <input name="graphTitleRequired" type="checkbox" {{#if graphTitleRequired}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Display Title"}}
    </label>
    <div class="panel creator-graphPointLineGraphInteraction-spinner">
        <label for="width" class="spinner">{{__ "width"}}</label>
        <input name="width" value="{{width}}" data-increment="1" data-min="1" type="text" /><br />
        <label for="height" class="spinner">{{__ "height"}}</label>
        <input name="height" value="{{height}}" data-increment="1" data-min="1" type="text" /><br />
    </div>
</div>

<hr/>

<div class="panel">
    <h3>{{__ "X axis"}}</h3><br />
    <label>{{__ "Graduation"}}</label>
    <div class="panel subpanel">
        <div class="panel creator-graphPointLineGraphInteraction-range">
            <label for="xStart" class="spinner">{{__ "from"}}</label>
            <input name="xStart" value="{{xStart}}" data-increment="1" type="text" />
            <label for="xEnd" class="spinner">{{__ "to"}}</label>
            <input name="xEnd" value="{{xEnd}}" data-increment="1" type="text" /><br />
        </div>
        <div class="panel xStepValue">
            <label for="xStep" class="spinner">{{__ "by increment of"}}</label>
            <input name="xStep" value="{{xStep}}" data-increment="1" data-min="1" type="text" />
        </div>
        <div class="panel xStepInfo"></div>
    </div>
    <div class="panel">
        <label for="xTitle">{{__ "title"}}</label>
        <input name="xTitle" value="{{xTitle}}" type="text" />
    </div>
    <div class="panel">
        <label for="xLabel">{{__ "label"}}</label>
        <input name="xLabel" value="{{xLabel}}" type="text" />
    </div>
    <div class="panel creator-graphPointLineGraphInteraction-spinner">
        <label for="xSubStep" class="spinner">{{__ "sub step (snapping)"}}</label>
        <input name="xSubStep" value="{{xSubStep}}" data-increment="1" data-min="1" type="text" />
    </div>
    <label>
        <input name="xAllowOuter" type="checkbox" {{#if xAllowOuter}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "allow points on border"}}
    </label>
</div>

<hr/>

<div class="panel">
    <h3>{{__ "Y axis"}}</h3>
    <br />
    <label>{{__ "Graduation"}}</label>
    <div class="panel subpanel">
        <div class="panel creator-graphPointLineGraphInteraction-range">
            <label for="yytart" class="spinner">{{__ "from"}}</label>
            <input name="yStart" value="{{yStart}}" data-increment="1" type="text" />
            <label for="yEnd" class="spinner">{{__ "to"}}</label>
            <input name="xynd" value="{{yEnd}}" data-increment="1" type="text" /><br />
        </div>
        <div class="panel yStepValue">
            <label for="yStep" class="spinner">{{__ "by increment of"}}</label>
            <input name="yStep" value="{{yStep}}" data-increment="1" data-min="1" type="text" />
        </div>
        <div class="panel yStepInfo"></div>
    </div>
    <div class="panel">
        <label for="yTitle">{{__ "title"}}</label>
        <input name="yTitle" value="{{yTitle}}" type="text" />
    </div>
    <div class="panel">
        <label for="yLabel">{{__ "label"}}</label>
        <input name="yLabel" value="{{yLabel}}" type="text" />
    </div>
    <div class="panel creator-graphPointLineGraphInteraction-spinner">
        <label for="ySubStep" class="spinner">{{__ "sub step (snapping)"}}</label>
        <input name="ySubStep" value="{{ySubStep}}" data-increment="1" data-min="1" type="text" />
    </div>
    <label>
        <input name="yAllowOuter" type="checkbox" {{#if yAllowOuter}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "allow points on border"}}
    </label>
</div>

<hr/>

<div class="item-editor-color-picker">
    <h3>{{__ "Graph Appearance"}}</h3>
    <div class="color-picker-container sidebar-popup">
        <div class="sidebar-popup-title">
            <h3>{{__ "Color selector"}}</h3>
            <a class="closer" href="#" data-close="#color-picker-container"></a>
        </div>
        <div class="color-picker"></div>
        <input class="color-picker-input" type="text" value="#000000">
    </div>
    <div class="panel">
        <label for="plotColor">{{__ "Graph Color"}}</label>
        <span class="color-trigger" id="plotColor"></span>
        <input type="hidden" name="plotColor" value="{{plotColor}}"/>
    </div>
    <div class="panel">
        <label for="pointColor">{{__ "Point Color"}}</label>
        <span class="color-trigger" id="pointColor"></span>
        <input type="hidden" name="pointColor" value="{{pointColor}}"/>
    </div>
</div>
<div class="panel">
    <div class="panel  creator-graphPointLineGraphInteraction-spinner">
        <label for="plotThickness" class="spinner">{{__ "Thickness"}}</label>
        <input name="plotThickness" value="{{plotThickness}}" data-increment="1" data-min="1" type="text" class="incrementer">
        <label for="pointRadius" class="spinner">{{__ "Point radius"}}</label>
        <input name="pointRadius" value="{{pointRadius}}" data-increment="1" data-min="1" type="text" class="incrementer">
        <label for="weight" class="spinner">{{__ "inner line weight"}}</label>
        <input name="weight" value="{{weight}}" data-increment="1" data-min="1" type="text" />
    </div>
    <label>
        <input name="pointGlow" type="checkbox" {{#if pointGlow}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ " points Glow"}}
    </label>
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