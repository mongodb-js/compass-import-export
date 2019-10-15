import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {STARTED, CANCELED, COMPLETED, FAILED} from 'constants/process-status';

import styles from './progress-bar.less';
import createStyler from 'utils/styler.js';

const style = createStyler(styles, 'progress-bar');

/**
 * The progress bar component.
 */
class ProgressBar extends PureComponent {
  static displayName = 'ProgressBarComponent';

  static propTypes = {
    progress: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    docsWritten: PropTypes.number,
    docsTotal: PropTypes.number, // <==- handle undefined for import
    cancel: PropTypes.func
  };

  /**
   * Get the class name for the bar.
   *
   * @returns {String} The class name.
   */
  getBarClassName() {
    const { status } = this.props;
    return classnames({
      [style('bar')]: true,
      // [style('bar-is-started')]: status === STARTED,
      [style('bar-is-canceled')]: status === CANCELED,
      [style('bar-is-completed')]: status === COMPLETED,
      [style('bar-is-failed')]: status === FAILED
    });
  }
  getMessageClassName() {
    return classnames({
      [style('status-message')]: true,
      [style('status-message-is-failed')]: this.props.status === FAILED
    });
  }

  formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  }

  maybeCancelButton() {
    if (this.props.status !== STARTED) {
      return null;
    }

    return (
      // eslint-disable-next-line no-script-url
      <a className={style('status-message-cancel')} onClick={(evt)=> {
        evt.stopPropagation();
        evt.preventDefault();
        this.props.cancel();
      }}>Cancel</a>
    );
  }

  renderStats() {
    const { docsTotal, docsWritten, progress } = this.props;
    // TODO: lucas: This is explicitly handling import case where
    // we don't know the exact number of documents to expect.
    // Could use the estimate set in modules/import progress?
    if (docsTotal === undefined) {
      return (
        <p className={style('status-stats')}>
          {this.formatNumber(docsWritten)}
          ({this.formatNumber(progress)}%)
        </p>
      );
    }
    return (
      <p className={style('status-stats')}>
        {this.formatNumber(docsWritten)}/{this.formatNumber(docsTotal)}
        ({this.formatNumber(progress)}%)
      </p>
    );
  }

  /**
   * Render the component.
   *
   * @returns {React.Component} The component.
   */
  render() {
    const {message, docsTotal, docsWritten, progress} = this.props;

    return (
      <div>
        <div className={style()}>
          <div
            className={this.getBarClassName()}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles['progress-bar-status']}>
          <p className={this.getMessageClassName()}>
            {message}{this.maybeCancelButton()}
          </p>
          {this.renderStats()}
        </div>
      </div>
    );
  }
}

export default ProgressBar;
