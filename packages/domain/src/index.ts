/**
 * Shared domain model, normative workload/validation engines, and HTTP API
 * contracts for the USTA Tunja faculty payroll platform. Zero I/O dependencies.
 */
export * from './types/payroll.types.js';
export * from './ports/id-generator.js';
export * from './workload-calculator.domain.js';
export * from './workload-balancer.domain.js';
export * from './academic-organization.domain.js';
export * from './validation-engine.domain.js';
export * from './contracts/api.contract.js';
