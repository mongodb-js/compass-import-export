/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import FieldTable from 'components/field-table';

storiesOf('Examples/FieldTable', module).add('default', () => {
  return (
    <FieldTable
      fields={[
        { key: '_id', type: 'ObjectId', checked: true },
        { key: 'name', type: 'String', checked: false },
        { key: 'i.have.dots', type: 'String', checked: true }
      ]}
      onCheckedToggled={t => window.alert(`Check toggled ${t}`)}
      onFieldAdded={t => window.alert(`Field added ${t}`)}
    />
  );
});
