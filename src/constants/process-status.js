export const STARTED = 'STARTED';
export const CANCELED = 'CANCELED';
export const COMPLETED = 'COMPLETED';
export const FAILED = 'FAILED';

/**
 * Process status constants.
 */
export const PROCESS_STATUS = {
  STARTED,
  CANCELED,
  COMPLETED,
  FAILED,
  UNSPECIFIED: 'UNSPECIFIED',
  INTERRUPTED: 'INTERRUPTED'
};

/**
 * The finished statuses.
 */
export const FINISHED_STATUSES = [
  CANCELED,
  COMPLETED,
  FAILED
];

export default PROCESS_STATUS;
