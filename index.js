/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2025 Taufik Nurrohman <https://github.com/taufik-nurrohman>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
(function (g, f) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f) : (g = typeof globalThis !== 'undefined' ? globalThis : g || self, g.NumberPicker = f());
})(this, (function () {
    'use strict';
    var isArray = function isArray(x) {
        return Array.isArray(x);
    };
    var isDefined = function isDefined(x) {
        return 'undefined' !== typeof x;
    };
    var isFunction = function isFunction(x) {
        return 'function' === typeof x;
    };
    var isInstance = function isInstance(x, of, exact) {
        if (!x || 'object' !== typeof x) {
            return false;
        }
        if (exact) {
            return isSet(of) && isSet(x.constructor) && of === x.constructor;
        }
        return isSet(of) && x instanceof of ;
    };
    var isNull = function isNull(x) {
        return null === x;
    };
    var isNumber = function isNumber(x) {
        return 'number' === typeof x;
    };
    var isNumeric = function isNumeric(x) {
        return /^[+-]?(?:\d*\.)?\d+$/.test(x + "");
    };
    var isObject = function isObject(x, isPlain) {
        if (isPlain === void 0) {
            isPlain = true;
        }
        if (!x || 'object' !== typeof x) {
            return false;
        }
        return isPlain ? isInstance(x, Object, 1) : true;
    };
    var isSet = function isSet(x) {
        return isDefined(x) && !isNull(x);
    };
    var isString = function isString(x) {
        return 'string' === typeof x;
    };
    var hasValue = function hasValue(x, data) {
        return -1 !== data.indexOf(x);
    };
    var _fromStates = function fromStates() {
        for (var _len = arguments.length, lot = new Array(_len), _key = 0; _key < _len; _key++) {
            lot[_key] = arguments[_key];
        }
        var out = lot.shift();
        for (var i = 0, j = toCount(lot); i < j; ++i) {
            for (var k in lot[i]) {
                // Assign value
                if (!isSet(out[k])) {
                    out[k] = lot[i][k];
                    continue;
                }
                // Merge array
                if (isArray(out[k]) && isArray(lot[i][k])) {
                    out[k] = [ /* Clone! */ ].concat(out[k]);
                    for (var ii = 0, jj = toCount(lot[i][k]); ii < jj; ++ii) {
                        if (!hasValue(lot[i][k][ii], out[k])) {
                            out[k].push(lot[i][k][ii]);
                        }
                    }
                    // Merge object recursive
                } else if (isObject(out[k]) && isObject(lot[i][k])) {
                    out[k] = _fromStates({
                        /* Clone! */ }, out[k], lot[i][k]);
                    // Replace value
                } else {
                    out[k] = lot[i][k];
                }
            }
        }
        return out;
    };
    var _fromValue = function fromValue(x) {
        if (isArray(x)) {
            return x.map(function (v) {
                return _fromValue(x);
            });
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = _fromValue(x[k]);
            }
            return x;
        }
        if (false === x) {
            return 'false';
        }
        if (null === x) {
            return 'null';
        }
        if (true === x) {
            return 'true';
        }
        return "" + x;
    };
    var toCaseCamel = function toCaseCamel(x) {
        return x.replace(/[-_.](\w)/g, function (m0, m1) {
            return toCaseUpper(m1);
        });
    };
    var toCaseLower = function toCaseLower(x) {
        return x.toLowerCase();
    };
    var toCaseUpper = function toCaseUpper(x) {
        return x.toUpperCase();
    };
    var toCount = function toCount(x) {
        return x.length;
    };
    var toJSON = function toJSON(x) {
        return JSON.stringify(x);
    };
    var toNumber = function toNumber(x, base) {
        if (base === void 0) {
            base = 10;
        }
        return base ? parseInt(x, base) : parseFloat(x);
    };
    var toString = function toString(x, base) {
        return isNumber(x) ? x.toString(base) : "" + x;
    };
    var _toValue = function toValue(x) {
        if (isArray(x)) {
            return x.map(function (v) {
                return _toValue(v);
            });
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = _toValue(x[k]);
            }
            return x;
        }
        if (isString(x) && isNumeric(x)) {
            if ('0' === x[0] && -1 === x.indexOf('.')) {
                return x;
            }
            return toNumber(x);
        }
        if ('false' === x) {
            return false;
        }
        if ('null' === x) {
            return null;
        }
        if ('true' === x) {
            return true;
        }
        return x;
    };
    var forEachArray = function forEachArray(array, at) {
        for (var i = 0, j = toCount(array), v; i < j; ++i) {
            v = at(array[i], i);
            if (-1 === v) {
                array.splice(i, 1);
                continue;
            }
            if (0 === v) {
                break;
            }
            if (1 === v) {
                continue;
            }
        }
        return array;
    };
    var forEachObject = function forEachObject(object, at) {
        var v;
        for (var k in object) {
            v = at(object[k], k);
            if (-1 === v) {
                delete object[k];
                continue;
            }
            if (0 === v) {
                break;
            }
            if (1 === v) {
                continue;
            }
        }
        return object;
    };
    var getPrototype = function getPrototype(of) {
        return of.prototype;
    };
    var getReference = function getReference(key) {
        return getValueInMap(key, references) || null;
    };
    var getValueInMap = function getValueInMap(k, map) {
        return map.get(k);
    };
    var setObjectAttributes = function setObjectAttributes(of, attributes, asStaticAttributes) {
        if (!asStaticAttributes) {
            of = getPrototype(of);
        }
        return forEachObject(attributes, function (v, k) {
            Object.defineProperty(of, k, v);
        }), of;
    };
    var setObjectMethods = function setObjectMethods(of, methods, asStaticMethods) {
        {
            of = getPrototype(of);
        }
        return forEachObject(methods, function (v, k) {
            of [k] = v;
        }), of;
    };
    var setReference = function setReference(key, value) {
        return setValueInMap(key, value, references);
    };
    var setValueInMap = function setValueInMap(k, v, map) {
        return map.set(k, v);
    };
    var references = new WeakMap();

    function _toArray(iterable) {
        return Array.from(iterable);
    }
    var D = document;
    var getAttribute = function getAttribute(node, attribute, parseValue) {
        if (parseValue === void 0) {
            parseValue = true;
        }
        if (!hasAttribute(node, attribute)) {
            return null;
        }
        var value = node.getAttribute(attribute);
        return parseValue ? _toValue(value) : value;
    };
    var getChildren = function getChildren(parent, index, anyNode) {
        var children = _toArray(parent['child' + ('Nodes')]);
        return isNumber(index) ? children[index] || null : children;
    };
    var getID = function getID(node, batch) {
        if (batch === void 0) {
            batch = 'e:';
        }
        if (hasID(node)) {
            return getAttribute(node, 'id');
        }
        if (!isSet(theID[batch])) {
            theID[batch] = 0;
        }
        return batch + toString(Date.now() + (theID[batch] += 1), 16);
    };
    var getName = function getName(node) {
        return toCaseLower(node && node.nodeName || "") || null;
    };
    var getParent = function getParent(node, query) {
        if (query) {
            return node.closest(query) || null;
        }
        return node.parentNode || null;
    };
    var getParentForm = function getParentForm(node) {
        var state = 'form';
        if (hasState(node, state) && state === getName(node[state])) {
            return node[state];
        }
        return getParent(node, state);
    };
    var getRole = function getRole(node) {
        return getAttribute(node, 'role');
    };
    var getText = function getText(node, trim) {
        var state = 'textContent';
        if (!hasState(node, state)) {
            return false;
        }
        var content = node[state];
        content = content;
        return "" !== content ? content : null;
    };
    var getType = function getType(node) {
        return node && node.nodeType || null;
    };
    var getValue = function getValue(node, parseValue) {
        var value = (node.value || "").replace(/\r?\n|\r/g, '\n');
        value = value;
        return "" !== value ? value : null;
    };
    var hasAttribute = function hasAttribute(node, attribute) {
        return node.hasAttribute(attribute);
    };
    var hasID = function hasID(node) {
        return hasAttribute(node, 'id');
    };
    var hasState = function hasState(node, state) {
        return state in node;
    };
    var isDisabled = function isDisabled(node) {
        return node.disabled;
    };
    var isReadOnly = function isReadOnly(node) {
        return node.readOnly;
    };
    var isRequired = function isRequired(node) {
        return node.required;
    };
    var letAria = function letAria(node, aria) {
        return letAttribute(node, 'aria-' + aria);
    };
    var letAttribute = function letAttribute(node, attribute) {
        return node.removeAttribute(attribute), node;
    };
    var letClass = function letClass(node, value) {
        return node.classList.remove(value), node;
    };
    var letDatum = function letDatum(node, datum) {
        return letAttribute(node, 'data-' + datum);
    };
    var letElement = function letElement(node) {
        var parent = getParent(node);
        return node.remove(), parent;
    };
    var letHTML = function letHTML(node) {
        var state = 'innerHTML';
        return hasState(node, state) && (node[state] = ""), node;
    };
    var letStyle = function letStyle(node, style) {
        return node.style[toCaseCamel(style)] = null, node;
    };
    var setAria = function setAria(node, aria, value) {
        return setAttribute(node, 'aria-' + aria, true === value ? 'true' : value);
    };
    var setArias = function setArias(node, data) {
        return forEachObject(data, function (v, k) {
            v || "" === v || 0 === v ? setAria(node, k, v) : letAria(node, k);
        }), node;
    };
    var setAttribute = function setAttribute(node, attribute, value) {
        if (true === value) {
            value = attribute;
        }
        return node.setAttribute(attribute, _fromValue(value)), node;
    };
    var setAttributes = function setAttributes(node, attributes) {
        return forEachObject(attributes, function (v, k) {
            if ('aria' === k && isObject(v)) {
                return setArias(node, v), 1;
            }
            if ('class' === k) {
                return setClasses(node, v), 1;
            }
            if ('data' === k && isObject(v)) {
                return setData(node, v), 1;
            }
            if ('style' === k && isObject(v)) {
                return setStyles(node, v), 1;
            }
            v || "" === v || 0 === v ? setAttribute(node, k, v) : letAttribute(node, k);
        }), node;
    };
    var setChildLast = function setChildLast(parent, node) {
        return parent.append(node), node;
    };
    var setClass = function setClass(node, value) {
        return node.classList.add(value), node;
    };
    var setClasses = function setClasses(node, classes) {
        if (isArray(classes)) {
            return forEachArray(classes, function (k) {
                return setClass(node, k);
            }), node;
        }
        if (isObject(classes)) {
            return forEachObject(classes, function (v, k) {
                return v ? setClass(node, k) : letClass(node, k);
            }), node;
        }
        return node.className = classes, node;
    };
    var setData = function setData(node, data) {
        return forEachObject(data, function (v, k) {
            v || "" === v || 0 === v ? setDatum(node, k, v) : letDatum(node, k);
        }), node;
    };
    var setDatum = function setDatum(node, datum, value) {
        if (isArray(value) || isObject(value)) {
            value = toJSON(value);
        }
        return setAttribute(node, 'data-' + datum, true === value ? 'true' : value);
    };
    var setElement = function setElement(node, content, attributes, options) {
        node = isString(node) ? D.createElement(node, isString(options) ? {
            is: options
        } : options) : node;
        if (isArray(content) && toCount(content)) {
            letHTML(node);
            forEachArray(content, function (v) {
                return setChildLast(isString(v) ? setElementText(v) : v);
            });
        } else if (isObject(content)) {
            attributes = content;
            content = false;
        }
        if (isString(content)) {
            setHTML(node, content);
        }
        if (isObject(attributes)) {
            return setAttributes(node, attributes), node;
        }
        return node;
    };
    var setElementText = function setElementText(text) {
        return isString(text) ? text = D.createTextNode(text) : text, text;
    };
    var setHTML = function setHTML(node, content, trim) {
        if (trim === void 0) {
            trim = true;
        }
        if (null === content) {
            return node;
        }
        var state = 'innerHTML';
        return hasState(node, state) && (node[state] = trim ? content.trim() : content), node;
    };
    var setID = function setID(node, value, batch) {
        if (batch === void 0) {
            batch = 'e:';
        }
        return setAttribute(node, 'id', isSet(value) ? value : getID(node, batch));
    };
    var setNext = function setNext(current, node) {
        return current.after(node), node;
    };
    var setStyle = function setStyle(node, style, value) {
        if (isNumber(value)) {
            value += 'px';
        }
        return node.style[toCaseCamel(style)] = _fromValue(value), node;
    };
    var setStyles = function setStyles(node, styles) {
        return forEachObject(styles, function (v, k) {
            v || "" === v || 0 === v ? setStyle(node, k, v) : letStyle(node, k);
        }), node;
    };
    var theID = {};
    var _getSelection = function _getSelection() {
        return D.getSelection();
    };
    var _setRange = function _setRange() {
        return D.createRange();
    };
    // The `node` parameter is currently not in use
    var letSelection = function letSelection(node, selection) {
        selection = selection || _getSelection();
        return selection.empty(), selection;
    };
    // <https://stackoverflow.com/a/13950376/1163000>
    var restoreSelection = function restoreSelection(node, store, selection) {
        var index = 0,
            range = _setRange();
        range.setStart(node, 0);
        range.collapse(true);
        var exit,
            hasStart,
            nodeCurrent,
            nodeStack = [node];
        while (!exit && (nodeCurrent = nodeStack.pop())) {
            if (3 === getType(nodeCurrent)) {
                var indexNext = index + toCount(nodeCurrent);
                if (!hasStart && store[0] >= index && store[0] <= indexNext) {
                    range.setStart(nodeCurrent, store[0] - index);
                    hasStart = true;
                }
                if (hasStart && store[1] >= index && store[1] <= indexNext) {
                    exit = true;
                    range.setEnd(nodeCurrent, store[1] - index);
                }
                index = indexNext;
            } else {
                forEachArray(getChildren(nodeCurrent, null), function (v) {
                    return nodeStack.push(v);
                });
            }
        }
        return setSelection(node, range, letSelection(node, selection));
    };
    var selectTo = function selectTo(node, mode, selection) {
        selection = selection || _getSelection();
        letSelection(node, selection);
        var range = _setRange();
        range.selectNodeContents(node);
        selection = setSelection(node, range, selection);
        if (1 === mode) {
            selection.collapseToEnd();
        } else if (-1 === mode) {
            selection.collapseToStart();
        } else;
    };
    // The `node` parameter is currently not in use
    var setSelection = function setSelection(node, range, selection) {
        selection = selection || _getSelection();
        if (isArray(range)) {
            return restoreSelection(node, range, selection);
        }
        return selection.addRange(range), selection;
    };
    var delay = function delay(then, time) {
        return function () {
            var _arguments2 = arguments,
                _this2 = this;
            setTimeout(function () {
                return then.apply(_this2, _arguments2);
            }, time);
        };
    };

    function hook($, $$) {
        $$ = $$ || $;
        $$.fire = function (event, data, that) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(hooks[event])) {
                return $;
            }
            return forEachArray(hooks[event], function (v) {
                v.apply(that || $, data);
            }), $;
        };
        $$.off = function (event, task) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(event)) {
                return hooks = {}, $;
            }
            if (isSet(hooks[event])) {
                if (isSet(task)) {
                    var j = toCount(hooks[event]);
                    // Clean-up empty hook(s)
                    if (0 === j) {
                        delete hooks[event];
                    } else {
                        for (var i = 0; i < j; ++i) {
                            if (task === hooks[event][i]) {
                                hooks[event].splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    delete hooks[event];
                }
            }
            return $;
        };
        $$.on = function (event, task) {
            var $ = this,
                hooks = $.hooks;
            if (!isSet(hooks[event])) {
                hooks[event] = [];
            }
            if (isSet(task)) {
                hooks[event].push(task);
            }
            return $;
        };
        return $.hooks = {}, $;
    }
    var offEvent = function offEvent(name, node, then) {
        node.removeEventListener(name, then);
    };
    var offEventDefault = function offEventDefault(e) {
        return e && e.preventDefault();
    };
    var onEvent = function onEvent(name, node, then, options) {
        if (options === void 0) {
            options = false;
        }
        node.addEventListener(name, then, options);
    };
    var EVENT_DOWN = 'down';
    var EVENT_CUT = 'cut';
    var EVENT_KEY = 'key';
    var EVENT_KEY_DOWN = EVENT_KEY + EVENT_DOWN;
    var EVENT_MOUSE = 'mouse';
    var EVENT_MOUSE_DOWN = EVENT_MOUSE + EVENT_DOWN;
    var EVENT_PASTE = 'paste';
    var EVENT_TOUCH = 'touch';
    var EVENT_TOUCH_START = EVENT_TOUCH + 'start';
    var TOKEN_FALSE = 'false';
    var TOKEN_TAB_INDEX = 'tabIndex';
    var TOKEN_TRUE = 'true';
    var TOKEN_VISIBILITY = 'visibility';
    var name = 'NumberPicker';

    function focusTo(node) {
        return node.focus(), node;
    }

    function onCutTextInput(e) {}

    function onInputTextInput(e) {
        var $ = this,
            inputType = e.inputType,
            picker = getReference($),
            _active = picker._active;
        if (!_active) {
            return offEventDefault(e);
        }
        var _mask = picker._mask,
            hint = _mask.hint;
        if ('deleteContent' === inputType.slice(0, 13) && !getText($)) {
            letStyle(hint, TOKEN_VISIBILITY);
        } else if ('insertText' === inputType) {
            setStyle(hint, TOKEN_VISIBILITY, 'hidden');
        }
    }

    function onKeyDownTextInput(e) {
        var $ = this;
        e.key;
        var picker = getReference($),
            _mask = picker._mask;
        picker.self;
        picker.state;
        var hint = _mask.hint;
        delay(function () {
            return getText($) ? setStyle(hint, TOKEN_VISIBILITY, 'hidden') : letStyle(hint, TOKEN_VISIBILITY);
        }, 1)();
    }

    function onPasteTextInput(e) {}

    function onPointerDownMask(e) {
        offEventDefault(e);
        var $ = this,
            picker = getReference($);
        picker._mask;
        var self = picker.self,
            target = e.target;
        if (isDisabled(self) || isReadOnly(self)) {
            return;
        }
        if ('listbox' === getRole(target) || getParent(target, '[role=listbox]')) {
            return;
        }
        focusTo(picker);
    }

    function NumberPicker(self, state) {
        var $ = this;
        if (!self) {
            return $;
        }
        // Return new instance if `NumberPicker` was called without the `new` operator
        if (!isInstance($, NumberPicker)) {
            return new NumberPicker(self, state);
        }
        setReference(self, hook($, NumberPicker._));
        return $.attach(self, _fromStates({}, NumberPicker.state, state || {}));
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
            get: function get() {
                return this._active;
            },
            set: function set(value) {
                return $;
            }
        },
        fix: {
            get: function get() {
                return this._fix;
            },
            set: function set(value) {}
        },
        max: {
            get: function get() {},
            set: function set(value) {}
        },
        min: {
            get: function get() {},
            set: function set(value) {}
        },
        value: {
            get: function get() {
                var value = getValue(this.self);
                return "" !== value ? value : null;
            },
            set: function set(value) {}
        },
        vital: {
            get: function get() {
                return this._vital;
            },
            set: function set(value) {}
        }
    });
    NumberPicker._ = setObjectMethods(NumberPicker, {
        attach: function attach(self, state) {
            var $ = this;
            self = self || $.self;
            state = state || $.state;
            $._value = null;
            $.self = self;
            $.state = state;
            var _state = state,
                max = _state.max,
                min = _state.min,
                n = _state.n,
                isDisabledSelf = isDisabled(self),
                isReadOnlySelf = isReadOnly(self),
                isRequiredSelf = isRequired(self),
                theInputID = self.id;
            self.max;
            var theInputMin = self.min,
                theInputName = self.name,
                theInputPlaceholder = self.placeholder || theInputMin;
            self.step;
            $._active = !isDisabledSelf && !isReadOnlySelf;
            $._fix = isReadOnlySelf;
            $._vital = isRequiredSelf;
            var step = setElement('span', {
                'aria': {
                    'hidden': TOKEN_TRUE
                },
                'class': n + '__step-batch'
            });
            var stepDown = setElement('span', {
                'class': n + '__step ' + n + '__step-down',
                'tabindex': -1
            });
            var stepUp = setElement('span', {
                'class': n + '__step ' + n + '__step-up',
                'tabindex': -1
            });
            getParentForm(self);
            var mask = setElement('div', {
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
            var maskFlex = setElement('div', {
                'class': n + '__flex',
                'role': 'group'
            });
            var text = setElement('span', {
                'class': n + '__text'
            });
            var textInput = setElement('span', {
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
            var textInputHint = setElement('span', theInputPlaceholder || '0', {
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
            $.max = max = max != null ? max : Infinity;
            $.min = min = min != null ? min : -Infinity;
            var _active = $._active;
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
                forEachArray(state.with, function (v, k) {
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
        blur: function blur() {},
        detach: function detach() {
            var $ = this,
                _mask = $._mask,
                mask = $.mask,
                self = $.self,
                state = $.state,
                input = _mask.input;
            _mask.value;
            getParentForm(self);
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
                forEachArray(state.with, function (v, k) {
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
        focus: function focus(mode) {
            var $ = this,
                _mask = $._mask,
                input = _mask.input;
            return focusTo(input), selectTo(input, mode), $;
        },
        reset: function reset(focus, mode) {}
    });
    return NumberPicker;
}));