<div class="panel graph-form-container">
    <div class="panel">
        <label for="label" class="has-icon">{{__ "Point set name"}}</label>

        <input type="text"
               name="label"
               value="{{label}}"
               data-role="title"
               placeholder="e.g. Point Set A"
               data-validate="$notEmpty;">
    </div>

    <div class="panel">
        <label for="maximumPoints" class="spinner">{{__ "Maximum of Points"}}</label>
        <input name="maximumPoints" value="{{maximumPoints}}" data-increment="1" data-min="1" type="text" class="incrementer">
    </div>

    <div class="panel item-editor-color-picker">
        <label for="pointColor" class="spinner">{{__ "Point color"}}</label>
        <span class="color-trigger" id="pointColor"></span>
        <input type="hidden" name="pointColor" value="{{pointColor}}"/>
    </div>

    <div class="panel">
        <label for="pointRadius" class="spinner">{{__ "Point Radius"}}</label>
        <input name="pointRadius" value="{{pointRadius}}" data-increment="1" data-min="2" type="text" class="incrementer">
    </div>
</div>