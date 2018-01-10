import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onClick: PropTypes.func.isRequired
};

const ExportButton = (props) => (
  <button { ...props }>Export</button>
);

ExportButton.propTypes = propTypes;

export default ExportButton;
