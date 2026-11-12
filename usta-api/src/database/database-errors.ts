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
      return new ConflictError('Ya existe un registro con esa misma identificación.');
    case ER_ROW_IS_REFERENCED_2:
      return new ConflictError('No se puede eliminar este registro porque tiene información asociada.');
    case ER_NO_REFERENCED_ROW_2:
      return new ConflictError('Uno de los datos asociados ya no se encuentra disponible.');
    case ER_DATA_TOO_LONG:
      return new BadRequestError('Uno de los campos supera la longitud máxima permitida.');
    case ER_TRUNCATED_WRONG_VALUE:
    case WARN_DATA_TRUNCATED:
      return new BadRequestError('Uno de los valores ingresados no es válido.');
    default:
      return null;
  }
}
