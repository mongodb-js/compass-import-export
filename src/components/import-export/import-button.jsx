import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onClick: PropTypes.func.isRequired
};

const ImportButton = (props) => (<button { ...props }>Import</button>);

ImportButton.propTypes = propTypes;

export default ImportButton;
