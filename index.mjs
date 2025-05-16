import {/* focusTo, */insertAtSelection, selectTo, selectToNone} from '@taufik-nurrohman/selection';
import {R, W, getAria, getAttributes, getChildFirst, getChildLast, getChildren, getDatum, getElement, getElementIndex, getHTML, getID, getName, getNext, getParent, getParentForm, getPrev, getRole, getState, getStyle, getText, getValue, hasState, isDisabled, isReadOnly, isRequired, letAria, letAttribute, letClass, letDatum, letElement, letID, letStyle, setAria, setAttribute, setChildLast, setClass, setDatum, setElement, setHTML, setID, setNext, setStyle, setStyles, setText, setValue} from '@taufik-nurrohman/document';
import {debounce, delay} from '@taufik-nurrohman/tick';
import {forEachArray, forEachMap, forEachObject, forEachSet, getPrototype, getReference, getValueInMap, hasKeyInMap, letReference, letValueInMap, onAnimationsEnd, setObjectAttributes, setObjectMethods, setReference, setValueInMap, toValuesFromMap, toValueFirstFromMap} from '@taufik-nurrohman/f';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {getRect} from '@taufik-nurrohman/rect';
import {getScroll, setScroll} from '@taufik-nurrohman/rect';
import {hasValue} from '@taufik-nurrohman/has';
import {hook} from '@taufik-nurrohman/hook';
import {isArray, isBoolean, isFloat, isFunction, isInstance, isInteger, isObject, isSet, isString} from '@taufik-nurrohman/is';
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

function focusTo(node) {
    return node.focus(), node;
}

function onCutTextInput(e) {
}

function onInputTextInput(e) {
    let $ = this,
        {inputType} = e,
        picker = getReference($),
        {_active} = picker;
    if (!_active) {
        return offEventDefault(e);
    }
    let {_mask} = picker,
        {hint} = _mask;
    if ('deleteContent' === inputType.slice(0, 13) && !getText($, 0)) {
        letStyle(hint, TOKEN_VISIBILITY);
    } else if ('insertText' === inputType) {
        setStyle(hint, TOKEN_VISIBILITY, 'hidden');
    }
}

function onKeyDownTextInput(e) {
    let $ = this, exit,
        key = e.key,
        picker = getReference($),
        {_mask, self, state} = picker,
        {hint} = _mask;
    delay(() => getText($, 0) ? setStyle(hint, TOKEN_VISIBILITY, 'hidden') : letStyle(hint, TOKEN_VISIBILITY), 1)();
    exit && (offEventDefault(e), offEventPropagation(e));
}

function onPasteTextInput(e) {
}

function onPointerDownMask(e) {
    offEventDefault(e);
    let $ = this,
        picker = getReference($),
        {_mask, self} = picker,
        {target} = e;
    if (isDisabled(self) || isReadOnly(self)) {
        return;
    }
    if ('listbox' === getRole(target) || getParent(target, '[role=listbox]')) {
        return;
    }
    focusTo(picker);
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
        },
        set: function (value) {
        }
    },
    min: {
        get: function () {
        },
        set: function (value) {
        }
    },
    value: {
        get: function () {
            let value = getValue(this.self);
            return "" !== value ? value : null;
        },
        set: function (value) {
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
        let {max, min, n} = state,
            isDisabledSelf = isDisabled(self),
            isReadOnlySelf = isReadOnly(self),
            isRequiredSelf = isRequired(self),
            theInputID = self.id,
            theInputMax = self.max,
            theInputMin = self.min,
            theInputName = self.name,
            theInputPlaceholder = self.placeholder || theInputMin,
            theInputStep = self.step;
        $._active = !isDisabledSelf && !isReadOnlySelf;
        $._fix = isReadOnlySelf;
        $._vital = isRequiredSelf;
        const step = setElement('span', {
            'aria': {
                'hidden': TOKEN_TRUE
            },
            'class': n + '__step-batch'
        });
        const stepDown = setElement('span', {
            'class': n + '__step ' + n + '__step-down',
            'tabindex': -1
        });
        const stepUp = setElement('span', {
            'class': n + '__step ' + n + '__step-up',
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
        setChildLast(maskFlex, step);
        setChildLast(step, stepDown);
        setChildLast(step, stepUp);
        // onEvent(EVENT_BLUR, textInput, onBlurTextInput);
        // onEvent(EVENT_FOCUS, textInput, onFocusTextInput);
        onEvent(EVENT_CUT, textInput, onCutTextInput);
        onEvent(EVENT_INPUT, textInput, onInputTextInput);
        onEvent(EVENT_KEY_DOWN, textInput, onKeyDownTextInput);
        onEvent(EVENT_PASTE, textInput, onPasteTextInput);
        setChildLast(text, textInput);
        setChildLast(text, textInputHint);
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
        // onEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        // onEvent(EVENT_RESIZE, W, onResizeWindow, {passive: true});
        // onEvent(EVENT_SCROLL, W, onScrollWindow, {passive: true});
        // onEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
        // onEvent(EVENT_TOUCH_MOVE, R, onPointerMoveRoot, {passive: true});
        // onEvent(EVENT_TOUCH_START, R, onPointerDownRoot);
        onEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
        self[TOKEN_TAB_INDEX] = -1;
        setReference(mask, $);
        $._mask = {
            // arrow: arrow,
            flex: maskFlex,
            hint: textInputHint,
            input: textInput,
            of: self,
            self: mask
        };
        // Re-assign some state value(s) using the setter to either normalize or reject the initial value
        $.max = max = (max ?? Infinity);
        $.min = min = (min ?? -Infinity);
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
        setID(step);
        setID(stepDown);
        setID(stepUp);
        setID(textInput);
        setID(textInputHint);
        theInputID && setDatum(mask, 'id', theInputID);
        theInputName && setDatum(mask, 'name', theInputName);
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
        // offEvent(EVENT_BLUR, input, onBlurTextInput);
        // offEvent(EVENT_FOCUS, input, onFocusTextInput);
        // offEvent(EVENT_FOCUS, self, onFocusSelf);
        offEvent(EVENT_CUT, input, onCutTextInput);
        offEvent(EVENT_KEY_DOWN, input, onKeyDownTextInput);
        offEvent(EVENT_PASTE, input, onPasteTextInput);

        // offEvent(EVENT_MOUSE_DOWN, R, onPointerDownRoot);
        offEvent(EVENT_MOUSE_DOWN, mask, onPointerDownMask);
        // offEvent(EVENT_MOUSE_MOVE, R, onPointerMoveRoot);
        // offEvent(EVENT_MOUSE_UP, R, onPointerUpRoot);
        // offEvent(EVENT_RESIZE, W, onResizeWindow);
        // offEvent(EVENT_SCROLL, W, onScrollWindow);
        // offEvent(EVENT_TOUCH_END, R, onPointerUpRoot);
        // offEvent(EVENT_TOUCH_MOVE, R, onPointerMoveRoot);
        // offEvent(EVENT_TOUCH_START, R, onPointerDownRoot);
        offEvent(EVENT_TOUCH_START, mask, onPointerDownMask);
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