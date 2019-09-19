import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import compose from 'recompose/compose';
import _ from 'lodash';
import List from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { CellMeasurerCache, CellMeasurer } from 'react-virtualized/dist/commonjs/CellMeasurer';
import { polyfill } from 'react-lifecycles-compat';
import { shallowEqual } from 'rsuite-utils/lib/utils';
import CheckTreeNode from './CheckTreeNode';
import { CHECK_STATE, PLACEMENT } from '../constants';
import { clone, defaultProps, prefix, defaultClassPrefix, getUnhandledProps, createChainedFunction, withPickerMethods } from '../utils';
import { PickerToggle, getToggleWrapperClassName, onMenuKeyDown, MenuWrapper, SearchBar, SelectedElement, PickerToggleTrigger, createConcatChildrenFunction } from '../Picker';
import { isEveryChildChecked, isSomeChildChecked, isSomeNodeHasChildren, getTopParentNodeCheckState, getSiblingNodeUncheckable, getEveryFisrtLevelNodeUncheckable, getUncheckableState, getFormattedTree, getDisabledState } from './utils';
import { compareArray, shouldDisplay, shouldShowNodeByExpanded, flattenTree, getNodeParents, getVirtualLisHeight, hasVisibleChildren, treeDeprecatedWarning, getExpandItemValues, getExpandAll, getExpandState } from '../utils/treeUtils';
// default value for virtualized
var defaultHeight = 360;
var defaultWidth = 200;

var CheckTreePicker =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(CheckTreePicker, _React$Component);

  function CheckTreePicker(_props) {
    var _this;

    _this = _React$Component.call(this, _props) || this;
    _this.menuRef = void 0;
    _this.treeViewRef = void 0;
    _this.positionRef = void 0;
    _this.listRef = void 0;
    _this.triggerRef = void 0;
    _this.toggleRef = void 0;

    _this.getValue = function (props) {
      if (props === void 0) {
        props = _this.props;
      }

      var _props2 = props,
          value = _props2.value,
          defaultValue = _props2.defaultValue,
          _props2$uncheckableIt = _props2.uncheckableItemValues,
          uncheckableItemValues = _props2$uncheckableIt === void 0 ? [] : _props2$uncheckableIt;

      if (value && value.length) {
        return value.filter(function (v) {
          return !uncheckableItemValues.includes(v);
        });
      }

      if (defaultValue && defaultValue.length > 0) {
        return defaultValue.filter(function (v) {
          return !uncheckableItemValues.includes(v);
        });
      }

      return [];
    };

    _this.getElementByDataKey = function (dataKey) {
      var ele = _this.nodeRefs[dataKey];

      if (ele instanceof Element) {
        return ele.querySelector("." + _this.addTreePrefix('node-label'));
      }

      return null;
    };

    _this.getFocusableMenuItems = function () {
      var filterData = _this.state.filterData;
      var childrenKey = _this.props.childrenKey;
      var items = [];

      var loop = function loop(treeNodes) {
        treeNodes.forEach(function (node) {
          if (!getDisabledState(_this.nodes, node, _this.props) && node.visible) {
            items.push(node);

            var nodeData = _extends({}, node, {}, _this.nodes[node.refKey]);

            if (!getExpandState(nodeData, _this.props)) {
              return;
            }

            if (node[childrenKey]) {
              loop(node[childrenKey]);
            }
          }
        });
      };

      loop(filterData);
      return items;
    };

    _this.nodes = {};
    _this.activeNode = null;
    _this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 20
    });
    _this.nodeRefs = {};

    _this.bindNodeRefs = function (refKey, ref) {
      _this.nodeRefs[refKey] = ref;
    };

    _this.getPositionInstance = function () {
      return _this.positionRef.current;
    };

    _this.getToggleInstance = function () {
      return _this.toggleRef.current;
    };

    _this.selectActiveItem = function (event) {
      var _this$getActiveItem = _this.getActiveItem(),
          nodeData = _this$getActiveItem.nodeData;

      _this.handleSelect(nodeData, event);
    };

    _this.focusNextItem = function () {
      var _this$getItemsAndActi = _this.getItemsAndActiveIndex(),
          items = _this$getItemsAndActi.items,
          activeIndex = _this$getItemsAndActi.activeIndex;

      if (items.length === 0) {
        return;
      }

      var nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;

      var node = _this.getElementByDataKey(items[nextIndex].refKey);

      if (node !== null && typeof node.focus === 'function') {
        node.focus();
      }
    };

    _this.focusPreviousItem = function () {
      var _this$getItemsAndActi2 = _this.getItemsAndActiveIndex(),
          items = _this$getItemsAndActi2.items,
          activeIndex = _this$getItemsAndActi2.activeIndex;

      if (items.length === 0) {
        return;
      }

      var prevIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
      prevIndex = prevIndex >= 0 ? prevIndex : 0;

      var node = _this.getElementByDataKey(items[prevIndex].refKey);

      if (node !== null && typeof node.focus === 'function') {
        node.focus();
      }
    };

    _this.handleCloseDropdown = function () {
      if (_this.triggerRef.current) {
        _this.triggerRef.current.hide();
      }
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

    _this.everyChildChecked = function (nodes, node) {
      var list = [];
      Object.keys(nodes).forEach(function (refKey) {
        var curNode = nodes[refKey];

        if (curNode.parentNode && curNode.parentNode.refKey === node.refKey && !curNode.uncheckable) {
          list.push(curNode);
        }
      });
      return list.every(function (l) {
        return l.check;
      });
    };

    _this.addPrefix = function (name) {
      return prefix(_this.props.classPrefix)(name);
    };

    _this.addTreePrefix = function (name) {
      return prefix(defaultClassPrefix('check-tree'))(name);
    };

    _this.handleSelect = function (activeNode, event) {
      var _this$props = _this.props,
          onChange = _this$props.onChange,
          onSelect = _this$props.onSelect,
          value = _this$props.value;

      var selectedValues = _this.toggleChecked(activeNode, !_this.nodes[activeNode.refKey].check);

      if (!_.isUndefined(value)) {
        _this.activeNode = activeNode;
      } else {
        _this.unserializeLists({
          check: selectedValues
        });

        _this.setState({
          activeNode: activeNode,
          selectedValues: selectedValues,
          hasValue: !!selectedValues.length
        });
      }

      onChange && onChange(selectedValues, event);
      onSelect && onSelect(activeNode, selectedValues, event);
    };

    _this.handleToggle = function (node) {
      var _this$props2 = _this.props,
          valueKey = _this$props2.valueKey,
          onExpand = _this$props2.onExpand,
          expandItemValues = _this$props2.expandItemValues;

      var nextExpandItemValues = _this.toggleExpand(node, !node.expand);

      if (_.isUndefined(expandItemValues)) {
        _this.unserializeLists({
          expand: nextExpandItemValues
        });

        _this.setState({
          expandItemValues: nextExpandItemValues
        });
      }

      onExpand && onExpand(nextExpandItemValues, node, createConcatChildrenFunction(node, node[valueKey]));
    };

    _this.handleKeyDown = function (event) {
      onMenuKeyDown(event, {
        down: _this.focusNextItem,
        up: _this.focusPreviousItem,
        enter: _this.selectActiveItem,
        del: _this.handleClean
      });
    };

    _this.handleToggleKeyDown = function (event) {
      var _this$state = _this.state,
          activeNode = _this$state.activeNode,
          active = _this$state.active; // enter

      if ((!activeNode || !active) && event.keyCode === 13) {
        _this.handleToggleDropdown();
      } // delete


      if (event.keyCode === 8) {
        _this.handleClean(event);
      }

      if (!_this.treeViewRef.current) {
        return;
      }

      if (event.target instanceof HTMLElement) {
        var className = event.target.className;

        if (className.includes(_this.addPrefix('toggle')) || className.includes(_this.addPrefix('toggle-custom')) || className.includes(_this.addPrefix('search-bar-input'))) {
          onMenuKeyDown(event, {
            down: _this.focusNextItem
          });
        }
      }
    };

    _this.handleSearch = function (value, event) {
      var filterData = _this.state.filterData;
      var _this$props3 = _this.props,
          onSearch = _this$props3.onSearch,
          searchKeyword = _this$props3.searchKeyword;

      if (_.isUndefined(searchKeyword)) {
        _this.setState({
          filterData: _this.getFilterData(value, filterData),
          searchKeyword: value
        });
      }

      onSearch && onSearch(value, event);
    };

    _this.handleClean = function (evnet) {
      var onChange = _this.props.onChange;

      _this.setState({
        selectedValues: [],
        hasValue: false,
        activeNode: {}
      });

      _this.unserializeLists({
        check: []
      });

      onChange && onChange([], evnet);
    };

    _this.handleOnOpen = function () {
      var activeNode = _this.state.activeNode;
      var onOpen = _this.props.onOpen;

      if (activeNode) {
        var node = _this.getElementByDataKey(activeNode.refKey);

        if (node !== null && typeof node.focus === 'function') {
          node.focus();
        }
      }

      onOpen && onOpen();

      _this.setState({
        active: true
      });
    };

    _this.handleOnClose = function () {
      var filterData = _this.state.filterData;
      var _this$props4 = _this.props,
          onClose = _this$props4.onClose,
          searchKeyword = _this$props4.searchKeyword;

      if (_.isUndefined(searchKeyword)) {
        _this.setState({
          filterData: _this.getFilterData('', filterData),
          searchKeyword: ''
        });
      }

      onClose && onClose();

      _this.setState({
        active: false
      });
    };

    _this.measureRowRenderer = function (nodes) {
      return function (_ref) {
        var key = _ref.key,
            index = _ref.index,
            style = _ref.style,
            parent = _ref.parent;
        var node = nodes[index];
        return React.createElement(CellMeasurer, {
          cache: _this.cache,
          columnIndex: 0,
          key: key,
          rowIndex: index,
          parent: parent
        }, function () {
          return _this.renderVirtualNode(node, {
            key: key,
            style: style
          });
        });
      };
    };

    var _value = _props.value,
        data = _props.data,
        cascade = _props.cascade,
        _childrenKey = _props.childrenKey,
        _searchKeyword = _props.searchKeyword;
    _this.nodes = {};

    var nextValue = _this.getValue(_props);

    var _nextExpandItemValues = getExpandItemValues(_props);

    var nextData = [].concat(data);

    _this.flattenNodes(nextData, _props);

    _this.unserializeLists({
      check: nextValue,
      expand: _nextExpandItemValues
    }, _props);

    _this.state = {
      data: data,
      value: _value,
      cascade: cascade,
      hasValue: _this.hasValue(nextValue),
      expandAll: getExpandAll(_props),
      filterData: _this.getFilterData(_searchKeyword, nextData, _props),
      searchKeyword: _searchKeyword || '',
      selectedValues: nextValue,
      expandItemValues: _this.serializeList('expand'),
      uncheckableItemValues: _props.uncheckableItemValues,
      isSomeNodeHasChildren: isSomeNodeHasChildren(data, _childrenKey)
    };
    _this.treeViewRef = React.createRef();
    _this.positionRef = React.createRef();
    _this.listRef = React.createRef();
    _this.triggerRef = React.createRef();
    _this.toggleRef = React.createRef(); // for test

    _this.menuRef = React.createRef();
    treeDeprecatedWarning(_props, ['expandAll']);
    return _this;
  }

  CheckTreePicker.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
    var value = nextProps.value,
        data = nextProps.data,
        cascade = nextProps.cascade,
        expandAll = nextProps.expandAll,
        searchKeyword = nextProps.searchKeyword,
        uncheckableItemValues = nextProps.uncheckableItemValues,
        expandItemValues = nextProps.expandItemValues;
    var nextState = {};

    if (_.isArray(data) && _.isArray(prevState.data) && prevState.data !== data) {
      nextState.data = data;
    }

    if (compareArray(value, prevState.value)) {
      nextState.value = value;
    }

    if (compareArray(expandItemValues, prevState.expandItemValues)) {
      nextState.expandItemValues = expandItemValues;
    }

    if (compareArray(uncheckableItemValues, prevState.uncheckableItemValues)) {
      nextState.uncheckableItemValues = uncheckableItemValues;
    }

    if (!_.isUndefined(searchKeyword) && searchKeyword !== prevState.searchKeyword) {
      nextState.searchKeyword = searchKeyword;
    }

    if (cascade !== prevState.cascade) {
      nextState.cascade = cascade;
    }

    if (expandAll !== prevState.expandAll) {
      nextState.expandAll = expandAll;
    }

    return Object.keys(nextState).length ? nextState : null;
  };

  var _proto = CheckTreePicker.prototype;

  _proto.componentDidUpdate = function componentDidUpdate(_prevProps, prevState) {
    this.updateDataChange(prevState);
    this.updateValueChange(prevState);
    this.updateExpandItemValuesChange(prevState);
    this.updateUncheckableItemValuesChange(prevState);
    this.updateCascadeChange(prevState);
    this.updateSearchKeywordChange(prevState);

    if (this.listRef.current) {
      this.listRef.current.forceUpdateGrid();
    }
  };

  _proto.updateDataChange = function updateDataChange(prevState) {
    var _this$state2 = this.state,
        searchKeyword = _this$state2.searchKeyword,
        expandItemValues = _this$state2.expandItemValues;
    var _this$props5 = this.props,
        _this$props5$data = _this$props5.data,
        data = _this$props5$data === void 0 ? [] : _this$props5$data,
        childrenKey = _this$props5.childrenKey;

    if (prevState.data !== data) {
      var nextData = [].concat(data);
      this.flattenNodes(nextData);
      this.unserializeLists({
        check: this.getValue(),
        expand: expandItemValues
      });
      this.setState({
        data: nextData,
        filterData: this.getFilterData(searchKeyword, nextData),
        isSomeNodeHasChildren: isSomeNodeHasChildren(nextData, childrenKey),
        hasValue: this.hasValue()
      });
    }
  };

  _proto.updateValueChange = function updateValueChange(prevState) {
    var expandItemValues = this.state.expandItemValues;
    var value = this.props.value;

    if (compareArray(value, prevState.value)) {
      this.unserializeLists({
        check: value,
        expand: expandItemValues
      });
      this.setState({
        selectedValues: value,
        hasValue: this.hasValue(value),
        activeNode: value.length ? this.activeNode : null
      });
    }
  };

  _proto.updateExpandItemValuesChange = function updateExpandItemValuesChange(prevState) {
    var expandItemValues = this.props.expandItemValues;

    if (compareArray(expandItemValues, prevState.expandItemValues)) {
      this.unserializeLists({
        expand: expandItemValues
      });
      this.setState({
        expandItemValues: expandItemValues
      });
    }
  };

  _proto.updateUncheckableItemValuesChange = function updateUncheckableItemValuesChange(prevState) {
    var _this$state3 = this.state,
        filterData = _this$state3.filterData,
        selectedValues = _this$state3.selectedValues,
        expandItemValues = _this$state3.expandItemValues;
    var uncheckableItemValues = this.props.uncheckableItemValues;

    if (compareArray(uncheckableItemValues, prevState.uncheckableItemValues)) {
      this.flattenNodes(filterData);
      this.unserializeLists({
        check: selectedValues,
        expand: expandItemValues
      });
      this.setState({
        hasValue: this.hasValue()
      });
    }
  };

  _proto.updateCascadeChange = function updateCascadeChange(prevState) {
    var _this$state4 = this.state,
        filterData = _this$state4.filterData,
        selectedValues = _this$state4.selectedValues,
        expandItemValues = _this$state4.expandItemValues;
    var cascade = this.props.cascade; // cascade 改变时，重新初始化

    if (cascade !== prevState.cascade && cascade) {
      this.flattenNodes(filterData);
      this.unserializeLists({
        check: selectedValues,
        expand: expandItemValues
      });
      this.setState({
        cascade: cascade
      });
    }
  };

  _proto.updateSearchKeywordChange = function updateSearchKeywordChange(prevState) {
    var filterData = this.state.filterData;
    var searchKeyword = this.props.searchKeyword;

    if (!_.isUndefined(searchKeyword) && prevState.searchKeyword !== searchKeyword) {
      this.setState({
        filterData: this.getFilterData(searchKeyword, filterData)
      });
    }
  };

  _proto.getNodeCheckState = function getNodeCheckState(node, cascade) {
    var childrenKey = this.props.childrenKey;

    if (!node[childrenKey] || !node[childrenKey].length || !cascade) {
      this.nodes[node.refKey].checkAll = false;
      return node.check ? CHECK_STATE.CHECK : CHECK_STATE.UNCHECK;
    }

    if (isEveryChildChecked(node, this.nodes, this.props)) {
      this.nodes[node.refKey].checkAll = true;
      return CHECK_STATE.CHECK;
    }

    if (isSomeChildChecked(node, this.nodes, this.props)) {
      this.nodes[node.refKey].checkAll = false;
      return CHECK_STATE.INDETERMINATE;
    }

    return CHECK_STATE.UNCHECK;
  };

  _proto.getFilterData = function getFilterData(searchKeyword, data, props) {
    if (searchKeyword === void 0) {
      searchKeyword = '';
    }

    if (props === void 0) {
      props = this.props;
    }

    var _props3 = props,
        labelKey = _props3.labelKey,
        childrenKey = _props3.childrenKey;

    var setVisible = function setVisible(nodes) {
      if (nodes === void 0) {
        nodes = [];
      }

      return nodes.forEach(function (item) {
        item.visible = shouldDisplay(item[labelKey], searchKeyword);

        if (_.isArray(item[childrenKey])) {
          setVisible(item[childrenKey]);
          item[childrenKey].forEach(function (child) {
            if (child.visible) {
              item.visible = child.visible;
            }
          });
        }
      });
    };

    setVisible(data);
    return data;
  };

  _proto.getActiveElementOption = function getActiveElementOption(options, refKey) {
    var childrenKey = this.props.childrenKey;

    for (var i = 0; i < options.length; i += 1) {
      if (options[i].refKey === refKey) {
        return options[i];
      } else if (options[i][childrenKey] && options[i][childrenKey].length) {
        var active = this.getActiveElementOption(options[i][childrenKey], refKey);

        if (!_.isEmpty(active)) {
          return active;
        }
      }
    }

    return {};
  };

  _proto.getFlattenTreeData = function getFlattenTreeData(nodes) {
    var _this2 = this;

    var expandItemValues = this.state.expandItemValues;
    var _this$props6 = this.props,
        childrenKey = _this$props6.childrenKey,
        valueKey = _this$props6.valueKey;
    return flattenTree(nodes, childrenKey, function (node) {
      var formatted = {};
      var curNode = _this2.nodes[node.refKey];
      var parentKeys = getNodeParents(curNode, 'parentNode', valueKey);

      if (curNode) {
        formatted = _extends({}, node, {
          check: curNode.check,
          expand: curNode.expand,
          uncheckable: curNode.uncheckable,
          layer: curNode.layer,
          parentNode: curNode.parentNode,
          showNode: shouldShowNodeByExpanded(expandItemValues, parentKeys)
        });
      }

      return formatted;
    });
  };

  _proto.getItemsAndActiveIndex = function getItemsAndActiveIndex() {
    var items = this.getFocusableMenuItems();
    var activeIndex = -1;
    items.forEach(function (item, index) {
      if (document.activeElement !== null) {
        if (item.refKey === document.activeElement.getAttribute('data-key')) {
          activeIndex = index;
        }
      }
    });
    return {
      items: items,
      activeIndex: activeIndex
    };
  };

  _proto.getActiveItem = function getActiveItem() {
    var filterData = this.state.filterData;
    var activeItem = document.activeElement;

    if (activeItem !== null) {
      var _$get = _.get(activeItem, 'dataset'),
          key = _$get.key,
          layer = _$get.layer;

      var nodeData = this.getActiveElementOption(filterData, key);
      nodeData.check = !this.nodes[nodeData.refKey].check;
      nodeData.parentNode = this.nodes[nodeData.refKey].parentNode;
      return {
        nodeData: nodeData,
        layer: layer
      };
    }

    return {};
  }
  /**
   * 获取已选择的items，用于显示在placeholder
   */
  ;

  _proto.getSelectedItems = function getSelectedItems(selectedValues) {
    var _this3 = this;

    var valueKey = this.props.valueKey;
    var checkItems = [];
    Object.keys(this.nodes).map(function (refKey) {
      var node = _this3.nodes[refKey];

      if (selectedValues.some(function (value) {
        return shallowEqual(node[valueKey], value);
      })) {
        checkItems.push(node);
      }
    });
    return checkItems;
  }
  /**
   * 判断传入的 value 是否存在于data 中
   * @param {*} values
   */
  ;

  _proto.hasValue = function hasValue(values) {
    var _this4 = this;

    if (values === void 0) {
      values = this.state.selectedValues;
    }

    var valueKey = this.props.valueKey;
    var selectedValues = Object.keys(this.nodes).map(function (refKey) {
      return _this4.nodes[refKey][valueKey];
    }).filter(function (item) {
      return values.some(function (v) {
        return shallowEqual(v, item);
      });
    });
    return !!selectedValues.length;
  }
  /**
   * 拍平数组，将tree 转换为一维对象
   * @param {*} nodes tree data
   * @param {*} ref 当前层级
   */
  ;

  _proto.flattenNodes = function flattenNodes(nodes, props, ref, parentNode, layer) {
    var _this5 = this;

    if (ref === void 0) {
      ref = '0';
    }

    if (layer === void 0) {
      layer = 0;
    }

    var _ref2 = props || this.props,
        labelKey = _ref2.labelKey,
        valueKey = _ref2.valueKey,
        childrenKey = _ref2.childrenKey;

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    nodes.forEach(function (node, index) {
      var _this5$nodes$refKey;

      var refKey = ref + "-" + index;
      node.refKey = refKey;
      _this5.nodes[refKey] = (_this5$nodes$refKey = {
        layer: layer
      }, _this5$nodes$refKey[labelKey] = node[labelKey], _this5$nodes$refKey[valueKey] = node[valueKey], _this5$nodes$refKey.expand = getExpandState(node, props || _this5.props), _this5$nodes$refKey.uncheckable = getUncheckableState(node, props || _this5.props), _this5$nodes$refKey.refKey = refKey, _this5$nodes$refKey);

      if (parentNode) {
        _this5.nodes[refKey].parentNode = parentNode;
      }

      _this5.flattenNodes(node[childrenKey], props, refKey, _this5.nodes[refKey], layer + 1);
    });
  }
  /**
   * 过滤选中的values中不包含 uncheckableItemValues 的那些值
   * @param {*} values
   */
  ;

  _proto.filterSelectedValues = function filterSelectedValues(values) {
    var _this$props$uncheckab = this.props.uncheckableItemValues,
        uncheckableItemValues = _this$props$uncheckab === void 0 ? [] : _this$props$uncheckab;
    return values.filter(function (value) {
      return !uncheckableItemValues.includes(value);
    });
  };

  _proto.serializeList = function serializeList(key, nodes) {
    if (nodes === void 0) {
      nodes = this.nodes;
    }

    var valueKey = this.props.valueKey;
    var list = [];
    Object.keys(nodes).forEach(function (refKey) {
      if (nodes[refKey][key]) {
        list.push(nodes[refKey][valueKey]);
      }
    });
    return list;
  };

  _proto.serializeListOnlyParent = function serializeListOnlyParent(key, nodes) {
    if (nodes === void 0) {
      nodes = this.nodes;
    }

    var valueKey = this.props.valueKey;
    var list = [];
    Object.keys(nodes).forEach(function (refKey) {
      var currentNode = nodes[refKey];

      if (currentNode.parentNode) {
        var parentNode = nodes[currentNode.parentNode.refKey];

        if (currentNode[key]) {
          if (!parentNode.checkAll) {
            list.push(nodes[refKey][valueKey]);
          } else if (!getTopParentNodeCheckState(nodes, currentNode) && parentNode.uncheckable) {
            list.push(nodes[refKey][valueKey]);
          }
        }
      } else {
        if (currentNode[key]) {
          list.push(nodes[refKey][valueKey]);
        }
      }
    });
    return list;
  };

  _proto.unserializeLists = function unserializeLists(lists, nextProps) {
    var _this6 = this;

    if (nextProps === void 0) {
      nextProps = this.props;
    }

    var _nextProps = nextProps,
        valueKey = _nextProps.valueKey,
        cascade = _nextProps.cascade,
        _nextProps$uncheckabl = _nextProps.uncheckableItemValues,
        uncheckableItemValues = _nextProps$uncheckabl === void 0 ? [] : _nextProps$uncheckabl;
    var expandAll = getExpandAll(nextProps); // Reset values to false

    Object.keys(this.nodes).forEach(function (refKey) {
      Object.keys(lists).forEach(function (listKey) {
        if (listKey === 'check') {
          var node = _this6.nodes[refKey];

          if (cascade && 'parentNode' in node) {
            node[listKey] = node.parentNode[listKey];
          } else {
            node[listKey] = false;
          }

          lists[listKey].forEach(function (value) {
            if (shallowEqual(_this6.nodes[refKey][valueKey], value) && !uncheckableItemValues.some(function (uncheckableValue) {
              return shallowEqual(value, uncheckableValue);
            })) {
              _this6.nodes[refKey][listKey] = true;
            }
          });
        }

        if (listKey === 'expand') {
          _this6.nodes[refKey][listKey] = false;

          if (lists[listKey].length) {
            lists[listKey].forEach(function (value) {
              if (shallowEqual(_this6.nodes[refKey][valueKey], value)) {
                _this6.nodes[refKey][listKey] = true;
              }
            });
          } else {
            _this6.nodes[refKey][listKey] = expandAll;
          }
        }
      });
    });
  };

  _proto.toggleChecked = function toggleChecked(node, isChecked) {
    var nodes = clone(this.nodes);
    this.toggleDownChecked(nodes, node, isChecked);
    node.parentNode && this.toggleUpChecked(nodes, node.parentNode, isChecked);
    var values = this.serializeListOnlyParent('check', nodes);
    return this.filterSelectedValues(values);
  };

  _proto.toggleUpChecked = function toggleUpChecked(nodes, node, checked) {
    var cascade = this.props.cascade;
    var currentNode = nodes[node.refKey];

    if (cascade) {
      if (!checked) {
        currentNode.check = checked;
        currentNode.checkAll = checked;
      } else {
        if (this.everyChildChecked(nodes, node)) {
          currentNode.check = true;
          currentNode.checkAll = true;
        } else {
          currentNode.check = false;
          currentNode.checkAll = false;
        }
      }

      if (node.parentNode) {
        this.toggleUpChecked(nodes, node.parentNode, checked);
      }
    }
  };

  _proto.toggleDownChecked = function toggleDownChecked(nodes, node, isChecked) {
    var _this7 = this;

    var _this$props7 = this.props,
        childrenKey = _this$props7.childrenKey,
        cascade = _this$props7.cascade;
    nodes[node.refKey].check = isChecked;

    if (!node[childrenKey] || !node[childrenKey].length || !cascade) {
      nodes[node.refKey].checkAll = false;
    } else {
      nodes[node.refKey].checkAll = isChecked;
      node[childrenKey].forEach(function (child) {
        _this7.toggleDownChecked(nodes, child, isChecked);
      });
    }
  };

  _proto.toggleNode = function toggleNode(key, node, toggleValue) {
    // 如果该节点处于 disabledChecbox，则忽略该值
    if (!node.uncheckable) {
      this.nodes[node.refKey][key] = toggleValue;
    }
  };

  _proto.toggleExpand = function toggleExpand(node, isExpand) {
    var valueKey = this.props.valueKey;
    var expandItemValues = new Set(this.serializeList('expand'));

    if (isExpand) {
      expandItemValues.add(node[valueKey]);
    } else {
      expandItemValues.delete(node[valueKey]);
    }

    return Array.from(expandItemValues);
  };

  _proto.renderDropdownMenu = function renderDropdownMenu() {
    var _this$props8 = this.props,
        _this$props8$height = _this$props8.height,
        height = _this$props8$height === void 0 ? defaultHeight : _this$props8$height,
        locale = _this$props8.locale,
        menuStyle = _this$props8.menuStyle,
        searchable = _this$props8.searchable,
        renderMenu = _this$props8.renderMenu,
        virtualized = _this$props8.virtualized,
        searchKeyword = _this$props8.searchKeyword,
        renderExtraFooter = _this$props8.renderExtraFooter,
        menuClassName = _this$props8.menuClassName,
        menuAutoWidth = _this$props8.menuAutoWidth;
    var keyword = !_.isUndefined(searchKeyword) ? searchKeyword : this.state.searchKeyword;
    var classes = classNames(menuClassName, this.addPrefix('check-tree-menu'));
    var menu = this.renderCheckTree();
    var styles = virtualized ? _extends({
      height: height
    }, menuStyle) : menuStyle;
    return React.createElement(MenuWrapper, {
      autoWidth: menuAutoWidth,
      className: classes,
      style: styles,
      ref: this.menuRef,
      getToggleInstance: this.getToggleInstance,
      getPositionInstance: this.getPositionInstance
    }, searchable ? React.createElement(SearchBar, {
      placeholder: locale.searchPlaceholder,
      key: "searchBar",
      onChange: this.handleSearch,
      value: keyword
    }) : null, renderMenu ? renderMenu(menu) : menu, renderExtraFooter && renderExtraFooter());
  };

  _proto.renderNode = function renderNode(node, layer) {
    var _this8 = this;

    var _this$state5 = this.state,
        activeNode = _this$state5.activeNode,
        searchKeyword = _this$state5.searchKeyword;
    var _this$props9 = this.props,
        valueKey = _this$props9.valueKey,
        labelKey = _this$props9.labelKey,
        childrenKey = _this$props9.childrenKey,
        renderTreeNode = _this$props9.renderTreeNode,
        renderTreeIcon = _this$props9.renderTreeIcon,
        cascade = _this$props9.cascade;
    var expand = node.expand,
        visible = node.visible,
        refKey = node.refKey;

    if (!visible) {
      return null;
    }

    var key = _.isString(node[valueKey]) || _.isNumber(node[valueKey]) ? node[valueKey] : refKey;
    var children = node[childrenKey]; // 当用户进行搜索时，hasChildren的判断要变成判断是否存在 visible 为 true 的子节点

    var visibleChildren = _.isUndefined(searchKeyword) || searchKeyword.length === 0 ? !!children : hasVisibleChildren(node, childrenKey);
    var props = {
      value: node[valueKey],
      label: node[labelKey],
      layer: layer,
      expand: expand,
      focus: activeNode ? shallowEqual(activeNode[valueKey], node[valueKey]) : false,
      visible: node.visible,
      disabled: getDisabledState(this.nodes, node, this.props),
      nodeData: node,
      checkState: this.getNodeCheckState(node, cascade),
      hasChildren: visibleChildren,
      uncheckable: node.uncheckable,
      allUncheckable: getSiblingNodeUncheckable(node, this.nodes),
      onSelect: this.handleSelect,
      onTreeToggle: this.handleToggle,
      onRenderTreeNode: renderTreeNode,
      onRenderTreeIcon: renderTreeIcon
    };

    if (props.hasChildren) {
      var _classNames;

      layer += 1; // 是否展开树节点且子节点不为空

      var openClass = this.addTreePrefix('open');
      var expandALlState = node.expand;
      var childrenClass = classNames(this.addTreePrefix('node-children'), (_classNames = {}, _classNames[openClass] = expandALlState && visibleChildren, _classNames));
      var nodes = children || [];
      return React.createElement("div", {
        className: childrenClass,
        key: key,
        ref: this.bindNodeRefs.bind(this, refKey)
      }, React.createElement(CheckTreeNode, props), React.createElement("div", {
        className: this.addTreePrefix('children')
      }, nodes.map(function (child) {
        return _this8.renderNode(child, layer);
      })));
    }

    return React.createElement(CheckTreeNode, _extends({
      key: key,
      innerRef: this.bindNodeRefs.bind(this, refKey)
    }, props));
  };

  _proto.renderVirtualNode = function renderVirtualNode(node, options) {
    var _this$state6 = this.state,
        activeNode = _this$state6.activeNode,
        expandAll = _this$state6.expandAll;
    var _this$props10 = this.props,
        valueKey = _this$props10.valueKey,
        labelKey = _this$props10.labelKey,
        childrenKey = _this$props10.childrenKey,
        renderTreeNode = _this$props10.renderTreeNode,
        renderTreeIcon = _this$props10.renderTreeIcon,
        cascade = _this$props10.cascade;
    var key = options.key,
        style = options.style;
    var layer = node.layer,
        refKey = node.refKey,
        expand = node.expand,
        showNode = node.showNode;
    var children = node[childrenKey];
    var props = {
      value: node[valueKey],
      label: node[labelKey],
      layer: layer,
      expand: expand,
      focus: activeNode ? shallowEqual(activeNode[valueKey], node[valueKey]) : false,
      visible: node.visible,
      disabled: getDisabledState(this.nodes, node, this.props),
      nodeData: node,
      children: children,
      expandAll: expandAll,
      checkState: this.getNodeCheckState(node, cascade),
      parentNode: node.parentNode,
      hasChildren: !!children,
      uncheckable: node.uncheckable,
      allUncheckable: getSiblingNodeUncheckable(node, this.nodes),
      onSelect: this.handleSelect,
      onTreeToggle: this.handleToggle,
      onRenderTreeNode: renderTreeNode,
      onRenderTreeIcon: renderTreeIcon
    };
    return showNode && React.createElement(CheckTreeNode, _extends({
      style: style,
      key: key,
      innerRef: this.bindNodeRefs.bind(this, refKey)
    }, props));
  };

  _proto.renderCheckTree = function renderCheckTree() {
    var _classNames2,
        _this9 = this,
        _classNames3;

    var _this$state7 = this.state,
        filterData = _this$state7.filterData,
        isSomeNodeHasChildren = _this$state7.isSomeNodeHasChildren;
    var _this$props11 = this.props,
        inline = _this$props11.inline,
        style = _this$props11.style,
        height = _this$props11.height,
        _this$props11$classNa = _this$props11.className,
        className = _this$props11$classNa === void 0 ? '' : _this$props11$classNa,
        onScroll = _this$props11.onScroll,
        locale = _this$props11.locale,
        virtualized = _this$props11.virtualized; // 树节点的层级

    var layer = 0;
    var classes = classNames(defaultClassPrefix('check-tree'), (_classNames2 = {}, _classNames2[className] = inline, _classNames2['without-children'] = !isSomeNodeHasChildren, _classNames2));
    var formattedNodes = [];

    if (!virtualized) {
      formattedNodes = getFormattedTree(filterData, this.nodes, this.props).map(function (node) {
        return _this9.renderNode(node, layer);
      });

      if (!formattedNodes.some(function (v) {
        return v !== null;
      })) {
        return React.createElement("div", {
          className: this.addPrefix('none')
        }, locale.noResultsText);
      }
    } else {
      formattedNodes = this.getFlattenTreeData(filterData).filter(function (n) {
        return n.showNode && n.visible;
      });

      if (!formattedNodes.length) {
        return React.createElement("div", {
          className: this.addPrefix('none')
        }, locale.noResultsText);
      }
    } // 当未定义 height 且 设置了 virtualized 为 true，treeHeight 设置默认高度


    var treeHeight = _.isUndefined(height) && virtualized ? defaultHeight : height;
    var styles = inline ? _extends({
      height: treeHeight
    }, style) : {};
    var treeNodesClass = classNames(this.addTreePrefix('nodes'), (_classNames3 = {}, _classNames3[this.addTreePrefix('all-uncheckable')] = getEveryFisrtLevelNodeUncheckable(this.nodes), _classNames3));
    var ListHeight = getVirtualLisHeight(inline, treeHeight);
    return React.createElement("div", {
      ref: this.treeViewRef,
      className: classes,
      style: styles,
      onScroll: onScroll,
      onKeyDown: this.handleKeyDown
    }, React.createElement("div", {
      className: treeNodesClass
    }, virtualized ? React.createElement(AutoSizer, {
      defaultHeight: ListHeight,
      defaultWidth: defaultWidth
    }, function (_ref3) {
      var height = _ref3.height,
          width = _ref3.width;
      return React.createElement(List, {
        ref: _this9.listRef,
        width: width || defaultWidth,
        height: height || ListHeight,
        rowHeight: 36,
        rowCount: formattedNodes.length,
        rowRenderer: _this9.measureRowRenderer(formattedNodes)
      });
    }) : formattedNodes));
  };

  _proto.render = function render() {
    var _this$props12 = this.props,
        cascade = _this$props12.cascade,
        style = _this$props12.style,
        locale = _this$props12.locale,
        inline = _this$props12.inline,
        disabled = _this$props12.disabled,
        valueKey = _this$props12.valueKey,
        labelKey = _this$props12.labelKey,
        cleanable = _this$props12.cleanable,
        countable = _this$props12.countable,
        placeholder = _this$props12.placeholder,
        toggleComponentClass = _this$props12.toggleComponentClass,
        onExited = _this$props12.onExited,
        onEntered = _this$props12.onEntered,
        onClean = _this$props12.onClean,
        renderValue = _this$props12.renderValue,
        rest = _objectWithoutPropertiesLoose(_this$props12, ["cascade", "style", "locale", "inline", "disabled", "valueKey", "labelKey", "cleanable", "countable", "placeholder", "toggleComponentClass", "onExited", "onEntered", "onClean", "renderValue"]);

    var _this$state8 = this.state,
        hasValue = _this$state8.hasValue,
        selectedValues = _this$state8.selectedValues;
    var classes = getToggleWrapperClassName('check-tree', this.addPrefix, this.props, hasValue);
    var selectedItems = this.getSelectedItems(selectedValues);
    var selectedElement = placeholder;

    if (hasValue && selectedValues.length) {
      selectedElement = React.createElement(SelectedElement, {
        selectedItems: selectedItems,
        countable: countable,
        valueKey: valueKey,
        labelKey: labelKey,
        prefix: this.addPrefix,
        cascade: cascade,
        locale: locale
      });

      if (renderValue) {
        selectedElement = renderValue(selectedValues, selectedItems, selectedElement);
      }
    }

    var unhandled = getUnhandledProps(CheckTreePicker, rest);

    if (inline) {
      return this.renderCheckTree();
    }

    return React.createElement(PickerToggleTrigger, {
      pickerProps: this.props,
      ref: this.triggerRef,
      positionRef: this.positionRef,
      onEntered: createChainedFunction(this.handleOnOpen, onEntered),
      onExit: createChainedFunction(this.handleOnClose, onExited),
      speaker: this.renderDropdownMenu()
    }, React.createElement("div", {
      className: classes,
      style: style
    }, React.createElement(PickerToggle, _extends({}, unhandled, {
      ref: this.toggleRef,
      onKeyDown: this.handleToggleKeyDown,
      onClean: createChainedFunction(this.handleClean, onClean),
      componentClass: toggleComponentClass,
      cleanable: cleanable && !disabled,
      hasValue: hasValue,
      active: this.state.active
    }), selectedElement || locale.placeholder)));
  };

  return CheckTreePicker;
}(React.Component);

CheckTreePicker.propTypes = {
  data: PropTypes.array,
  open: PropTypes.bool,
  block: PropTypes.bool,
  style: PropTypes.object,
  value: PropTypes.array,
  height: PropTypes.number,
  inline: PropTypes.bool,
  locale: PropTypes.object,
  cascade: PropTypes.bool,
  disabled: PropTypes.bool,
  valueKey: PropTypes.string,
  labelKey: PropTypes.string,
  container: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  className: PropTypes.string,
  cleanable: PropTypes.bool,
  countable: PropTypes.bool,
  expandAll: PropTypes.bool,
  placement: PropTypes.oneOf(PLACEMENT),
  searchable: PropTypes.bool,
  appearance: PropTypes.oneOf(['default', 'subtle']),
  virtualized: PropTypes.bool,
  classPrefix: PropTypes.string,
  defaultOpen: PropTypes.bool,
  childrenKey: PropTypes.string,
  placeholder: PropTypes.node,
  preventOverflow: PropTypes.bool,
  defaultValue: PropTypes.array,
  searchKeyword: PropTypes.string,
  menuStyle: PropTypes.object,
  menuClassName: PropTypes.string,
  menuAutoWidth: PropTypes.bool,
  defaultExpandAll: PropTypes.bool,
  containerPadding: PropTypes.number,
  disabledItemValues: PropTypes.array,
  expandItemValues: PropTypes.array,
  defaultExpandItemValues: PropTypes.array,
  uncheckableItemValues: PropTypes.array,
  toggleComponentClass: PropTypes.elementType,
  onOpen: PropTypes.func,
  onExit: PropTypes.func,
  onEnter: PropTypes.func,
  onClose: PropTypes.func,
  onHide: PropTypes.func,
  onSearch: PropTypes.func,
  onChange: PropTypes.func,
  onExpand: PropTypes.func,
  onSelect: PropTypes.func,
  onScroll: PropTypes.func,
  onClean: PropTypes.func,
  onExited: PropTypes.func,
  onEntered: PropTypes.func,
  onExiting: PropTypes.func,
  onEntering: PropTypes.func,
  renderMenu: PropTypes.func,
  renderValue: PropTypes.func,
  renderTreeNode: PropTypes.func,
  renderTreeIcon: PropTypes.func,
  renderExtraFooter: PropTypes.func
};
CheckTreePicker.defaultProps = {
  locale: {
    placeholder: 'Select',
    searchPlaceholder: 'Search',
    noResultsText: 'No results found',
    checkAll: 'All'
  },
  inline: false,
  cascade: true,
  valueKey: 'value',
  labelKey: 'label',
  cleanable: true,
  countable: true,
  placement: 'bottomStart',
  appearance: 'default',
  searchable: true,
  virtualized: false,
  menuAutoWidth: true,
  defaultValue: [],
  childrenKey: 'children',
  defaultExpandAll: false,
  uncheckableItemValues: []
};
polyfill(CheckTreePicker);
var enhance = compose(defaultProps({
  classPrefix: 'picker'
}), withPickerMethods());
export default enhance(CheckTreePicker);