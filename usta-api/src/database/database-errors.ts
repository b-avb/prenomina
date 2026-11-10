import { AppError, BadRequestError, ConflictError } from '../utils/app-error.js';

interface MysqlDriverError {
  errno: number;
  sqlMessage?: string;
}

function isMysqlDriverError(error: unknown): error is MysqlDriverError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errno' in error &&
    typeof (error as { errno: unknown }).errno === 'number' &&
    'sqlState' in error
  );
}

const ER_DUP_ENTRY = 1062;
const ER_ROW_IS_REFERENCED_2 = 1451;
const ER_NO_REFERENCED_ROW_2 = 1452;
const ER_DATA_TOO_LONG = 1406;
const ER_TRUNCATED_WRONG_VALUE = 1366;
const WARN_DATA_TRUNCATED = 1265;

/**
 * Translates integrity-constraint errors raised by MariaDB into API errors.
 * Returns `null` for anything else so the caller treats it as an internal failure.
 */
export function translateDatabaseError(error: unknown): AppError | null {
  if (!isMysqlDriverError(error)) return null;
  switch (error.errno) {
    case ER_DUP_ENTRY:
      return new ConflictError('Ya existe un registro con los mismos datos únicos.');
    case ER_ROW_IS_REFERENCED_2:
      return new ConflictError('El registro está en uso por otros datos y no puede eliminarse.');
    case ER_NO_REFERENCED_ROW_2:
      return new ConflictError('La operación referencia un registro inexistente.');
    case ER_DATA_TOO_LONG:
      return new BadRequestError('Uno de los valores excede la longitud máxima permitida.');
    case ER_TRUNCATED_WRONG_VALUE:
    case WARN_DATA_TRUNCATED:
      return new BadRequestError('Uno de los valores no es válido para el campo indicado.');
    default:
      return null;
  }
}
