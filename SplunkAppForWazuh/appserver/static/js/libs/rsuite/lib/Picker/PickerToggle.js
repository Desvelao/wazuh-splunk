"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var React = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash"));

var _Ripple = _interopRequireDefault(require("../Ripple"));

var _utils = require("../utils");

var PickerToggle =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(PickerToggle, _React$Component);

  function PickerToggle(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.toggleRef = void 0;

    _this.addPrefix = function (name) {
      return (0, _utils.prefix)(_this.props.classPrefix)(name);
    };

    _this.handleClean = function (event) {
      var onClean = _this.props.onClean;
      onClean && onClean(event);
      event.stopPropagation();

      _this.handleBlur();
    };

    _this.handleFocus = function () {
      _this.setState({
        active: true
      });
    };

    _this.handleBlur = function () {
      _this.setState({
        active: false
      });
    };

    _this.onFocus = function () {
      if (_this.toggleRef.current && typeof _this.toggleRef.current.focus === 'function') {
        _this.toggleRef.current.focus();
      }
    };

    _this.state = {
      active: false
    };
    _this.toggleRef = React.createRef();
    return _this;
  }

  var _proto = PickerToggle.prototype;

  _proto.renderToggleClean = function renderToggleClean() {
    return React.createElement("span", {
      className: this.addPrefix('clean'),
      role: "button",
      tabIndex: -1,
      onClick: this.handleClean
    }, "\u2715");
  };

  _proto.render = function render() {
    var _this$props = this.props,
        Component = _this$props.componentClass,
        children = _this$props.children,
        className = _this$props.className,
        hasValue = _this$props.hasValue,
        cleanable = _this$props.cleanable,
        classPrefix = _this$props.classPrefix,
        caret = _this$props.caret,
        active = _this$props.active,
        tabIndex = _this$props.tabIndex,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["componentClass", "children", "className", "hasValue", "cleanable", "classPrefix", "caret", "active", "tabIndex"]);
    var defaultClassName = Component === 'a' ? classPrefix : this.addPrefix('custom');
    var classes = (0, _classnames.default)(defaultClassName, className, {
      active: active || this.state.active
    });
    var unhandled = (0, _utils.getUnhandledProps)(PickerToggle, rest);
    return React.createElement(Component, (0, _extends2.default)({}, unhandled, {
      role: "combobox",
      tabIndex: tabIndex,
      className: classes,
      ref: this.toggleRef,
      onFocus: (0, _utils.createChainedFunction)(this.handleFocus, _lodash.default.get(unhandled, 'onFocus')),
      onBlur: (0, _utils.createChainedFunction)(this.handleBlur, _lodash.default.get(unhandled, 'onBlur'))
    }), React.createElement("span", {
      className: this.addPrefix(hasValue ? 'value' : 'placeholder')
    }, children), hasValue && cleanable && this.renderToggleClean(), caret && React.createElement("span", {
      className: this.addPrefix('caret')
    }), React.createElement(_Ripple.default, null));
  };

  return PickerToggle;
}(React.Component);

PickerToggle.propTypes = {
  classPrefix: _propTypes.default.string,
  hasValue: _propTypes.default.bool,
  cleanable: _propTypes.default.bool,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  caret: _propTypes.default.bool,
  componentClass: _propTypes.default.elementType,
  onClean: _propTypes.default.func,
  active: _propTypes.default.bool
};
PickerToggle.defaultProps = {
  componentClass: 'a',
  tabIndex: 0,
  caret: true
};
var enhance = (0, _utils.defaultProps)({
  classPrefix: 'picker-toggle'
});

var _default = enhance(PickerToggle);

exports.default = _default;
module.exports = exports.default;