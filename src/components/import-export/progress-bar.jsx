import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  progress: PropTypes.number.isRequired
};

const ProgressBar = ({ progress }) => (<span>{ progress === 100 ? 'Complete!' : progress.toFixed(2) + '%' }</span>);

ProgressBar.propTypes = propTypes;

export default ProgressBar;
