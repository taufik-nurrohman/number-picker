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
const TOKEN_VISIBILITY = 'visibility';

const [letError, letErrorAbort] = delay(function (picker) {
    letAria(picker.mask, TOKEN_INVALID);
});

const setError = function (picker) {
    setAria(picker.mask, TOKEN_INVALID, true);
};

const [setValuePicker] = delay(function (picker) {
    let {_mask} = picker,
        {input} = _mask;
    (picker[TOKEN_VALUE] = getText(input)) && selectTo(input);
});

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

const [repeatStart, repeatStop] = repeat(function (picker, step) {
    cycleValue(this, picker, step, repeatStop);
});

function cycleValue($, picker, step, onStop, onStep) {
    let {_active, _fix} = picker;
    if (_fix) {
        return focusTo(picker);
    }
    if (!_active) {
        return;
    }
    let {mask, max, min, state, value} = picker,
        {strict} = state;
    // Snap number to the nearest step
    value = (Math.round(+(value ?? 0) / step) * step) + step;
    if (!isNumber(value)) {
        if (strict) {
            return setError(picker), focusTo($), selectTo($);
        }
        picker[TOKEN_VALUE] = value = step < 0 ? min : max;
        setAria(mask, 'valuenow', value);
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
    if (!hasValue('.', value) && 0 !== (step % 1)) {
        value += '.' + ('0'.repeat(toCount((step + '.').split('.')[1])));
    }
    setAria(mask, 'valuenow', value);
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
    let characters = ['-', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (0 !== (step % 1)) {
        characters.push('.');
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
        {self} = picker;
    toggleHint(1, picker), delay(() => setValue(self, getText($)))[0](1);
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
        {mask, max, min, step} = picker,
        value = +getText($); // Take from the current text
    if (!isNumber(value) || 0 !== (value % step) || value > max || value < min) {
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
    if (_fix) {
        return focusTo(picker), offEventDefault(e);
    }
    if (!_active) {
        return offEventDefault(e);
    }
    let {inputType} = e,
        {_mask, max, min, self, state, step} = picker,
        {input} = _mask,
        {strict, time} = state,
        {error} = time, v,
        value = +(v = getText($)); // Take from the current text
    if ('deleteContent' === inputType.slice(0, 13) && 0 === value) {
        toggleHintByValue(picker, 0);
    } else if ('insertText' === inputType) {
        toggleHintByValue(picker, 1);
    }
    if ('-' === v || '.' === v) {
        // About to type a negative or floating-point number…
    } else if (!isNumber(value) || 0 !== (value % step) || value > max || value < min) {
        setError(picker);
        if (!isNumber(value)) {
            picker.fire('not.number', [v]);
        } else if (0 !== (value % step)) {
            picker.fire('not.step', [value]);
        } else if (value > max) {
            picker.fire('max.number', [value, max]);
        } else if (value < min) {
            picker.fire('min.number', [value, min]);
        }
        if (strict) {
            return letError(isInteger(error) && error > 0 ? error : 0, picker), setText(input, picker[TOKEN_VALUE]), focusTo(input), selectTo(input, 1);
        }
    } else {
        letError(0, picker);
        picker.fire('is.number', [value]);
    }
    setValue(self, v), picker.fire('change', ["" !== v ? v : null]);
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
    if (_fix) {
        return focusTo(picker), offEventDefault(e);
    }
    if (!_active) {
        return offEventDefault(e);
    }
    let key = e.key,
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
        focusTo(up), cycleValue(up, picker, step, strict && function () {
            picker[TOKEN_VALUE] = max;
        });
    } else if (KEY_ARROW_DOWN === key || KEY_ENTER === key || ' ' === key) {
        exit = true;
        cycleValue($, picker, -step, strict && function () {
            picker[TOKEN_VALUE] = min;
        });
    }
    exit && offEventDefault(e);
}

function onKeyDownStepUp(e) {
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (_fix) {
        return focusTo(picker), offEventDefault(e);
    }
    if (!_active) {
        return offEventDefault(e);
    }
    let key = e.key,
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
        focusTo(down), cycleValue(down, picker, -step, strict && function () {
            picker[TOKEN_VALUE] = min;
        });
    } else if (KEY_ARROW_UP === key || KEY_ENTER === key || ' ' === key) {
        exit = true;
        cycleValue($, picker, step, strict && function () {
            picker[TOKEN_VALUE] = max;
        });
    }
    exit && offEventDefault(e);
}

function onKeyDownTextInput(e) {
    let $ = this,
        picker = getReference($),
        {_active, _fix} = picker;
    if (_fix) {
        return focusTo(picker), offEventDefault(e);
    }
    if (!_active) {
        return offEventDefault(e);
    }
    let key = e.key,
        keyIsAlt = e.altKey,
        keyIsCtrl = e.ctrlKey,
        keyIsShift = e.shiftKey,
        {_mask, self, step} = picker,
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
        picker = getReference($);
    setValuePicker(1, picker), insertAtSelection($, e.clipboardData.getData('text/plain'));
}

function onPointerDownMask(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_active} = picker;
    if (!_active) {
        return;
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
    cycleValue($, picker, -step, strict && function () {
        (picker[TOKEN_VALUE] = min), focusTo($);
    });
    repeatStart.call($, repeat[0], repeat[1], picker, -step);
}

function onPointerDownStepUp(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {max, state, step} = picker,
        {strict, time} = state,
        {repeat} = time;
    cycleValue($, picker, step, strict && function () {
        (picker[TOKEN_VALUE] = max), focusTo($);
    });
    repeatStart.call($, repeat[0], repeat[1], picker, step);
}

function onPointerUpRoot() {
    repeatStop();
}

function onResetForm() {
    getReference(this).reset();
}

function onSubmitForm(e) {
    let $ = this,
        picker = getReference($),
        {max, min, self, value} = picker;
    value = +value;
    if (value < min) {
        onInvalidSelf.call(self);
        picker.fire('min.number', [value, min]), offEventDefault(e);
    } else if (value > max) {
        onInvalidSelf.call(self);
        picker.fire('max.number', [value, max]), offEventDefault(e);
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
        cycleValue(up, picker, step, strict && function () {
            (picker[TOKEN_VALUE] = max), focusTo(up);
        });
    // Wheel down
    } else {
        cycleValue(down, picker, -step, strict && function () {
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
            let $ = this,
                {_mask, mask, self} = $,
                {input} = _mask,
                v = !!value;
            $._active = !($._fix = self[TOKEN_READ_ONLY] = v);
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
            step = step ?? 1;
            return Infinity === (max = +max) || (isNumber(max) && 0 === (max % step)) ? max : Infinity;
        },
        set: function (value) {
            let $ = this,
                {state} = $,
                {step} = state;
            step = step ?? 1;
            return (state.max = isNumber(value = +value) && 0 === (value % step) ? value : Infinity), $;
        }
    },
    min: {
        get: function () {
            let {min, step} = this.state;
            step = step ?? 1;
            return -Infinity === (min = +min) || (isNumber(min) && 0 === (min % step)) ? min : -Infinity;
        },
        set: function (value) {
            let $ = this,
                {state} = $,
                {step} = state;
            step = step ?? 1;
            return (state.min = isNumber(value = +value) && 0 === (value % step) ? value : -Infinity), $;
        }
    },
    step: {
        get: function () {
            let {step} = this.state;
            return isNumber(step = +step) && step > 0 ? step : 1;
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
                {_active} = $;
            if (!_active) {
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
            value = +(v = (value ?? "") + "");
            let {_mask, max, min, self, state, step} = $,
                {input} = _mask,
                {strict, time} = state,
                {error} = time;
            setText(input, v), toggleHintByValue($, v);
            if (!isNumber(value) || 0 !== (value % step) || value > max || value < min) {
                setError($);
                if (!isNumber(value)) {
                    $.fire('not.number', [v]);
                } else if (0 !== (value % step)) {
                    $.fire('not.step', [v]);
                } else if (value > max) {
                    $.fire('max.number', [value, max]);
                } else if (value < min) {
                    $.fire('min.number', [value, min]);
                }
                if (strict) {
                    return letError(isInteger(error) && error > 0 ? error : 0, picker), setText(input, $[TOKEN_VALUE]), $;
                }
            } else {
                letError(0, $);
                $.fire('is.number', [value]);
            }
            return setValue(self, v), $.fire('change', ["" !== v ? v : null]);
        }
    },
    vital: {
        get: function () {
            return this._vital;
        },
        set: function (value) {
            let $ = this,
                {_mask, mask, self} = $,
                {input} = _mask,
                v = !!value;
            self[TOKEN_REQUIRED] = v;
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
                'valuemax': theInputMax ? theInputMax : false,
                'valuemin': theInputMin ? theInputMin : false,
                'valuenow': theInputValue ? theInputValue : false
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
        onEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        onEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
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
        $.max = max = "" !== theInputMax ? theInputMax : (max ?? Infinity);
        $.min = min = "" !== theInputMin ? theInputMin : (min ?? -Infinity);
        $.step = step = "" !== theInputStep ? theInputStep : (step ?? 1);
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
        theInputValue && ($[TOKEN_VALUE] = $['_' + TOKEN_VALUE] = theInputValue);
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
        offEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        offEvent(EVENT_PASTE, input, onPasteTextInput);
        offEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
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
            {_active, _fix} = $;
        if (!_active && !_fix) {
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