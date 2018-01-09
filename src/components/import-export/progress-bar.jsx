import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  progress: PropTypes.number.isRequired
};

const ProgressBar = ({ progress }) => (<h3>{ progress === 100 ? 'Complete!' : progress.toFixed(2) + '%' }</h3>);

ProgressBar.propTypes = propTypes;

export default ProgressBar;
