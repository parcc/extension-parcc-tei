<responseCondition>
    <responseIf>
        <gte>
            <customOperator class="qti.customOperators.math.graph.CountPointsThatSatisfyEquation">
                <variable identifier="{{responseIdentifier}}"/>
                <baseValue baseType="string">{{equation}}</baseValue>
            </customOperator>
            <baseValue baseType="integer">{{mumPointsRequired}}</baseValue>
        </gte>
        <setOutcomeValue identifier="SCORE">
            <sum>
            <variable identifier="SCORE"/>
            <baseValue baseType="float">{{score}}</baseValue>
            </sum>
        </setOutcomeValue>
    </responseIf>
</responseCondition>