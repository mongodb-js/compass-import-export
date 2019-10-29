import Plugin from './plugin';
import ImportPlugin from './import-plugin';
import ExportPlugin from './export-plugin';
import configureStore from 'stores';

/**
 * The import plugin.
 */
const IMPORT_ROLE = {
  name: 'Import',
  component: ImportPlugin,
  configureStore: configureStore,
  configureActions: () => {},
  storeName: 'Import.Store'
};

/**
 * The export plugin.
 */
const EXPORT_ROLE = {
  name: 'Export',
  component: ExportPlugin,
  configureStore: configureStore,
  configureActions: () => {},
  storeName: 'Export.Store'
};

/**
 * Activate all the components in the Import Export package.
 * @param {Object} appRegistry - The Hadron appRegisrty to activate this plugin with.
 **/
function activate(appRegistry) {
  appRegistry.registerRole('Global.Modal', IMPORT_ROLE);
  appRegistry.registerRole('Global.Modal', EXPORT_ROLE);
  appRegistry.registerStore(
    'Export.Store',
    configureStore({ localAppRegistry: appRegistry })
  );
}

/**
 * Deactivate all the components in the Import Export package.
 * @param {Object} appRegistry - The Hadron appRegisrty to deactivate this plugin with.
 **/
function deactivate(appRegistry) {
  appRegistry.deregisterRole('Global.Modal', IMPORT_ROLE);
  appRegistry.deregisterRole('Global.Modal', EXPORT_ROLE);
}

export default Plugin;
export { activate, deactivate, ImportPlugin, ExportPlugin, configureStore };
