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
    <h3>{{__ "Graph type"}}</h3>
    <div class="panel">
        <label class="smaller-prompt">
            <input type="radio" name="graphType" value="line" {{#unless scatterplot}}checked{{/unless}} />
            <span class="icon-radio"></span>
            {{__ 'Line'}}
        </label>
        <br />
        <label class="smaller-prompt">
            <input type="radio" name="graphType" value="scatterplot" {{#if scatterplot}}checked{{/if}} />
            <span class="icon-radio"></span>
            {{__ 'Scatterplot'}}
        </label>
    </div>
</div>

<hr/>

<div class="panel">
    <h3>{{__ "Graph properties"}}</h3>
    <div class="panel">
        <label for="graphTitle">{{__ "Title"}}</label>
        <input name="graphTitle" value="{{graphTitle}}" type="text" />
    </div>
    <div class="panel creator-graphPointLineGraphInteraction-spinner">
        <label for="maxPoints" class="spinner">{{__ "Max number of points"}}</label>
        <input name="maxPoints" value="{{maxPoints}}" data-increment="1" data-min="1" type="text" /><br />
        <label for="width" class="spinner">{{__ "width"}}</label>
        <input name="width" value="{{width}}" data-increment="1" data-min="1" type="text" /><br />
        <label for="height" class="spinner">{{__ "height"}}</label>
        <input name="height" value="{{height}}" data-increment="1" data-min="1" type="text" /><br />
    </div>
    <label>
        <input name="draggable" type="checkbox" {{#if draggable}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Draggable"}}
    </label>
    <label>
        <input name="segment" type="checkbox" {{#if segment}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Segment mode"}}
    </label>
</div>

<hr/>

<div class="panel">
    <h3>{{__ "X axis"}}</h3>
    <div class="panel">
        <label for="xLabel">{{__ "label"}}</label>
        <input name="xLabel" value="{{xLabel}}" type="text" />
    </div>
    <div class="panel creator-graphPointLineGraphInteraction-range">
        <label for="xStart" class="spinner">{{__ "from"}}</label>
        <input name="xStart" value="{{xStart}}" data-increment="1" type="text" />
        <label for="xEnd" class="spinner">{{__ "to"}}</label>
        <input name="xEnd" value="{{xEnd}}" data-increment="1" type="text" /><br />
    </div>
    <div class="panel creator-graphPointLineGraphInteraction-spinner">
        <label for="xStep" class="spinner">{{__ "step"}}</label>
        <input name="xStep" value="{{xStep}}" data-increment="1" data-min="1" type="text" />
        <br />
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
    <div class="panel">
        <label for="yLabel">{{__ "label"}}</label>
        <input name="yLabel" value="{{yLabel}}" type="text" />
    </div>
    <div class="panel creator-graphPointLineGraphInteraction-range">
        <label for="yStart" class="spinner">from</label>
        <input name="yStart" value="{{yStart}}" data-increment="1" type="text" />
        <label for="yEnd" class="spinner">to</label>
        <input name="yEnd" value="{{yEnd}}" data-increment="1" data-min="1" type="text" />
    </div>
    <div class="panel creator-graphPointLineGraphInteraction-spinner">
        <label for="yStep" class="spinner">{{__ "step"}}</label>
        <input name="yStep" value="{{yStep}}" data-increment="1" data-min="1" type="text" />
        <br />
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
        <div class="color-picker"></div>
        <input class="color-picker-input" type="text" value="#000000">
        <a class="closer" href="#" data-close="#color-picker-container"></a>
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

