import {/* focusTo, */insertAtSelection, selectTo, selectToNone} from '@taufik-nurrohman/selection';
import {R, getElement, getID, getParent, getParentForm, getText, getValue, isDisabled, isReadOnly, isRequired, letAria, letAttribute, letClass, letElement, letStyle, setAria, setAttribute, setChildLast, setClass, setDatum, setElement, setID, setNext, setStyle, setText, setValue} from '@taufik-nurrohman/document';
import {delay, repeat} from '@taufik-nurrohman/tick';
import {forEachArray, getReference, setObjectAttributes, setObjectMethods, setReference} from '@taufik-nurrohman/f';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isBoolean, isFunction, isInstance, isInteger, isNumber, isObject, isSet, isString} from '@taufik-nurrohman/is';
import {offEvent, offEventDefault, onEvent} from '@taufik-nurrohman/event';
import {toCount} from '@taufik-nurrohman/to';

const {floor: mathFloor, max: mathMax, min: mathMin, round: mathRound} = Math;
const {isFinite} = Number;

const EVENT_DOWN = 'down';
const EVENT_UP = 'up';

const EVENT_BLUR = 'blur';
const EVENT_CUT = 'cut';
const EVENT_FOCUS = 'focus';
const EVENT_INPUT = 'input';
const EVENT_INPUT_START = 'before' + EVENT_INPUT;
const EVENT_INVALID = 'invalid';
const EVENT_KEY = 'key';
const EVENT_KEY_DOWN = EVENT_KEY + EVENT_DOWN;
const EVENT_MOUSE = 'mouse';
const EVENT_MOUSE_DOWN = EVENT_MOUSE + EVENT_DOWN;
const EVENT_MOUSE_UP = EVENT_MOUSE + EVENT_UP;
const EVENT_PASTE = 'paste';
const EVENT_RESET = 'reset';
const EVENT_SUBMIT = 'submit';
const EVENT_TOUCH = 'touch';
const EVENT_TOUCH_END = EVENT_TOUCH + 'end';
const EVENT_TOUCH_START = EVENT_TOUCH + 'start';
const EVENT_WHEEL = 'wheel';

const KEY_DOWN = 'Down';
const KEY_LEFT = 'Left';
const KEY_UP = 'Up';

const KEY_A = 'a';
const KEY_ARROW = 'Arrow';
const KEY_ARROW_DOWN = KEY_ARROW + KEY_DOWN;
const KEY_ARROW_LEFT = KEY_ARROW + KEY_LEFT;
const KEY_ARROW_UP = KEY_ARROW + KEY_UP;
const KEY_ENTER = 'Enter';
const KEY_PAGE = 'Page';
const KEY_PAGE_DOWN = KEY_PAGE + KEY_DOWN;
const KEY_PAGE_UP = KEY_PAGE + KEY_UP;
const KEY_TAB = 'Tab';

const TOKEN_CONTENTEDITABLE = 'contenteditable';
const TOKEN_DISABLED = 'disabled';
const TOKEN_FALSE = 'false';
const TOKEN_INVALID = EVENT_INVALID;
const TOKEN_READONLY = 'readonly';
const TOKEN_READ_ONLY = 'readOnly';
const TOKEN_REQUIRED = 'required';
const TOKEN_TABINDEX = 'tabindex';
const TOKEN_TAB_INDEX = 'tabIndex';
const TOKEN_TRUE = 'true';
const TOKEN_VALUE = 'value';
const TOKEN_VALUENOW = TOKEN_VALUE + 'now';
const TOKEN_VISIBILITY = 'visibility';

const [letError, letErrorAbort] = delay(function (picker) {
    letAria(picker.mask, TOKEN_INVALID);
});

const setError = function (picker) {
    let {mask, state} = picker,
        {time} = state,
        {error} = time;
    if (isInteger(error) && error > 0) {
        setAria(mask, TOKEN_INVALID, true);
    }
};

const [toggleHint] = delay(function (picker) {
    let {_mask} = picker,
        {input} = _mask;
    toggleHintByValue(picker, getText(input, 0));
});

const toggleHintByValue = function (picker, value) {
    let {_mask} = picker,
        {hint} = _mask;
    value ? setStyle(hint, TOKEN_VISIBILITY, 'hidden') : letStyle(hint, TOKEN_VISIBILITY);
};

const name = 'NumberPicker';

const [repeatStart, repeatStop] = repeat(function ($, picker, step) {
    cycleValue($, picker, step, repeatStop);
});

function checkValue(picker) {
    let {_mask, max, min, step} = picker,
        {input} = _mask, v,
        value = +(v = getText(input)); // Get from the current input
    if (!isNumber(value)) {
        return picker.fire('not.number', [v]), 0;
    }
    if (0 !== (value % step)) {
        return picker.fire('not.step', [value, step]), 0;
    }
    if (value < min) {
        return picker.fire('min.number', [value, min]), 0;
    }
    if (value > max) {
        return picker.fire('max.number', [value, max]), 0;
    }
    return picker.fire('is.number', [value]), 1;
}

function cycleValue($, picker, step, onStop, onStep) {
    let {_active, _fix} = picker;
    if (!_active || _fix) {
        return _fix && focusTo(picker);
    }
    let {mask, max, min, state, value} = picker,
        {strict} = state;
    // Snap number to the nearest multiple of `step`
    value = (mathRound(+(value ?? 0) / step) * step) + step;
    if (!isNumber(value)) {
        picker[TOKEN_VALUE] = value = step < 0 ? min : max;
        setAria(mask, TOKEN_VALUENOW, value);
    }
    if (value > max || value < min) {
        if (strict) {
            return focusTo($), selectTo($), (onStop && onStop(picker));
        }
        setError(picker);
    } else {
        letError(0, picker);
    }
    value += "";
    // Ensure decimal part in number
    if (0 !== (step % 1)) {
        let b = step + "",
            c = hasValue('.', b) ? toCount(b.split('.')[1]) : 0,
            d = 0 === c ? '0' : '0'.repeat(c);
        if (hasValue('.', value)) {
            value = value.split('.');
            value = value[0] + '.' + value[1].padEnd(c, d);
        } else {
            value += '.' + d;
        }
    }
    setAria(mask, TOKEN_VALUENOW, value);
    (picker[TOKEN_VALUE] = value), focusTo($), selectTo($), (onStep && onStep(picker));
}

function focusTo(node) {
    return node.focus(), node;
}

function onBeforeInputTextInput(e) {
    let $ = this,
        picker = getReference($),
        {step} = picker,
        {data, inputType} = e;
    let characters = '-0123456789';
    if (0 !== (step % 1)) {
        characters += '.';
    }
    if ('insertText' === inputType && !hasValue(data, characters)) {
        offEventDefault(e);
    }
}

function onBlurStepDown() {
    let $ = this,
        picker = getReference($),
        {state} = picker,
        {time} = state,
        {error} = time;
    letError(isInteger(error) && error > 0 ? error : 0, picker);
}

function onBlurStepUp() {
    onBlurStepDown.call(this);
}

function onBlurTextInput() {
    let $ = this,
        picker = getReference($),
        {mask} = picker;
    onBlurStepDown.call($);
    onEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
    onEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
}

function onCutTextInput(e) {
    let $ = this,
        picker = getReference($),
        {mask, self} = picker, v;
    toggleHint(1, picker), delay(() => {
        setValue(self, v = getText($));
        if (v && '-' !== v && '.' !== v) {
            setAria(mask, TOKEN_VALUENOW, v);
        } else {
            letAria(mask, TOKEN_VALUENOW);
        }
    })[0](1);
}

// Focus on the “visually hidden” self will move its focus to the mask, maintains the natural flow of the tab(s)!
function onFocusSelf() {
    focusTo(getReference(this));
}

function onFocusStepDown() {
    letErrorAbort();
}

function onFocusStepUp() {
    onFocusStepDown();
}

function onFocusTextInput() {
    letErrorAbort();
    let $ = this,
        picker = getReference($),
        {mask} = picker;
    if (!checkValue(picker)) {
        setError(picker);
    }
    offEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
    offEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
    selectTo($);
}

function onInputTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (!_active || _fix) {
        return (_fix && focusTo(picker)), offEventDefault(e);
    }
    let {inputType} = e,
        {mask, self} = picker, v,
        value = +(v = getText($)); // Take from the current text
    if ('deleteContent' === inputType.slice(0, 13) && 0 === value) {
        toggleHintByValue(picker, 0);
    } else if ('insertText' === inputType) {
        toggleHintByValue(picker, 1);
    }
    if ('-' === v || '.' === v) {
        // About to type a negative or floating-point number…
    } else if (!checkValue(picker)) {
        setError(picker);
    } else {
        letError(0, picker);
    }
    if (v && '-' !== v && '.' !== v) {
        setAria(mask, TOKEN_VALUENOW, v);
    } else {
        letAria(mask, TOKEN_VALUENOW);
    }
    setValue(self, null !== v ? v : ""), picker.fire('change', [v]);
}

function onInvalidSelf(e) {
    e && offEventDefault(e);
    let $ = this;
    onBlurTextInput.call($), setError(getReference($));
}

function onKeyDownStepDown(e) {
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (!_active || _fix) {
        return (_fix && focusTo(picker)), offEventDefault(e);
    }
    let key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        {_mask, max, min, state, step} = picker,
        {_step} = _mask,
        {up} = _step,
        {strict} = state, exit;
    if (KEY_ARROW_LEFT === key || keyIsCtrl && KEY_A === key) {
        exit = true;
        focusTo(picker);
    } else if (KEY_ARROW_UP === key) {
        exit = true;
        focusTo(up), cycleValue(up, picker, step, strict && function (picker) {
            picker[TOKEN_VALUE] = max;
        });
    } else if (KEY_ARROW_DOWN === key || KEY_ENTER === key || ' ' === key) {
        exit = true;
        cycleValue($, picker, -step, strict && function (picker) {
            picker[TOKEN_VALUE] = min;
        });
    } else if (KEY_TAB === key) {
    } else {
        if (!keyIsAlt && !keyIsCtrl) {
            focusTo(picker);
        }
    }
    exit && offEventDefault(e);
}

function onKeyDownStepUp(e) {
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (!_active || _fix) {
        return (_fix && focusTo(picker)), offEventDefault(e);
    }
    let key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        {_mask, max, min, state, step} = picker,
        {_step} = _mask,
        {down} = _step,
        {strict} = state, exit;
    if (KEY_ARROW_LEFT === key || keyIsCtrl && KEY_A === key) {
        exit = true;
        focusTo(picker);
    } else if (KEY_ARROW_DOWN === key) {
        exit = true;
        focusTo(down), cycleValue(down, picker, -step, strict && function (picker) {
            picker[TOKEN_VALUE] = min;
        });
    } else if (KEY_ARROW_UP === key || KEY_ENTER === key || ' ' === key) {
        exit = true;
        cycleValue($, picker, step, strict && function (picker) {
            picker[TOKEN_VALUE] = max;
        });
    } else if (KEY_TAB === key) {
    } else {
        if (!keyIsAlt && !keyIsCtrl) {
            focusTo(picker);
        }
    }
    exit && offEventDefault(e);
}

function onKeyDownTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (!_active || _fix) {
        return _fix && focusTo(picker);
    }
    let key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        keyIsShift = e.shiftKey,
        {_mask, self} = picker,
        {_step} = _mask,
        {down, up} = _step, exit, form, submit;
    if (keyIsAlt) {} else if (keyIsCtrl) {} else if (keyIsShift) {
        if (KEY_TAB === key) {
            selectToNone();
        }
    } else if (KEY_ARROW_DOWN === key || KEY_PAGE_DOWN === key) {
        exit = true;
        selectToNone(), focusTo(down), onKeyDownStepDown.call(down, e);
    } else if (KEY_ARROW_UP === key || KEY_PAGE_UP === key) {
        exit = true;
        selectToNone(), focusTo(up), onKeyDownStepUp.call(up, e);
    } else if (KEY_ENTER === key) {
        exit = true;
        if ((form = getParentForm(self)) && isFunction(form.requestSubmit)) {
            // <https://developer.mozilla.org/en-US/docs/Glossary/Submit_button>
            submit = getElement('button:not([type]),button[type=submit],input[type=image],input[type=submit]', form);
            submit ? form.requestSubmit(submit) : form.requestSubmit();
        }
    } else if (KEY_TAB === key) {
        selectToNone();
    }
    exit && offEventDefault(e);
}

function onPasteTextInput(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {mask, state} = picker,
        {time} = state,
        {error} = time,
        v = getText($), vv, wasError;
    insertAtSelection($, e.clipboardData.getData('text/plain'));
    if (!isNumber(+(vv = getText($)))) {
        wasError = true;
        setText($, null !== v ? v : ""); // Restore previous text
    }
    picker[TOKEN_VALUE] = v = getText($);
    if (v) {
        setAria(mask, TOKEN_VALUENOW, v);
    } else {
        letAria(mask, TOKEN_VALUENOW);
    }
    focusTo($), selectTo($);
    if (wasError) {
        letErrorAbort(), setError(picker), letError(isInteger(error) && error > 0 ? error : 0, picker);
        picker.fire('not.number', [vv]);
    }
}

function onPointerDownMask(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (!_active || _fix) {
        return _fix && focusTo(picker);
    }
    let {_mask, mask} = picker,
        {_step} = _mask,
        {down, up} = _step,
        {target} = e,
        targetDown = target,
        targetUp = target;
    if (down === targetDown || up === targetUp) {
        return;
    }
    while (mask !== targetDown) {
        targetDown = getParent(targetDown);
        if (down === targetDown) {
            return;
        }
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
        {min, state, step} = picker,
        {strict, time} = state,
        {repeat} = time;
    cycleValue($, picker, -step, strict && function (picker) {
        (picker[TOKEN_VALUE] = min), focusTo($);
    });
    repeatStart(repeat[0], repeat[1], $, picker, -step);
    onEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
    onEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
}

function onPointerDownStepUp(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {max, state, step} = picker,
        {strict, time} = state,
        {repeat} = time;
    cycleValue($, picker, step, strict && function (picker) {
        (picker[TOKEN_VALUE] = max), focusTo($);
    });
    repeatStart(repeat[0], repeat[1], $, picker, step);
    onEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
    onEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
}

function onPointerUpRoot() {
    let $ = this;
    offEvent(EVENT_MOUSE_UP, $, onPointerUpRoot);
    offEvent(EVENT_TOUCH_END, $, onPointerUpRoot);
    repeatStop();
}

function onResetForm() {
    getReference(this).reset();
}

function onSubmitForm(e) {
    let $ = this,
        picker = getReference($),
        {self} = picker;
    if (!checkValue(picker)) {
        onInvalidSelf.call(self), offEventDefault(e);
    }
}

function onWheelMask(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask, max, min, state, step} = picker,
        {_step} = _mask,
        {down, up} = _step,
        {strict} = state,
        {deltaY} = e;
    // Wheel up
    if (deltaY < 0) {
        cycleValue(up, picker, step, strict && function (picker) {
            (picker[TOKEN_VALUE] = max), focusTo(up);
        });
    // Wheel down
    } else {
        cycleValue(down, picker, -step, strict && function (picker) {
            (picker[TOKEN_VALUE] = min), focusTo(down);
        });
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
    return $.attach(self, fromStates({}, NumberPicker.state, isBoolean(state) ? {
        strict: state
    } : (state || {})));
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
    'strict': false,
    'time': {
        'error': 1000,
        'repeat': [500, 50]
    },
    'with': []
};

NumberPicker.version = '%(version)';

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
            selectToNone();
            let $ = this,
                {_mask, mask, self} = $,
                {input} = _mask,
                v = !!value;
            self[TOKEN_DISABLED] = !($._active = v);
            if (v) {
                letAria(input, TOKEN_DISABLED);
                letAria(mask, TOKEN_DISABLED);
                setAttribute(input, TOKEN_CONTENTEDITABLE, "");
            } else {
                letAttribute(input, TOKEN_CONTENTEDITABLE);
                setAria(input, TOKEN_DISABLED, true);
                setAria(mask, TOKEN_DISABLED, true);
            }
            return $;
        }
    },
    fix: {
        get: function () {
            return this._fix;
        },
        set: function (value) {
            selectToNone();
            let $ = this,
                {_mask, mask, self} = $,
                {input} = _mask,
                v = !!value;
            self[TOKEN_READ_ONLY] = $._fix = v;
            if (v) {
                letAttribute(input, TOKEN_CONTENTEDITABLE);
                setAria(input, TOKEN_READONLY, true);
                setAria(mask, TOKEN_READONLY, true);
                setAttribute(input, TOKEN_TABINDEX, 0);
            } else {
                letAria(input, TOKEN_READONLY);
                letAria(mask, TOKEN_READONLY);
                letAttribute(input, TOKEN_TABINDEX);
                setAttribute(input, TOKEN_CONTENTEDITABLE, "");
            }
            return $;
        }
    },
    max: {
        get: function () {
            let {max, step} = this.state;
            return !isFinite(max) && max > 0 || (isNumber(max) && 0 === (max % step)) ? max : Infinity;
        },
        set: function (value) {
            let $ = this,
                {state} = $,
                {step} = state;
            return (state.max = isNumber(value = +value) && 0 === (value % step) ? value : Infinity), $;
        }
    },
    min: {
        get: function () {
            let {min, step} = this.state;
            return !isFinite(min) && min < 0 || (isNumber(min) && 0 === (min % step)) ? min : -Infinity;
        },
        set: function (value) {
            let $ = this,
                {state} = $,
                {step} = state;
            return (state.min = isNumber(value = +value) && 0 === (value % step) ? value : -Infinity), $;
        }
    },
    step: {
        get: function () {
            let {step} = this.state;
            return isNumber(step) && step > 0 ? step : 1;
        },
        set: function (value) {
            let $ = this,
                {state} = $;
            return (state.step = isNumber(value = +value) && value > 0 ? value : 1), $;
        }
    },
    text: {
        get: function () {
            return getText(this._mask.input);
        },
        set: function (value) {
            let $ = this,
                {_active, _fix} = $;
            if (!_active || _fix) {
                return $;
            }
            let {_mask} = $,
                {input} = _mask, v;
            return setText(input, v = fromValue(value)), toggleHintByValue($, v), $;
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
            value = +(v = fromValue(value ?? ""));
            let {_mask, self, state} = $,
                {input} = _mask,
                {strict} = state;
            setText(input, v), toggleHintByValue($, v);
            if (!checkValue($)) {
                if (strict) {
                    return setText(input, $[TOKEN_VALUE]), $;
                }
                setError($);
            } else {
                letError(0, $);
            }
            return setValue(self, v), $.fire('change', ["" !== v ? v : null]);
        }
    },
    vital: {
        get: function () {
            return this._vital;
        },
        set: function (value) {
            selectToNone();
            let $ = this,
                {_mask, mask, self} = $,
                {input} = _mask,
                v = !!value;
            self[TOKEN_REQUIRED] = $._vital = v;
            if (v) {
                setAria(input, TOKEN_REQUIRED, true);
                setAria(mask, TOKEN_REQUIRED, true);
            } else {
                letAria(input, TOKEN_REQUIRED);
                letAria(mask, TOKEN_REQUIRED);
            }
            return $;
        }
    }
});

NumberPicker._ = setObjectMethods(NumberPicker, {
    attach: function (self, state) {
        let $ = this;
        self = self || $.self;
        state = state || $.state;
        $.self = self;
        $.state = state;
        let {max, min, n, step} = state, value,
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
        $._active = !isDisabledSelf;
        $._fix = isReadOnlySelf;
        $._vital = isRequiredSelf;
        $['_' + TOKEN_VALUE] = theInputValue;
        if (!isSet(max) || !isNumber(max)) {
            if (!theInputMax || !isNumber(max = +theInputMax)) {
                max = Infinity;
            }
        }
        if (!isSet(min) || !isNumber(min)) {
            if (!theInputMin || !isNumber(min = +theInputMin)) {
                min = -Infinity;
            }
        }
        if (!isSet(step) || !isNumber(step)) {
            if (!theInputStep || !isNumber(step = +theInputStep) || step < 0) {
                step = 1;
            }
        }
        if (!theInputValue || !isNumber(value = +theInputValue)) {
            value = null;
        }
        // Snap `max` and `min` to the nearest multiple of `step`
        max = mathRound(max / step) * step;
        min = mathRound(min / step) * step;
        if (isFinite(max) && isFinite(min)) {
            // Adjust `max` so that `max - min` is a multiple of `step`
            max = min + (mathFloor((max - min) / step) * step);
            // Snap `value` to the nearest multiple of `step`
            if (null !== value) {
                // Clamp between `min` and `max`
                value = mathMax(min, mathMin(max, value));
                // Subtract `min` to make snapping relative to start
                value = min + mathRound((value - min) / step) * step;
                // Clamp between `min` and `max` again, in case rounding pushes out of bound(s)
                value = mathMax(min, mathMin(max, value));
            }
        }
        if (isFinite(state.max = max)) {
            self.max = max;
        } else {
            letAttribute(self, 'max');
        }
        if (isFinite(state.min = min)) {
            self.min = min;
        } else {
            letAttribute(self, 'min');
        }
        if (isFinite(state.step = step) && step > 0) {
            self.step = step;
        } else {
            letAttribute(self, 'step');
        }
        setValue(self, value);
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
                'valuemax': Infinity !== max ? max : false,
                'valuemin': -Infinity !== min ? min : false,
                'valuenow': null !== value ? value : false
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
        const textInput = setElement('span', value = fromValue(value ?? ""), {
            'aria': {
                'disabled': isDisabledSelf ? TOKEN_TRUE : false,
                'multiline': TOKEN_FALSE,
                'placeholder': theInputPlaceholder || '0',
                'readonly': isReadOnlySelf ? TOKEN_TRUE : false,
                'required': isRequiredSelf ? TOKEN_TRUE : false
            },
            'autocapitalize': 'off',
            'contenteditable': isDisabledSelf || isReadOnlySelf ? false : "",
            'inputmode': isInteger(step) ? 'numeric': 'decimal',
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
        onEvent(EVENT_BLUR, stepDown, onBlurStepDown);
        onEvent(EVENT_INPUT_START, textInput, onBeforeInputTextInput);
        onEvent(EVENT_BLUR, stepUp, onBlurStepUp);
        onEvent(EVENT_BLUR, textInput, onBlurTextInput);
        onEvent(EVENT_CUT, textInput, onCutTextInput);
        onEvent(EVENT_FOCUS, stepDown, onFocusStepDown);
        onEvent(EVENT_FOCUS, stepUp, onFocusStepUp);
        onEvent(EVENT_FOCUS, textInput, onFocusTextInput);
        onEvent(EVENT_INPUT, textInput, onInputTextInput);
        onEvent(EVENT_KEY_DOWN, stepDown, onKeyDownStepDown);
        onEvent(EVENT_KEY_DOWN, stepUp, onKeyDownStepUp);
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
        if (form) {
            onEvent(EVENT_RESET, form, onResetForm);
            onEvent(EVENT_SUBMIT, form, onSubmitForm);
            setID(form);
            setReference(form, $);
        }
        onEvent(EVENT_FOCUS, self, onFocusSelf);
        onEvent(EVENT_INVALID, self, onInvalidSelf);
        onEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
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
        toggleHintByValue($, value);
        // Attach extension(s)
        if (isSet(state) && isArray(state.with)) {
            forEachArray(state.with, (v, k) => {
                if (isString(v)) {
                    v = NumberPicker[v];
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
        selectToNone();
        let $ = this,
            {_mask, _step} = $,
            {input} = _mask,
            {down, up} = _step;
        return down.blur(), input.blur(), up.blur(), $;
    },
    detach: function () {
        let $ = this,
            {_mask, mask, self, state} = $,
            {_step, input} = _mask,
            {down, up} = _step;
        const form = getParentForm(self);
        $._active = false;
        $._value = null;
        if (form) {
            offEvent(EVENT_RESET, form, onResetForm);
            offEvent(EVENT_SUBMIT, form, onSubmitForm);
        }
        offEvent(EVENT_BLUR, down, onBlurStepDown);
        offEvent(EVENT_BLUR, input, onBlurTextInput);
        offEvent(EVENT_BLUR, up, onBlurStepUp);
        offEvent(EVENT_CUT, input, onCutTextInput);
        offEvent(EVENT_FOCUS, down, onFocusStepDown);
        offEvent(EVENT_FOCUS, input, onFocusTextInput);
        offEvent(EVENT_FOCUS, self, onFocusSelf);
        offEvent(EVENT_FOCUS, up, onFocusStepUp);
        offEvent(EVENT_INPUT_START, input, onBeforeInputTextInput);
        offEvent(EVENT_INVALID, self, onInvalidSelf);
        offEvent(EVENT_KEY_DOWN, down, onKeyDownStepDown);
        offEvent(EVENT_KEY_DOWN, input, onKeyDownTextInput);
        offEvent(EVENT_KEY_DOWN, up, onKeyDownStepUp);
        offEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
        offEvent(EVENT_PASTE, input, onPasteTextInput);
        offEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
        offEvent(EVENT_WHEEL, mask, onWheelMask);
        // Detach extension(s)
        if (isArray(state.with)) {
            forEachArray(state.with, (v, k) => {
                if (isString(v)) {
                    v = NumberPicker[v];
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
            {_active} = $;
        if (!_active) {
            return $;
        }
        let {_mask} = $,
            {input} = _mask;
        return focusTo(input), selectTo(input, mode), $;
    },
    reset: function (focus, mode) {
        let $ = this,
            {_active} = $;
        if (!_active) {
            return $;
        }
        $[TOKEN_VALUE] = $['_' + TOKEN_VALUE];
        return focus ? $.focus(mode) : $;
    }
});

export default NumberPicker;