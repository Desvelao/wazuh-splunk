"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _compose = _interopRequireDefault(require("recompose/compose"));

var _lodash = _interopRequireDefault(require("lodash"));

var _utils = require("rsuite-utils/lib/utils");

var _utils2 = require("../utils");

var _IntlProvider = _interopRequireDefault(require("../IntlProvider"));

var _FormattedMessage = _interopRequireDefault(require("../IntlProvider/FormattedMessage"));

var _Picker = require("../Picker");

var _constants = require("../constants");

var CheckPicker =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(CheckPicker, _React$Component);

  function CheckPicker(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.positionRef = void 0;
    _this.menuContainerRef = void 0;
    _this.toggleRef = void 0;
    _this.triggerRef = void 0;

    _this.getFocusableMenuItems = function () {
      var labelKey = _this.props.labelKey;
      var menuItems = _this.menuContainerRef.current.menuItems;

      if (!menuItems) {
        return [];
      }

      var items = Object.values(menuItems).map(function (item) {
        return item.props.getItemData();
      });
      return (0, _utils.filterNodesOfTree)(items, function (item) {
        return _this.shouldDisplay(item[labelKey]);
      });
    };

    _this.setStickyItems = function () {
      var _this$props = _this.props,
          sticky = _this$props.sticky,
          data = _this$props.data,
          valueKey = _this$props.valueKey;

      var value = _this.getValue();

      if (!sticky) {
        return;
      }

      var stickyItems = [];

      if (data && value.length) {
        stickyItems = data.filter(function (item) {
          return value.some(function (v) {
            return v === item[valueKey];
          });
        });
      }

      _this.setState({
        stickyItems: stickyItems
      });
    };

    _this.focusNextMenuItem = function () {
      var valueKey = _this.props.valueKey;

      _this.findNode(function (items, index) {
        var focusItem = items[index + 1];

        if (!_lodash.default.isUndefined(focusItem)) {
          _this.setState({
            focusItemValue: focusItem[valueKey]
          });
        }
      });
    };

    _this.focusPrevMenuItem = function () {
      var valueKey = _this.props.valueKey;

      _this.findNode(function (items, index) {
        var focusItem = items[index - 1];

        if (!_lodash.default.isUndefined(focusItem)) {
          _this.setState({
            focusItemValue: focusItem[valueKey]
          });
        }
      });
    };

    _this.selectFocusMenuItem = function (event) {
      var value = _this.getValue();

      var _this$props2 = _this.props,
          data = _this$props2.data,
          valueKey = _this$props2.valueKey;
      var focusItemValue = _this.state.focusItemValue;

      if (!focusItemValue) {
        return;
      }

      if (!value.some(function (v) {
        return (0, _utils.shallowEqual)(v, focusItemValue);
      })) {
        value.push(focusItemValue);
      } else {
        _lodash.default.remove(value, function (itemVal) {
          return (0, _utils.shallowEqual)(itemVal, focusItemValue);
        });
      }

      var focusItem = data.find(function (item) {
        return (0, _utils.shallowEqual)(_lodash.default.get(item, valueKey), focusItemValue);
      });

      _this.setState({
        value: value
      }, function () {
        _this.handleSelect(value, focusItem, event);

        _this.handleChangeValue(value, event);
      });
    };

    _this.handleKeyDown = function (event) {
      var _this$state = _this.state,
          focusItemValue = _this$state.focusItemValue,
          active = _this$state.active; // enter

      if ((!focusItemValue || !active) && event.keyCode === 13) {
        _this.handleToggleDropdown();
      } // delete


      if (event.keyCode === 8 && event.target === _lodash.default.get((0, _assertThisInitialized2.default)(_this), 'toggle.toggle')) {
        _this.handleClean(event);
      }

      if (!_this.menuContainerRef.current) {
        return;
      }

      (0, _Picker.onMenuKeyDown)(event, {
        down: _this.focusNextMenuItem,
        up: _this.focusPrevMenuItem,
        enter: _this.selectFocusMenuItem,
        esc: _this.handleCloseDropdown
      });
    };

    _this.handleItemSelect = function (nextItemValue, item, event, checked) {
      var value = _this.getValue();

      if (checked) {
        value.push(nextItemValue);
      } else {
        _lodash.default.remove(value, function (itemVal) {
          return (0, _utils.shallowEqual)(itemVal, nextItemValue);
        });
      }

      var nextState = {
        value: value,
        focusItemValue: nextItemValue
      };

      _this.setState(nextState, function () {
        _this.handleSelect(value, item, event);

        _this.handleChangeValue(value, event);
      });
    };

    _this.handleSelect = function (nextItemValue, item, event) {
      var onSelect = _this.props.onSelect;
      onSelect && onSelect(nextItemValue, item, event);
    };

    _this.handleChangeValue = function (value, event) {
      var onChange = _this.props.onChange;
      onChange && onChange(value, event);
    };

    _this.handleSearch = function (searchKeyword, event) {
      var onSearch = _this.props.onSearch;

      _this.setState({
        searchKeyword: searchKeyword,
        focusItemValue: undefined
      });

      onSearch && onSearch(searchKeyword, event);
    };

    _this.handleCloseDropdown = function () {
      var value = _this.getValue();

      if (_this.triggerRef.current) {
        _this.triggerRef.current.hide();
      }

      _this.setState({
        focusItemValue: value ? value[0] : undefined
      });
    };

    _this.handleOpenDropdown = function () {
      if (_this.triggerRef.current) {
        _this.triggerRef.current.show();
      }
    };

    _this.handleToggleDropdown = function () {
      var active = _this.state.active;

      if (active) {
        _this.handleCloseDropdown();

        return;
      }

      _this.handleOpenDropdown();
    };

    _this.handleClean = function (event) {
      var _this$props3 = _this.props,
          disabled = _this$props3.disabled,
          cleanable = _this$props3.cleanable;

      if (disabled || !cleanable) {
        return;
      }

      _this.setState({
        value: []
      }, function () {
        _this.handleChangeValue([], event);
      });
    };

    _this.handleExit = function () {
      var onClose = _this.props.onClose;
      onClose && onClose();

      _this.setState({
        searchKeyword: '',
        focusItemValue: null,
        active: false
      });
    };

    _this.handleOpen = function () {
      var onOpen = _this.props.onOpen;
      onOpen && onOpen();

      _this.setState({
        active: true
      });
    };

    _this.addPrefix = function (name) {
      return (0, _utils2.prefix)(_this.props.classPrefix)(name);
    };

    _this.menuContainer = {
      menuItems: null
    };

    _this.getPositionInstance = function () {
      return _this.positionRef.current;
    };

    _this.getToggleInstance = function () {
      return _this.toggleRef.current;
    };

    var _value = props.value,
        defaultValue = props.defaultValue,
        groupBy = props.groupBy,
        _valueKey = props.valueKey,
        _labelKey = props.labelKey;
    var nextValue = _lodash.default.clone(_value || defaultValue) || [];
    _this.state = {
      value: nextValue,
      // Used to hover the active item  when trigger `onKeydown`
      focusItemValue: nextValue ? nextValue[0] : undefined,
      searchKeyword: ''
    };
    _this.positionRef = React.createRef();
    _this.menuContainerRef = React.createRef();
    _this.toggleRef = React.createRef();
    _this.triggerRef = React.createRef();

    if (groupBy === _valueKey || groupBy === _labelKey) {
      throw Error('`groupBy` can not be equal to `valueKey` and `labelKey`');
    }

    return _this;
  }

  var _proto = CheckPicker.prototype;

  _proto.getValue = function getValue() {
    var value = this.props.value;
    var nextValue = _lodash.default.isUndefined(value) ? this.state.value : value;
    return _lodash.default.clone(nextValue) || [];
  };

  /**
   * Index of keyword  in `label`
   * @param {node} label
   */
  _proto.shouldDisplay = function shouldDisplay(label) {
    var searchKeyword = this.state.searchKeyword;

    if (!_lodash.default.trim(searchKeyword)) {
      return true;
    }

    var keyword = searchKeyword.toLocaleLowerCase();

    if (typeof label === 'string' || typeof label === 'number') {
      return ("" + label).toLocaleLowerCase().indexOf(keyword) >= 0;
    } else if (React.isValidElement(label)) {
      var nodes = (0, _utils.reactToString)(label);
      return nodes.join('').toLocaleLowerCase().indexOf(keyword) >= 0;
    }

    return false;
  };

  _proto.findNode = function findNode(focus) {
    var items = this.getFocusableMenuItems();
    var valueKey = this.props.valueKey;
    var focusItemValue = this.state.focusItemValue;

    for (var i = 0; i < items.length; i += 1) {
      if ((0, _utils.shallowEqual)(focusItemValue, items[i][valueKey])) {
        focus(items, i);
        return;
      }
    }

    focus(items, -1);
  };

  _proto.renderDropdownMenu = function renderDropdownMenu() {
    var _this2 = this;

    var _this$props4 = this.props,
        data = _this$props4.data,
        labelKey = _this$props4.labelKey,
        valueKey = _this$props4.valueKey,
        groupBy = _this$props4.groupBy,
        searchable = _this$props4.searchable,
        renderExtraFooter = _this$props4.renderExtraFooter,
        locale = _this$props4.locale,
        renderMenu = _this$props4.renderMenu,
        menuClassName = _this$props4.menuClassName,
        menuStyle = _this$props4.menuStyle,
        menuAutoWidth = _this$props4.menuAutoWidth,
        sort = _this$props4.sort;
    var _this$state2 = this.state,
        focusItemValue = _this$state2.focusItemValue,
        stickyItems = _this$state2.stickyItems;
    var classes = (0, _classnames.default)(this.addPrefix('check-menu'), menuClassName);
    var filteredData = [];
    var filteredStickyItems = [];

    if (stickyItems) {
      filteredStickyItems = (0, _utils.filterNodesOfTree)(stickyItems, function (item) {
        return _this2.shouldDisplay(item[labelKey]);
      });
      filteredData = (0, _utils.filterNodesOfTree)(data, function (item) {
        return _this2.shouldDisplay(item[labelKey]) && !stickyItems.some(function (v) {
          return v[valueKey] === item[valueKey];
        });
      });
    } else {
      filteredData = (0, _utils.filterNodesOfTree)(data, function (item) {
        return _this2.shouldDisplay(item[labelKey]);
      });
    } // Create a tree structure data when set `groupBy`


    if (groupBy) {
      filteredData = (0, _utils2.getDataGroupBy)(filteredData, groupBy, sort);
    } else if (typeof sort === 'function') {
      filteredData = filteredData.sort(sort(false));
    }

    var menuProps = _lodash.default.pick(this.props, Object.keys(_lodash.default.omit(_Picker.DropdownMenu.propTypes, ['className', 'style', 'classPrefix'])));

    var menu = filteredData.length ? React.createElement(_Picker.DropdownMenu, (0, _extends2.default)({}, menuProps, {
      classPrefix: this.addPrefix('check-menu'),
      dropdownMenuItemComponentClass: _Picker.DropdownMenuCheckItem,
      ref: this.menuContainerRef,
      activeItemValues: this.getValue(),
      focusItemValue: focusItemValue,
      data: [].concat(filteredStickyItems, filteredData),
      group: !_lodash.default.isUndefined(groupBy),
      onSelect: this.handleItemSelect
    })) : React.createElement("div", {
      className: this.addPrefix('none')
    }, locale.noResultsText);
    return React.createElement(_Picker.MenuWrapper, {
      autoWidth: menuAutoWidth,
      className: classes,
      style: menuStyle,
      onKeyDown: this.handleKeyDown,
      getToggleInstance: this.getToggleInstance,
      getPositionInstance: this.getPositionInstance
    }, searchable && React.createElement(_Picker.SearchBar, {
      placeholder: locale.searchPlaceholder,
      onChange: this.handleSearch,
      value: this.state.searchKeyword
    }), renderMenu ? renderMenu(menu) : menu, renderExtraFooter && renderExtraFooter());
  };

  _proto.render = function render() {
    var _this$props5 = this.props,
        data = _this$props5.data,
        valueKey = _this$props5.valueKey,
        labelKey = _this$props5.labelKey,
        placeholder = _this$props5.placeholder,
        renderValue = _this$props5.renderValue,
        disabled = _this$props5.disabled,
        cleanable = _this$props5.cleanable,
        locale = _this$props5.locale,
        toggleComponentClass = _this$props5.toggleComponentClass,
        style = _this$props5.style,
        onEnter = _this$props5.onEnter,
        onEntered = _this$props5.onEntered,
        onExited = _this$props5.onExited,
        onClean = _this$props5.onClean,
        countable = _this$props5.countable,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props5, ["data", "valueKey", "labelKey", "placeholder", "renderValue", "disabled", "cleanable", "locale", "toggleComponentClass", "style", "onEnter", "onEntered", "onExited", "onClean", "countable"]);
    var unhandled = (0, _utils2.getUnhandledProps)(CheckPicker, rest);
    var value = this.getValue();
    var selectedItems = data.filter(function (item) {
      return value.some(function (val) {
        return (0, _utils.shallowEqual)(item[valueKey], val);
      });
    }) || [];
    var count = selectedItems.length;
    var hasValue = !!count;
    var selectedElement = placeholder;

    if (count > 0) {
      selectedElement = React.createElement(_Picker.SelectedElement, {
        selectedItems: selectedItems,
        countable: countable,
        valueKey: valueKey,
        labelKey: labelKey,
        prefix: this.addPrefix
      });

      if (renderValue) {
        selectedElement = renderValue(value, selectedItems, selectedElement);
      }
    }

    var classes = (0, _Picker.getToggleWrapperClassName)('check', this.addPrefix, this.props, hasValue);
    return React.createElement(_IntlProvider.default, {
      locale: locale
    }, React.createElement(_Picker.PickerToggleTrigger, {
      pickerProps: this.props,
      ref: this.triggerRef,
      positionRef: this.positionRef,
      onEnter: (0, _utils2.createChainedFunction)(this.setStickyItems, onEnter),
      onEntered: (0, _utils2.createChainedFunction)(this.handleOpen, onEntered),
      onExit: (0, _utils2.createChainedFunction)(this.handleExit, onExited),
      speaker: this.renderDropdownMenu()
    }, React.createElement("div", {
      className: classes,
      style: style
    }, React.createElement(_Picker.PickerToggle, (0, _extends2.default)({}, unhandled, {
      ref: this.toggleRef,
      onClean: (0, _utils2.createChainedFunction)(this.handleClean, onClean),
      onKeyDown: this.handleKeyDown,
      componentClass: toggleComponentClass,
      cleanable: cleanable && !disabled,
      hasValue: hasValue,
      active: this.state.active
    }), selectedElement || React.createElement(_FormattedMessage.default, {
      id: "placeholder"
    })))));
  };

  return CheckPicker;
}(React.Component);

CheckPicker.propTypes = {
  appearance: _propTypes.default.oneOf(['default', 'subtle']),
  data: _propTypes.default.array,
  locale: _propTypes.default.object,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  container: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),
  containerPadding: _propTypes.default.number,
  block: _propTypes.default.bool,
  toggleComponentClass: _propTypes.default.elementType,
  menuClassName: _propTypes.default.string,
  menuStyle: _propTypes.default.object,
  menuAutoWidth: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  disabledItemValues: _propTypes.default.array,
  maxHeight: _propTypes.default.number,
  valueKey: _propTypes.default.string,
  labelKey: _propTypes.default.string,
  value: _propTypes.default.array,
  defaultValue: _propTypes.default.array,
  renderMenu: _propTypes.default.func,
  renderMenuItem: _propTypes.default.func,
  renderMenuGroup: _propTypes.default.func,
  renderValue: _propTypes.default.func,
  renderExtraFooter: _propTypes.default.func,
  onChange: _propTypes.default.func,
  onSelect: _propTypes.default.func,
  onGroupTitleClick: _propTypes.default.func,
  onSearch: _propTypes.default.func,
  onClean: _propTypes.default.func,
  onOpen: _propTypes.default.func,
  onClose: _propTypes.default.func,
  onHide: _propTypes.default.func,
  onEnter: _propTypes.default.func,
  onEntering: _propTypes.default.func,
  onEntered: _propTypes.default.func,
  onExit: _propTypes.default.func,
  onExiting: _propTypes.default.func,
  onExited: _propTypes.default.func,
  groupBy: _propTypes.default.any,
  sort: _propTypes.default.func,
  placeholder: _propTypes.default.node,
  searchable: _propTypes.default.bool,
  cleanable: _propTypes.default.bool,
  countable: _propTypes.default.bool,
  open: _propTypes.default.bool,
  defaultOpen: _propTypes.default.bool,
  placement: _propTypes.default.oneOf(_constants.PLACEMENT),
  style: _propTypes.default.object,
  sticky: _propTypes.default.bool,
  preventOverflow: _propTypes.default.bool
};
CheckPicker.defaultProps = {
  appearance: 'default',
  data: [],
  disabledItemValues: [],
  maxHeight: 320,
  valueKey: 'value',
  labelKey: 'label',
  locale: {
    placeholder: 'Select',
    searchPlaceholder: 'Search',
    noResultsText: 'No results found'
  },
  searchable: true,
  cleanable: true,
  countable: true,
  menuAutoWidth: true,
  placement: 'bottomStart'
};
var enhance = (0, _compose.default)((0, _utils2.defaultProps)({
  classPrefix: 'picker'
}), (0, _utils2.withPickerMethods)());

var _default = enhance(CheckPicker);

exports.default = _default;
module.exports = exports.default;