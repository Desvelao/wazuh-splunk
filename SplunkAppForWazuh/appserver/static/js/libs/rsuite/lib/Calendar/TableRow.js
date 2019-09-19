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

var _lodash = _interopRequireDefault(require("lodash"));

var _classnames = _interopRequireDefault(require("classnames"));

var _dateFns = require("date-fns");

var _utils = require("../utils");

var _IntlContext = _interopRequireDefault(require("../IntlProvider/IntlContext"));

var TableRow =
/*#__PURE__*/
function (_React$PureComponent) {
  (0, _inheritsLoose2.default)(TableRow, _React$PureComponent);

  function TableRow() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$PureComponent.call.apply(_React$PureComponent, [this].concat(args)) || this;

    _this.addPrefix = function (name) {
      return (0, _utils.prefix)(_this.props.classPrefix)(name);
    };

    _this.handleSelect = function (date, disabled, event) {
      var onSelect = _this.props.onSelect;

      if (disabled) {
        return;
      }

      onSelect && onSelect(date, event);
    };

    return _this;
  }

  var _proto = TableRow.prototype;

  _proto.renderDays = function renderDays() {
    var _this2 = this;

    var _this$props = this.props,
        weekendDate = _this$props.weekendDate,
        disabledDate = _this$props.disabledDate,
        inSameMonth = _this$props.inSameMonth,
        selected = _this$props.selected,
        renderCell = _this$props.renderCell;
    var days = [];

    var _loop = function _loop(i) {
      var _classNames;

      var thisDate = (0, _dateFns.addDays)(weekendDate, i);
      var disabled = disabledDate && disabledDate(thisDate);
      var isToday = (0, _dateFns.isSameDay)(thisDate, new Date());
      var classes = (0, _classnames.default)(_this2.addPrefix('cell'), (_classNames = {}, _classNames[_this2.addPrefix('cell-un-same-month')] = !(inSameMonth && inSameMonth(thisDate)), _classNames[_this2.addPrefix('cell-is-today')] = isToday, _classNames[_this2.addPrefix('cell-selected')] = (0, _dateFns.isSameDay)(thisDate, selected), _classNames[_this2.addPrefix('cell-disabled')] = disabled, _classNames));
      var title = (0, _dateFns.format)(thisDate, 'YYYY-MM-DD');
      days.push(React.createElement(_IntlContext.default.Consumer, {
        key: title
      }, function (context) {
        return React.createElement("div", {
          className: classes,
          role: "menu",
          tabIndex: -1,
          title: isToday ? title + " (" + _lodash.default.get(context, 'today') + ")" : title,
          onClick: _this2.handleSelect.bind(_this2, thisDate, disabled)
        }, React.createElement("div", {
          className: _this2.addPrefix('cell-content')
        }, React.createElement("span", {
          className: _this2.addPrefix('cell-day')
        }, (0, _dateFns.getDate)(thisDate)), renderCell && renderCell(thisDate)));
      }));
    };

    for (var i = 0; i < 7; i += 1) {
      _loop(i);
    }

    return days;
  };

  _proto.renderWeekNumber = function renderWeekNumber() {
    return React.createElement("div", {
      className: this.addPrefix('cell-week-number')
    }, (0, _dateFns.format)(this.props.weekendDate, 'W'));
  };

  _proto.render = function render() {
    var _this$props2 = this.props,
        className = _this$props2.className,
        showWeekNumbers = _this$props2.showWeekNumbers,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props2, ["className", "showWeekNumbers"]);
    var classes = (0, _classnames.default)(this.addPrefix('row'), className);
    var unhandled = (0, _utils.getUnhandledProps)(TableRow, rest);
    return React.createElement("div", (0, _extends2.default)({}, unhandled, {
      className: classes
    }), showWeekNumbers && this.renderWeekNumber(), this.renderDays());
  };

  return TableRow;
}(React.PureComponent);

TableRow.propTypes = {
  weekendDate: _propTypes.default.instanceOf(Date),
  selected: _propTypes.default.instanceOf(Date),
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  onSelect: _propTypes.default.func,
  disabledDate: _propTypes.default.func,
  inSameMonth: _propTypes.default.func,
  renderCell: _propTypes.default.func
};
TableRow.defaultProps = {
  selected: new Date(),
  weekendDate: new Date()
};
var enhance = (0, _utils.defaultProps)({
  classPrefix: 'calendar-table'
});

var _default = enhance(TableRow);

exports.default = _default;
module.exports = exports.default;