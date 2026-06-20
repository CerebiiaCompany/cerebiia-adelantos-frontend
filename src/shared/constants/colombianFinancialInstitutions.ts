// ⚠️ AGNOSTIC — bancos y plataformas de pago vigentes en Colombia

export interface FinancialInstitutionOption {
  value: string;
  label: string;
}

export interface FinancialInstitutionGroup {
  label: string;
  options: FinancialInstitutionOption[];
}

export const COLOMBIAN_FINANCIAL_INSTITUTION_GROUPS: FinancialInstitutionGroup[] =
  [
    {
      label: "Bancos",
      options: [
        { value: "Bancolombia", label: "Bancolombia" },
        { value: "Banco de Bogotá", label: "Banco de Bogotá" },
        { value: "Davivienda", label: "Davivienda" },
        { value: "BBVA Colombia", label: "BBVA Colombia" },
        { value: "Scotiabank Colpatria", label: "Scotiabank Colpatria" },
        { value: "Itaú Colombia", label: "Itaú Colombia" },
        { value: "Banco Agrario de Colombia", label: "Banco Agrario de Colombia" },
        { value: "Banco de Occidente", label: "Banco de Occidente" },
        { value: "Banco Popular", label: "Banco Popular" },
        { value: "Banco AV Villas", label: "Banco AV Villas" },
        { value: "Banco Caja Social", label: "Banco Caja Social" },
        { value: "Banco GNB Sudameris", label: "Banco GNB Sudameris" },
        { value: "Banco Pichincha", label: "Banco Pichincha" },
        { value: "Banco Falabella", label: "Banco Falabella" },
        { value: "Banco Finandina", label: "Banco Finandina" },
        { value: "Banco W", label: "Banco W" },
        { value: "Banco Mundo Mujer", label: "Banco Mundo Mujer" },
        { value: "Banco Serfinanza", label: "Banco Serfinanza" },
        { value: "Lulo Bank", label: "Lulo Bank" },
        { value: "Banco Cooperativo Coopcentral", label: "Banco Cooperativo Coopcentral" },
        { value: "Bancamía", label: "Bancamía" },
        { value: "Banco Santander Colombia", label: "Banco Santander Colombia" },
        { value: "Citibank Colombia", label: "Citibank Colombia" },
        { value: "Banco BTG Pactual Colombia", label: "Banco BTG Pactual Colombia" },
        { value: "Banco J.P. Morgan Colombia", label: "Banco J.P. Morgan Colombia" },
        { value: "Bancoomeva", label: "Bancoomeva" },
        { value: "Banco Credifinanciera", label: "Banco Credifinanciera" },
        { value: "Banco Compartir", label: "Banco Compartir" },
        { value: "Banco Juriscoop", label: "Banco Juriscoop" },
        { value: "Banco Cootrafa", label: "Banco Cootrafa" },
        { value: "Banco Unión", label: "Banco Unión" },
        { value: "Banco Santander de Negocios Colombia", label: "Banco Santander de Negocios Colombia" },
        { value: "Banco ProCredit Colombia", label: "Banco ProCredit Colombia" },
      ],
    },
    {
      label: "Billeteras y plataformas digitales",
      options: [
        { value: "Nequi", label: "Nequi" },
        { value: "Daviplata", label: "Daviplata" },
        { value: "Dale!", label: "Dale!" },
        { value: "Movii", label: "Movii" },
        { value: "RappiPay", label: "RappiPay" },
        { value: "Mercado Pago", label: "Mercado Pago" },
        { value: "Tpaga", label: "Tpaga" },
        { value: "Nu Colombia", label: "Nu Colombia" },
        { value: "Powwi", label: "Powwi" },
        { value: "Ualá", label: "Ualá" },
      ],
    },
  ];

export const COLOMBIAN_FINANCIAL_INSTITUTION_VALUES =
  COLOMBIAN_FINANCIAL_INSTITUTION_GROUPS.flatMap((group) =>
    group.options.map((option) => option.value),
  );

export function isColombianFinancialInstitution(value: string): boolean {
  return COLOMBIAN_FINANCIAL_INSTITUTION_VALUES.includes(value);
}
