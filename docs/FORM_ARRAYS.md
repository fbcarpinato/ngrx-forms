## Form Arrays

Form arrays are collections of controls. They are represented as plain state arrays. The state of an array is determined almost fully by its child states. Form array states have the following shape:

```typescript
export class FormArrayState<TValue> extends AbstractControlState<TValue[]> {
  readonly controls: Array<AbstractControlState<TValue>>;
}
```

As you can see most properties are shared with controls via the common base interface `AbstractControlState`. The following table explains each property in the context of an array.

|Property|Negated|Description|
|-|-|-|
|`id`||The unique ID of the array.|
|`value`||The aggregated value of the array. The value is computed by aggregating the values of all children into an array.|
|`isValid`|`isInvalid`|The `isValid` property is `true` if the array does not have any errors itself and none of its children have any errors.|
|`errors`||The errors of the array. This property is computed by merging the errors of the control with the errors of all its children where the child errors are a property of the `errors` object prefixed with an underscore (e.g. `{ arrayError: true, _0: { childError: true } }`). If neither the array nor any children have errors the property is set to `{}`.|
|`pendingValidations`||The names of all asynchronous validations currently running for the array.|
|`isValidationPending`||The `isValidationPending` property indicates whether the array or any of its children are currently being asynchronously validated.|
|`isEnabled`|`isDisabled`|The `isEnabled` property is `true` if and only if at least one child state is enabled.|
|`isDirty`|`isPristine`|The `isDirty` property is `true` if and only if at least one child state is marked as dirty.|
|`isTouched`|`isUntouched`|The `isTouched` property is `true` if and only if at least one child state is marked as touched.|
|`isSubmitted`|`isUnsubmitted`|The `isSubmitted` property is set to `true` if the containing group is submitted.|
|`controls`||This property contains all child states of the array. As you may have noticed the type of each child state is `AbstractControlState` which sometimes forces you to cast the state explicitly. It is not possible to improve this typing until [conditional mapped types](https://github.com/Microsoft/TypeScript/issues/12424) are added to TypeScript.|
|`userDefinedProperties`||`userDefinedProperties` work the same for arrays as they do for controls.|

Array states are completely independent of the DOM. They are updated by intercepting all actions that change their children (i.e. the array's reducer is the parent reducer of all its child reducers and forwards any actions to all children; if any children change it recomputes the state of the array). An array state can be created via `createFormArrayState`. This function takes an initial value and automatically creates all child states recursively.

#### Dynamic Form Arrays

Sometimes you will have to render a variable number of fields in your form. Form arrays support adding and removing controls dynamically. This can be done in two ways:

1) explicitly call the `addArrayControl` and `removeArrayControl` update functions (see the section section on [updating the state](UPDATING_THE_STATE.md) for more details on these functions)
2) set the value of the form array via `setValue` which will automatically update the form array based on the value you provide

Below you can find an example of how this would look. Assume that we have an action that provides a variable set of objects which each should be mapped to an array with two form controls.

```typescript
import { Action } from '@ngrx/store';
import { FormArrayState, setValue } from 'ngrx-forms';

interface DynamicObject {
  someNumber: number;
  someCheckbox: boolean;
}

interface DynamicObjectFormValue {
  someNumber: number;
  someCheckbox: boolean;
}

interface SetDynamicObjectsAction extends Action {
  type: 'SET_DYNAMIC_OBJECTS';
  objects: DynamicObject[];
}

interface AppState {
  someOtherState: string;
  someOtherNumber: number;
  dynamicFormArray: FormArrayState<DynamicObjectFormValue>;
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DYNAMIC_OBJECTS': {
      const newFormValue: DynamicObjectFormValue[] = (action as SetDynamicObjectsAction).objects;

      // the `setValue` will add and remove controls as required; existing controls that are still
      // present get their value updated but are otherwise kept in the same state as before
      const dynamicFormArray = setValue(newFormValue, state.dynamicFormArray);
      return { ...state, dynamicFormArray };
    }

    default:
      return state;
  }
}
```
