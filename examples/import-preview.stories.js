/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import ImportPreview from 'components/import-preview';

storiesOf('Examples/ImportPreview', module).add('simple', () => {
  return (
    <ImportPreview
      headers={[
        {
          path: '_id',
          type: 'string',
          checked: true
        },
        {
          path: 'name',
          type: 'string',
          checked: true
        },
        {
          path: 'stats.age',
          type: 'string',
          checked: true
        },
        {
          path: 'stats.fluffiness',
          type: 'string',
          checked: true
        }
      ]}
      docs={[
        {
          _id: 'arlo',
          name: 'Arlo',
          stats: {
            age: 5,
            fluffiness: ''
          }
        },
        {
          _id: 'basilbazel',
          name: 'Basil',
          stats: {
            age: 8,
            fluffiness: '100'
          }
        },
        {
          _id: 'hellbeast',
          name: 'Kochka',
          stats: {
            age: '14',
            fluffiness: 50
          }
        }
      ]}
    />
  );
});
