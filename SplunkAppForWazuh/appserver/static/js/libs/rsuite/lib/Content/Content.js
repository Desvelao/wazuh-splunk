"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _setDisplayName = _interopRequireDefault(require("recompose/setDisplayName"));

var _utils = require("../utils");

var Content =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Content, _React$Component);

  function Content() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Content.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        className = _this$props.className,
        classPrefix = _this$props.classPrefix,
        props = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["className", "classPrefix"]);
    var classes = (0, _classnames.default)(classPrefix, className);
    return React.createElement("div", (0, _extends2.default)({}, props, {
      className: classes
    }));
  };

  return Content;
}(React.Component);

Content.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string
};
var EnhancedContent = (0, _utils.defaultProps)({
  classPrefix: 'content'
})(Content);

var _default = (0, _setDisplayName.default)('Content')(EnhancedContent);

exports.default = _default;
module.exports = exports.default;