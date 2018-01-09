import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  exportHandler: PropTypes.func.isRequired
};

const ExportButton = ({ exportHandler }) => (
  <button onClick={exportHandler}>Export</button>
);

ExportButton.propTypes = propTypes;

export default ExportButton;
