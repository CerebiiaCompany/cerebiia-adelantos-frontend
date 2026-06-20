// ⚠️ AGNOSTIC — employer audit business rules

export const ADVANCE_FEE_RATE = 0.025;
export const ADVANCE_SALARY_CAP_RATIO = 0.3;

export function calculateAdvanceFee(amount: number): number {
  return Math.round(amount * ADVANCE_FEE_RATE);
}

/** Total que la empresa descuenta en nómina (solo el valor del adelanto). */
export function calculateTotalWithholding(amount: number): number {
  return amount;
}

export function calculateSalaryPercentage(
  amount: number,
  baseSalary: number,
): number {
  if (baseSalary <= 0) return 0;
  return (amount / baseSalary) * 100;
}

export function exceedsSalaryCap(amount: number, baseSalary: number): boolean {
  return (
    calculateSalaryPercentage(amount, baseSalary) >
    ADVANCE_SALARY_CAP_RATIO * 100
  );
}
