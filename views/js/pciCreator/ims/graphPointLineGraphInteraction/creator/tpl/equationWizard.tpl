<div class="equation-wizard">
    <h2>{{__ "Equation Response Processing Wizard"}}</h2>
    <p>{{__ "The response processing will turn into qti custom mode using this equation to score this interaction. Subsequent changes need to be done in the global item custom response processing editor."}}</p>
    <div>
        <label for="equation" class="has-icon">{{__ "Equation"}}</label>
        <input type="text"
               name="equation"
               value=""
               placeholder="e.g. y = 2*x^3 + 6"
               data-validate="$notEmpty;"
               class="long">
    </div>
    <div>
        <label for="mumPointsRequired" class="has-icon">{{__ "Required points"}}</label>
        <input type="text"
               name="mumPointsRequired"
               value="1"
               placeholder="e.g. 3"
               data-validate="$notEmpty;"
               class="short">
    </div>
    <div>
        <label for="score" class="has-icon">{{__ "Score"}}</label>
        <input type="text"
               name="score"
               value="1"
               placeholder="e.g. 1"
               data-validate="$notEmpty;"
               class="short">
    </div>
</div>