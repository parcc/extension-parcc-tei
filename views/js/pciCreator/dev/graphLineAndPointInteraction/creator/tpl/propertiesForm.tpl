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

    <h3>{{__ "Type of Elements"}}</h3>

    {{#each graphs}}
    <div>
        <label for="{{@key}}" class="spinner">{{label}}</label>
        <input name="{{@key}}" value="{{count}}" data-increment="1" data-min="0" type="text">
        <a href="#" title="{{__ 'edit options'}}" class="more sidebar-popup-trigger" data-popup="~ .sidebar-popup" data-type="{{@key}}">...</a>
        <div class="sidebar-popup">
            <div class="sidebar-popup-title">
                <h3>{{@key}} options</h3>
                <a class="closer" href="#" title="{{__ 'Close'}}"></a>
            </div>
            <div class="sidebar-popup-content"></div>
        </div>
    </div>
    {{/each}}

</div>