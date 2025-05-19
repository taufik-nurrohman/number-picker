import {/* focusTo, */insertAtSelection, selectTo, selectToNone} from '@taufik-nurrohman/selection';
import {R, W, getAria, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getElementIndex, getHTML, getID, getName, getNext, getParent, getParentForm, getPrev, getRole, getState, getStyle, getText, getValue, hasState, isDisabled, isReadOnly, isRequired, letAria, letAttribute, letClass, letDatum, letElement, letID, letStyle, setAria, setAttribute, setChildLast, setClass, setDatum, setElement, setHTML, setID, setNext, setStyle, setStyles, setText, setValue} from '@taufik-nurrohman/document';
import {delay, repeat} from '@taufik-nurrohman/tick';
import {forEachArray, forEachMap, forEachObject, forEachSet, getPrototype, getReference, getValueInMap, hasKeyInMap, letReference, letValueInMap, onAnimationsEnd, setObjectAttributes, setObjectMethods, setReference, setValueInMap, toValuesFromMap, toValueFirstFromMap} from '@taufik-nurrohman/f';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {getScroll, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isBoolean, isFloat, isFunction, isInstance, isInteger, isNumber, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, offEventPropagation, onEvent} from '@taufik-nurrohman/event';
import {toCaseLower, toCount, toMapCount, toSetCount, toValue} from '@taufik-nurrohman/to';

const FILTER_COMMIT_TIME = 10;
const SEARCH_CLEAR_TIME = 500;

const EVENT_DOWN = 'down';
const EVENT_MOVE = 'move';
const EVENT_UP = 'up';

const EVENT_BLUR = 'blur';
const EVENT_CUT = 'cut';
const EVENT_FOCUS = 'focus';
const EVENT_INPUT = 'input';
const EVENT_INVALID = 'invalid';
const EVENT_KEY = 'key';
const EVENT_KEY_DOWN = EVENT_KEY + EVENT_DOWN;
const EVENT_MOUSE = 'mouse';
const EVENT_MOUSE_DOWN = EVENT_MOUSE + EVENT_DOWN;
const EVENT_MOUSE_MOVE = EVENT_MOUSE + EVENT_MOVE;
const EVENT_MOUSE_UP = EVENT_MOUSE + EVENT_UP;
const EVENT_PASTE = 'paste';
const EVENT_RESET = 'reset';
const EVENT_RESIZE = 'resize';
const EVENT_SCROLL = 'scroll';
const EVENT_SUBMIT = 'submit';
const EVENT_TOUCH = 'touch';
const EVENT_TOUCH_END = EVENT_TOUCH + 'end';
const EVENT_TOUCH_MOVE = EVENT_TOUCH + EVENT_MOVE;
const EVENT_TOUCH_START = EVENT_TOUCH + 'start';
const EVENT_WHEEL = 'wheel';

const KEY_DOWN = 'Down';
const KEY_LEFT = 'Left';
const KEY_RIGHT = 'Right';
const KEY_UP = 'Up';

const KEY_ARROW = 'Arrow';
const KEY_ARROW_DOWN = KEY_ARROW + KEY_DOWN;
const KEY_ARROW_LEFT = KEY_ARROW + KEY_LEFT;
const KEY_ARROW_RIGHT = KEY_ARROW + KEY_RIGHT;
const KEY_ARROW_UP = KEY_ARROW + KEY_UP;
const KEY_BEGIN = 'Home';
const KEY_DELETE_LEFT = 'Backspace';
const KEY_DELETE_RIGHT = 'Delete';
const KEY_END = 'End';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_PAGE = 'Page';
const KEY_PAGE_DOWN = KEY_PAGE + KEY_DOWN;
const KEY_PAGE_UP = KEY_PAGE + KEY_UP;
const KEY_TAB = 'Tab';

const OPTION_SELF = 0;
const OPTION_TEXT = 1;

const TOKEN_CONTENTEDITABLE = 'contenteditable';
const TOKEN_DISABLED = 'disabled';
const TOKEN_FALSE = 'false';
const TOKEN_INVALID = EVENT_INVALID;
const TOKEN_READONLY = 'readonly';
const TOKEN_READ_ONLY = 'readOnly';
const TOKEN_REQUIRED = 'required';
const TOKEN_SELECTED = 'selected';
const TOKEN_TABINDEX = 'tabindex';
const TOKEN_TAB_INDEX = 'tabIndex';
const TOKEN_TEXT = 'text';
const TOKEN_TRUE = 'true';
const TOKEN_VALUE = 'value';
const TOKEN_VALUES = TOKEN_VALUE + 's';
const TOKEN_VISIBILITY = 'visibility';

const name = 'NumberPicker';

const [repeatStart, repeatStop] = repeat(function (picker, step) {
    let $ = this,
        {max, min, value} = picker;
    value = (+(value ?? 0)) + step;
    if (value > max || value < min) {
        return repeatStop(), focusTo($);
    }
    (picker.value = value), focusTo($);
});

function focusTo(node) {
    return node.focus(), node;
}

function onBlurTextInput() {
    let $ = this,
        picker = getReference($),
        {mask, state} = picker,
        {error} = state;
    // TODO: Validate value on blur
    if (isNumber(error) && error > 0) {
        delay(() => letAria(mask, TOKEN_INVALID))(error);
    } else {
        letAria(mask, TOKEN_INVALID);
    }
}

function onCutTextInput(e) {
    let $ = this,
        picker = getReference($);
    delay(() => picker.value = getText($))[0](1);
}

function onFocusTextInput() {
    selectTo(this);
}

function onInputTextInput(e) {
    let $ = this,
        {inputType} = e,
        picker = getReference($),
        {_active, self} = picker, v,
        value = +(v = getText($));
    if (!_active) {
        return offEventDefault(e);
    }
    let {_mask, mask, max, min, step} = picker,
        {hint} = _mask;
    if ('deleteContent' === inputType.slice(0, 13) && 0 === value) {
        letStyle(hint, TOKEN_VISIBILITY);
    } else if ('insertText' === inputType) {
        setStyle(hint, TOKEN_VISIBILITY, 'hidden');
    }
    if (!isNumber(value)) {
        picker.fire('not.number', [v]);
        return setAria(mask, TOKEN_INVALID, true), offEventDefault(e);
    }
    if (0 !== (value % step)) {
        picker.fire('not.value', [v]);
        return setAria(mask, TOKEN_INVALID, true), offEventDefault(e);
    }
    if (value > max) {
        picker.fire('max.number', [value, max]);
        return setAria(mask, TOKEN_INVALID, true), offEventDefault(e);
    }
    if (value < min) {
        picker.fire('min.number', [value, min]);
        return setAria(mask, TOKEN_INVALID, true), offEventDefault(e);
    }
    letAria(mask, TOKEN_INVALID), picker.fire('is.number', [value]);
    setValue(self, value += ""), picker.fire('change', ["" !== value ? value : null]);
}

function onInvalidSelf(e) {
    e && offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {mask} = picker;
    setAria(mask, TOKEN_INVALID, true);
    delay(() => letAria(mask, TOKEN_INVALID))[0](1000);
}

function onKeyDownTextInput(e) {
    let $ = this, exit,
        key = e.key,
        picker = getReference($),
        {_mask, self, state} = picker,
        {hint} = _mask;
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onPasteTextInput(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($);
    insertAtSelection($, e.clipboardData.getData('text/plain'));
    delay(() => (picker.value = getText($), selectTo($)))[0](1);
}

function onPointerDownMask(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_active} = picker;
    if (!_active) {
        return;
    }
    let {_mask, mask, state} = picker,
        {_step} = _mask,
        {down, up} = _step,
        {n} = state,
        {target} = e,
        targetDown = target,
        targetUp = target;
    if (down === targetDown) {
        return;
    }
    while (mask !== targetDown) {
        targetDown = getParent(targetDown);
        if (down === targetDown) {
            return;
        }
    }
    if (up === targetUp) {
        return;
    }
    while (mask !== targetUp) {
        targetUp = getParent(targetUp);
        if (up === targetUp) {
            return;
        }
    }
    focusTo(picker);
}

function onPointerDownStepDown(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (!_active) {
        return;
    }
    if (_fix) {
        return focusTo(picker);
    }
    let {_mask, max, min, step, value} = picker;
    if ((value = (+(value ?? 0)) - step) < min) {
        return (picker.value = min), focusTo($);
    }
    (picker.value = value), focusTo($);
    if (EVENT_WHEEL !== e.type) {
        repeatStart.call($, 500, 100, picker, -step);
    }
}

function onPointerDownStepUp(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (!_active) {
        return;
    }
    if (_fix) {
        return focusTo(picker);
    }
    let {_mask, max, min, step, value} = picker;
    if ((value = (+(value ?? 0)) + step) > max) {
        return (picker.value = max), focusTo($);
    }
    (picker.value = value), focusTo($);
    if (EVENT_WHEEL !== e.type) {
        repeatStart.call($, 500, 100, picker, step);
    }
}

function onPointerUpRoot() {
    repeatStop();
}

function onWheelMask(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask} = picker,
        {_step} = _mask,
        {down, up} = _step,
        {deltaY} = e;
    // Wheel up
    if (deltaY < 0) {
        onPointerDownStepUp.call(up, e);
    // Wheel down
    } else {
        onPointerDownStepDown.call(down, e);
    }
}

function NumberPicker(self, state) {
    const $ = this;
    if (!self) {
        return $;
    }
    // Return new instance if `NumberPicker` was called without the `new` operator
    if (!isInstance($, NumberPicker)) {
        return new NumberPicker(self, state);
    }
    setReference(self, hook($, NumberPicker._));
    return $.attach(self, fromStates({}, NumberPicker.state, state || {}));
}

NumberPicker.from = function (self, state) {
    return new NumberPicker(self, state);
};

NumberPicker.of = getReference;

NumberPicker.state = {
    'max': null,
    'min': null,
    'n': 'number-picker',
    'step': null,
    'time': {
        'error': 1000
    },
    'with': []
};

NumberPicker.version = '1.0.0';

setObjectAttributes(NumberPicker, {
    name: {
        value: name
    }
}, 1);

setObjectAttributes(NumberPicker, {
    active: {
        get: function () {
            return this._active;
        },
        set: function (value) {
            return $;
        }
    },
    fix: {
        get: function () {
            return this._fix;
        },
        set: function (value) {
        }
    },
    max: {
        get: function () {
            let {max} = this.state;
            return Infinity === (max = +max) || (isNumber(max) && max >= 0) ? max : Infinity;
        },
        set: function (value) {
            let $ = this;
            return ($.state.max = isNumber(value = +value) && value >= 0 ? value : Infinity), $;
        }
    },
    min: {
        get: function () {
            let {min} = this.state;
            return -Infinity === (min = +min) || (isNumber(min) && min >= 0) ? min : -Infinity;
        },
        set: function (value) {
            let $ = this;
            return ($.state.min = isNumber(value = +value) && value >= 0 ? value : -Infinity), $;
        }
    },
    step: {
        get: function () {
            let {step} = this.state;
            return isNumber(step = +step) && step > 0 ? step : 1;
        },
        set: function (value) {
            let $ = this;
            return ($.state.step = isNumber(value = +value) && value > 0 ? value : 1), $;
        }
    },
    value: {
        get: function () {
            let value = getValue(this.self);
            return "" !== value ? value : null;
        },
        set: function (value) {
            let $ = this,
                {_active} = $, v;
            if (!_active) {
                return $;
            }
            value = +(v = (value ?? "") + "");
            let {_mask, mask, max, min, self} = $,
                {hint, input} = _mask;
            setText(input, v);
            "" !== v ? setStyle(hint, TOKEN_VISIBILITY, 'hidden') : letStyle(hint, TOKEN_VISIBILITY);
            if (!isNumber(value) || value < min || value > max) {
                return setAria(mask, TOKEN_INVALID, true), $;
            }
            setValue(self, v);
            return $.fire('change', ["" !== v ? v : null]);
        }
    },
    vital: {
        get: function () {
            return this._vital;
        },
        set: function (value) {
        }
    }
});

NumberPicker._ = setObjectMethods(NumberPicker, {
    attach: function (self, state) {
        let $ = this;
        self = self || $.self;
        state = state || $.state;
        $._value = null;
        $.self = self;
        $.state = state;
        let {max, min, n, step} = state,
            isDisabledSelf = isDisabled(self),
            isReadOnlySelf = isReadOnly(self),
            isRequiredSelf = isRequired(self),
            theInputID = self.id,
            theInputMax = self.max,
            theInputMin = self.min,
            theInputName = self.name,
            theInputPlaceholder = self.placeholder || theInputMin,
            theInputStep = self.step,
            theInputValue = getValue(self);
        $._active = !isDisabledSelf && !isReadOnlySelf;
        $._fix = isReadOnlySelf;
        $._vital = isRequiredSelf;
        const stepDown = setElement('span', {
            'class': n + '__step-down',
            'tabindex': -1
        });
        const stepFlex = setElement('span', {
            'aria': {
                'hidden': TOKEN_TRUE
            },
            'class': n + '__step'
        });
        const stepUp = setElement('span', {
            'class': n + '__step-up',
            'tabindex': -1
        });
        const form = getParentForm(self);
        const mask = setElement('div', {
            'aria': {
                'disabled': isDisabledSelf ? TOKEN_TRUE : false,
                'readonly': isReadOnlySelf ? TOKEN_TRUE : false,
                'required': isRequiredSelf ? TOKEN_TRUE : false,
                'valuemax': 9999,
                'valuemin': 0,
                'valuenow': 0
            },
            'class': n,
            'role': 'spinbutton'
        });
        $.mask = mask;
        const maskFlex = setElement('div', {
            'class': n + '__flex',
            'role': 'group'
        });
        const text = setElement('span', {
            'class': n + '__text'
        });
        const textInput = setElement('span', {
            'aria': {
                'disabled': isDisabledSelf ? TOKEN_TRUE : false,
                'multiline': TOKEN_FALSE,
                'placeholder': theInputPlaceholder || '0',
                'readonly': isReadOnlySelf ? TOKEN_TRUE : false,
                'required': isRequiredSelf ? TOKEN_TRUE : false
            },
            'autocapitalize': 'off',
            'contenteditable': isDisabledSelf || isReadOnlySelf ? false : "",
            'role': 'textbox',
            'spellcheck': TOKEN_FALSE,
            'tabindex': isReadOnlySelf ? 0 : false
        });
        const textInputHint = setElement('span', theInputPlaceholder || '0', {
            'aria': {
                'hidden': TOKEN_TRUE
            }
        });
        setChildLast(mask, maskFlex);
        setChildLast(maskFlex, text);
        setChildLast(maskFlex, stepFlex);
        setChildLast(stepFlex, stepUp);
        setChildLast(stepFlex, stepDown);
        onEvent(EVENT_BLUR, textInput, onBlurTextInput);
        onEvent(EVENT_CUT, textInput, onCutTextInput);
        onEvent(EVENT_FOCUS, textInput, onFocusTextInput);
        onEvent(EVENT_INPUT, textInput, onInputTextInput);
        onEvent(EVENT_KEY_DOWN, textInput, onKeyDownTextInput);
        onEvent(EVENT_MOUSE_DOWN, stepDown, onPointerDownStepDown);
        onEvent(EVENT_MOUSE_DOWN, stepUp, onPointerDownStepUp);
        onEvent(EVENT_PASTE, textInput, onPasteTextInput);
        onEvent(EVENT_TOUCH_START, stepDown, onPointerDownStepDown);
        onEvent(EVENT_TOUCH_START, stepUp, onPointerDownStepUp);
        onEvent(EVENT_WHEEL, mask, onWheelMask);
        setChildLast(text, textInput);
        setChildLast(text, textInputHint);
        setReference(stepDown, $);
        setReference(stepUp, $);
        setReference(textInput, $);
        setClass(self, n + '__self');
        setNext(self, mask);
        setChildLast(mask, self);
        // if (form) {
        //     onEvent(EVENT_RESET, form, onResetForm);
        //     onEvent(EVENT_SUBMIT, form, onSubmitForm);
        //     setID(form);
        //     setReference(form, $);
        // }
        // onEvent(EVENT_FOCUS, self, onFocusSelf);
        // onEvent(EVENT_MOUSE_DOWN, R, onPointerDownRoot);
        onEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
        // onEvent(EVENT_MOUSE_MOVE, R, onPointerMoveRoot);
        onEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        // onEvent(EVENT_RESIZE, W, onResizeWindow, {passive: true});
        // onEvent(EVENT_SCROLL, W, onScrollWindow, {passive: true});
        onEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
        // onEvent(EVENT_TOUCH_MOVE, R, onPointerMoveRoot, {passive: true});
        // onEvent(EVENT_TOUCH_START, R, onPointerDownRoot);
        onEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
        self[TOKEN_TAB_INDEX] = -1;
        setReference(mask, $);
        $._mask = {
            _step: {
                down: stepDown,
                self: stepFlex,
                up: stepUp
            },
            flex: maskFlex,
            hint: textInputHint,
            input: textInput,
            of: self,
            self: mask,
            step: stepFlex
        };
        // Re-assign some state value(s) using the setter to either normalize or reject the initial value
        $.max = max = (theInputMax ?? max ?? Infinity);
        $.min = min = (theInputMin ?? min ?? -Infinity);
        $.step = step = (theInputStep ?? step ?? 1);
        let {_active} = $;
        // Force the `this._active` value to `true` to set the initial value
        $._active = true;
        // After the initial value has been set, restore the previous `this._active` value
        $._active = _active;
        // Force `id` attribute(s)
        setAria(mask, 'labelledby', getID(setID(text)));
        setAria(self, 'hidden', true);
        setID(mask);
        setID(maskFlex);
        setID(self);
        setID(stepDown);
        setID(stepFlex);
        setID(stepUp);
        setID(textInput);
        setID(textInputHint);
        theInputID && setDatum(mask, 'id', theInputID);
        theInputName && setDatum(mask, 'name', theInputName);
        theInputValue && ($.value = theInputValue);
        // Attach extension(s)
        if (isSet(state) && isArray(state.with)) {
            forEachArray(state.with, (v, k) => {
                if (isString(v)) {
                    v = OptionPicker[v];
                }
                // `const Extension = function (self, state = {}) {}`
                if (isFunction(v)) {
                    v.call($, self, state);
                // `const Extension = {attach: function (self, state = {}) {}, detach: function (self, state = {}) {}}`
                } else if (isObject(v) && isFunction(v.attach)) {
                    v.attach.call($, self, state);
                }
            });
        }
        return $;
    },
    blur: function () {
    },
    detach: function () {
        let $ = this,
            {_mask, mask, self, state} = $,
            {input, value} = _mask;
        const form = getParentForm(self);
        $._active = false;
        $._value = null;
        // if (form) {
        //     offEvent(EVENT_RESET, form, onResetForm);
        //     offEvent(EVENT_SUBMIT, form, onSubmitForm);
        // }
        offEvent(EVENT_BLUR, input, onBlurTextInput);
        offEvent(EVENT_FOCUS, input, onFocusTextInput);
        // offEvent(EVENT_FOCUS, self, onFocusSelf);
        offEvent(EVENT_CUT, input, onCutTextInput);
        offEvent(EVENT_KEY_DOWN, input, onKeyDownTextInput);
        offEvent(EVENT_PASTE, input, onPasteTextInput);

        // offEvent(EVENT_MOUSE_DOWN, R, onPointerDownRoot);
        offEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
        // offEvent(EVENT_MOUSE_MOVE, R, onPointerMoveRoot);
        offEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        // offEvent(EVENT_RESIZE, W, onResizeWindow);
        // offEvent(EVENT_SCROLL, W, onScrollWindow);
        offEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
        // offEvent(EVENT_TOUCH_MOVE, R, onPointerMoveRoot);
        // offEvent(EVENT_TOUCH_START, R, onPointerDownRoot);
        offEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
        offEvent(EVENT_WHEEL, mask, onWheelMask);
        // Detach extension(s)
        if (isArray(state.with)) {
            forEachArray(state.with, (v, k) => {
                if (isString(v)) {
                    v = OptionPicker[v];
                }
                if (isObject(v) && isFunction(v.detach)) {
                    v.detach.call($, self, state);
                }
            });
        }
        self[TOKEN_TAB_INDEX] = null;
        letAria(self, 'hidden');
        letClass(self, state.n + '__self');
        setNext(mask, self);
        letElement(mask);
        $._mask = {
            of: self
        };
        $.mask = null;
        return $;
    },
    focus: function (mode) {
        let $ = this,
            {_mask} = $,
            {input} = _mask;
        return focusTo(input), selectTo(input, mode), $;
    },
    reset: function (focus, mode) {
    }
});

export default NumberPicker;