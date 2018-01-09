import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  importHandler: PropTypes.func.isRequired
};

const ImportButton = ({ importHandler }) => (<button onClick={ importHandler }>Import</button>);

ImportButton.propTypes = propTypes;

export default ImportButton;
