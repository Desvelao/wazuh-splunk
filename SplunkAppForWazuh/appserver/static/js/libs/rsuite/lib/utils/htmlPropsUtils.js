"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.partitionHTMLProps = exports.htmlInputProps = exports.htmlInputEvents = exports.htmlInputAttrs = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

/**
 * Forked from Semantic-Org/Semantic-UI-React:
 * https://github.com/Semantic-Org/Semantic-UI-React/blob/master/src/lib/htmlPropsUtils.js
 */
var htmlInputAttrs = [// REACT
'selected', 'defaultValue', 'defaultChecked', // LIMITED HTML PROPS
'autoCapitalize', 'autoComplete', 'autoCorrect', 'autoFocus', 'checked', 'disabled', 'form', 'id', 'list', 'max', 'maxLength', 'min', 'minLength', 'multiple', 'name', 'pattern', 'placeholder', 'readOnly', 'required', 'step', 'type', 'value'];
exports.htmlInputAttrs = htmlInputAttrs;
var htmlInputEvents = [// EVENTS
// keyboard
'onKeyDown', 'onKeyPress', 'onKeyUp', // focus
'onFocus', 'onBlur', // form
'onChange', 'onInput', // mouse
'onClick', 'onContextMenu', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', // selection
'onSelect', // touch
'onTouchCancel', 'onTouchEnd', 'onTouchMove', 'onTouchStart'];
exports.htmlInputEvents = htmlInputEvents;
var htmlInputProps = [].concat(htmlInputAttrs, htmlInputEvents);
/**
 * Returns an array of objects consisting of: props of html input element and rest.
 * @param {object} props A ReactElement props object
 * @param {Object} [options={}]
 * @param {Array} [options.htmlProps] An array of html input props
 * @param {boolean} [options.includeAria] Includes all input props that starts with "aria-"
 * @returns {[{}, {}]} An array of objects
 */

exports.htmlInputProps = htmlInputProps;

var partitionHTMLProps = function partitionHTMLProps(props, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$htmlProps = _options.htmlProps,
      htmlProps = _options$htmlProps === void 0 ? htmlInputProps : _options$htmlProps,
      _options$includeAria = _options.includeAria,
      includeAria = _options$includeAria === void 0 ? true : _options$includeAria;
  var inputProps = {};
  var rest = {};

  _lodash.default.forEach(props, function (val, prop) {
    var possibleAria = includeAria && (/^aria-.*$/.test(prop) || prop === 'role');
    var target = _lodash.default.includes(htmlProps, prop) || possibleAria ? inputProps : rest;
    target[prop] = val;
  });

  return [inputProps, rest];
};

exports.partitionHTMLProps = partitionHTMLProps;