import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { SchemaModel } from 'schema-typed';
import classNames from 'classnames';
import { shallowEqual } from 'rsuite-utils/lib/utils';
import { getUnhandledProps, prefix } from '../utils';
import { defaultClassPrefix } from '../utils/prefix';
import FormContext, { FormValueContext, FormErrorContext } from './FormContext';

function preventDefaultEvent(event) {
  event.preventDefault();
}

var Form =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Form, _React$Component);

  function Form(_props) {
    var _this;

    _this = _React$Component.call(this, _props) || this;
    _this.formContextValue = null;

    _this.getFormValue = function (state, props) {
      if (state === void 0) {
        state = _this.state;
      }

      if (props === void 0) {
        props = _this.props;
      }

      return _.isUndefined(props.formValue) ? state.formValue : props.formValue;
    };

    _this.getFormError = function (state, props) {
      if (state === void 0) {
        state = _this.state;
      }

      if (props === void 0) {
        props = _this.props;
      }

      return _.isUndefined(props.formError) ? state.formError : props.formError;
    };

    _this.check = function (callback) {
      var formValue = _this.getFormValue() || {};
      var _this$props = _this.props,
          model = _this$props.model,
          onCheck = _this$props.onCheck,
          onError = _this$props.onError;
      var formError = {};
      var errorCount = 0;
      Object.keys(model.schema).forEach(function (key) {
        var checkResult = model.checkForField(key, formValue[key], formValue);

        if (checkResult.hasError === true) {
          errorCount += 1;
          formError[key] = checkResult.errorMessage;
        }
      });

      _this.setState({
        formError: formError
      });

      onCheck && onCheck(formError);
      callback && callback(formError);

      if (errorCount > 0) {
        onError && onError(formError);
        return false;
      }

      return true;
    };

    _this.checkForField = function (fieldName, callback) {
      var formValue = _this.getFormValue() || {};
      var _this$props2 = _this.props,
          model = _this$props2.model,
          onCheck = _this$props2.onCheck,
          onError = _this$props2.onError;
      var checkResult = model.checkForField(fieldName, formValue[fieldName], formValue);

      _this.setState(function (prvState, props) {
        var _extends2;

        var formError = _extends({}, _this.getFormError(prvState, props), (_extends2 = {}, _extends2[fieldName] = checkResult.errorMessage, _extends2));

        onCheck && onCheck(formError);
        checkResult.hasError && onError && onError(formError);
        return {
          formError: formError
        };
      });

      callback && callback(checkResult);
      return !checkResult.hasError;
    };

    _this.checkAsync = function () {
      var formValue = _this.getFormValue() || {};
      var _this$props3 = _this.props,
          model = _this$props3.model,
          onCheck = _this$props3.onCheck,
          onError = _this$props3.onError;
      var promises = [];
      var keys = [];
      Object.keys(model.schema).forEach(function (key) {
        keys.push(key);
        promises.push(model.checkForFieldAsync(key, formValue[key], formValue));
      });
      return Promise.all(promises).then(function (values) {
        var formError = {};
        var errorCount = 0;

        for (var i = 0; i < values.length; i++) {
          if (values[i].hasError) {
            errorCount += 1;
            formError[keys[i]] = values[i].errorMessage;
          }
        }

        onCheck && onCheck(formError);

        if (errorCount > 0) {
          onError && onError(formError);
        }

        _this.setState({
          formError: formError
        });

        return {
          hasError: errorCount > 0,
          formError: formError
        };
      });
    };

    _this.checkForFieldAsync = function (fieldName) {
      var formValue = _this.getFormValue() || {};
      var _this$props4 = _this.props,
          model = _this$props4.model,
          onCheck = _this$props4.onCheck,
          onError = _this$props4.onError;
      return model.checkForFieldAsync(fieldName, formValue[fieldName], formValue).then(function (checkResult) {
        _this.setState(function (prvState, props) {
          var _extends3;

          var formError = _extends({}, _this.getFormError(prvState, props), (_extends3 = {}, _extends3[fieldName] = checkResult.errorMessage, _extends3));

          onCheck && onCheck(formError);
          checkResult.hasError && onError && onError(formError);
          return {
            formError: formError
          };
        });

        return checkResult;
      });
    };

    _this.handleFieldError = function (name, errorMessage) {
      var _this$props5 = _this.props,
          onError = _this$props5.onError,
          onCheck = _this$props5.onCheck;

      _this.setState(function (prvState, props) {
        var _extends4;

        var formError = _extends({}, _this.getFormError(prvState, props), (_extends4 = {}, _extends4[name] = errorMessage, _extends4));

        onError && onError(formError);
        onCheck && onCheck(formError);
        return {
          formError: formError
        };
      });
    };

    _this.handleFieldSuccess = function (name) {
      var onCheck = _this.props.onCheck;

      _this.setState(function (prvState, props) {
        var formError = _.omit(_this.getFormError(prvState, props), [name]);

        onCheck && onCheck(formError);
        return {
          formError: formError
        };
      });
    };

    _this.handleFieldChange = function (name, value, event) {
      var _extends5;

      var onChange = _this.props.onChange;

      var formValue = _this.getFormValue();

      var nextFormValue = _extends({}, formValue, (_extends5 = {}, _extends5[name] = value, _extends5));

      _this.setState({
        formValue: nextFormValue
      });

      onChange && onChange(nextFormValue, event);
    };

    var _this$props6 = _this.props,
        formDefaultValue = _this$props6.formDefaultValue,
        _formError = _this$props6.formError;
    _this.state = {
      formError: _formError || {},
      formValue: formDefaultValue
    };
    return _this;
  }

  var _proto = Form.prototype;

  /**
   * public APIs
   */
  _proto.cleanErrors = function cleanErrors(callback) {
    this.setState({
      formError: {}
    }, callback);
  }
  /**
   * public APIs
   */
  ;

  _proto.cleanErrorForFiled = function cleanErrorForFiled(fieldName, callback) {
    this.setState({
      formError: _.omit(this.state.formError, [fieldName])
    }, callback);
  }
  /**
   * public APIs
   */
  ;

  _proto.resetErrors = function resetErrors(formError, callback) {
    if (formError === void 0) {
      formError = {};
    }

    this.setState({
      formError: formError
    }, callback);
  };

  _proto.getFormContextValue = function getFormContextValue() {
    var _this$props7 = this.props,
        formDefaultValue = _this$props7.formDefaultValue,
        errorFromContext = _this$props7.errorFromContext,
        model = _this$props7.model,
        checkTrigger = _this$props7.checkTrigger,
        readOnly = _this$props7.readOnly,
        plaintext = _this$props7.plaintext;
    var nextFormContextValue = {
      model: model,
      checkTrigger: checkTrigger,
      formDefaultValue: formDefaultValue,
      errorFromContext: errorFromContext,
      readOnly: readOnly,
      plaintext: plaintext,
      onFieldChange: this.handleFieldChange,
      onFieldError: this.handleFieldError,
      onFieldSuccess: this.handleFieldSuccess
    };

    if (!shallowEqual(nextFormContextValue, this.formContextValue)) {
      this.formContextValue = nextFormContextValue;
    }

    return this.formContextValue;
  };

  _proto.checkErrorFromContext = function checkErrorFromContext(children) {
    var errorFromContext = this.props.errorFromContext;

    if (errorFromContext) {
      var formError = this.getFormError();
      return React.createElement(FormErrorContext.Provider, {
        value: formError
      }, children);
    }

    return children;
  };

  _proto.render = function render() {
    var _this$props8 = this.props,
        _this$props8$formValu = _this$props8.formValue,
        formValue = _this$props8$formValu === void 0 ? {} : _this$props8$formValu,
        layout = _this$props8.layout,
        classPrefix = _this$props8.classPrefix,
        fluid = _this$props8.fluid,
        className = _this$props8.className,
        children = _this$props8.children,
        props = _objectWithoutPropertiesLoose(_this$props8, ["formValue", "layout", "classPrefix", "fluid", "className", "children"]);

    var addPrefix = prefix(classPrefix);
    var classes = classNames(classPrefix, className, addPrefix(layout), addPrefix(fluid && layout === 'vertical' ? 'fluid' : 'fixed-width'));
    var unhandled = getUnhandledProps(Form, props);
    var contextDefalutValue = this.getFormContextValue();
    return React.createElement("form", _extends({
      onSubmit: preventDefaultEvent
    }, unhandled, {
      className: classes
    }), React.createElement(FormContext.Provider, {
      value: contextDefalutValue
    }, React.createElement(FormValueContext.Provider, {
      value: formValue
    }, this.checkErrorFromContext(children))));
  };

  return Form;
}(React.Component);

Form.propTypes = {
  className: PropTypes.string,
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
  fluid: PropTypes.bool,
  formValue: PropTypes.object,
  formDefaultValue: PropTypes.object,
  formError: PropTypes.object,
  checkDelay: PropTypes.number,
  checkTrigger: PropTypes.oneOf(['change', 'blur', 'none']),
  onChange: PropTypes.func,
  onError: PropTypes.func,
  onCheck: PropTypes.func,
  model: PropTypes.object,
  classPrefix: PropTypes.string,
  errorFromContext: PropTypes.bool,
  children: PropTypes.node,
  readOnly: PropTypes.bool,
  plaintext: PropTypes.bool
};
Form.defaultProps = {
  classPrefix: defaultClassPrefix('form'),
  model: SchemaModel({}),
  layout: 'vertical',
  formDefaultValue: {},
  checkDelay: 500,
  checkTrigger: 'change',
  errorFromContext: true
};
export default Form;