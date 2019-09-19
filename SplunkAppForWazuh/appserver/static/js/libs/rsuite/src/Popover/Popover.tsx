import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { prefix, defaultProps } from '../utils';
import { PopoverProps } from './Popover.d';

class Popover extends React.Component<PopoverProps> {
  static propTypes = {
    classPrefix: PropTypes.string,
    children: PropTypes.node,
    title: PropTypes.node,
    style: PropTypes.object,
    visible: PropTypes.bool,
    className: PropTypes.string,
    full: PropTypes.bool,
    onMouseLeave: PropTypes.func,
    onMouseEnter: PropTypes.func
  };
  render() {
    const {
      classPrefix,
      title,
      children,
      style,
      visible,
      className,
      full,
      onMouseLeave,
      onMouseEnter
    } = this.props;

    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('full')]: full
    });

    const styles = {
      display: 'block',
      opacity: visible ? 1 : undefined,
      ...style
    };

    return (
      <div
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        className={classes}
        style={styles}
      >
        <div className="arrow" />
        {title ? <h3 className={addPrefix('title')}>{title}</h3> : null}
        <div className={addPrefix('content')}>{children}</div>
      </div>
    );
  }
}

export default defaultProps<PopoverProps>({
  classPrefix: 'popover'
})(Popover);
