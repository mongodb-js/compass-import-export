import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  progress: PropTypes.number.isRequired,
  complete: PropTypes.bool,
  canceled: PropTypes.bool
};

const ProgressBar = ({ progress, complete, canceled }) => (
  <span>
    { (complete || canceled) ? <span>{ complete ? 'Complete' : 'Canceled' }</span> : null }
    { !(complete || canceled) ? progress.toFixed(2) + '%' : null }
  </span>
);

ProgressBar.propTypes = propTypes;

export default ProgressBar;
