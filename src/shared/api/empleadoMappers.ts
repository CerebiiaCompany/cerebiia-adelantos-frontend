import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";
import type {
  CreateEmpleadoRequest,
  TipoContratoEmpleado,
  TipoCuentaEmpleado,
  TipoDocumento,
} from "./types/empleado";

const TIPO_DOCUMENTO_MAP: Record<string, TipoDocumento> = {
  CC: "cc",
  CE: "ce",
  PASSPORT: "pas",
  PPT: "ce",
};

export function mapTipoDocumentoToApi(value: string): TipoDocumento {
  return TIPO_DOCUMENTO_MAP[value] ?? "cc";
}

export function mapCreateEmpleadoFormToRequest(
  values: CreateEmpleadoFormValues,
): CreateEmpleadoRequest {
  return {
    tipo_documento: mapTipoDocumentoToApi(values.tipo_documento),
    documento: values.documento,
    nombre: values.nombre,
    email: values.correo,
    celular: values.celular,
    salario: values.salario,
    tipo_contrato: values.tipo_contrato as TipoContratoEmpleado,
    fecha_ingreso: values.fecha_ingreso,
    banco_id: values.banco_id,
    tipo_cuenta: values.tipo_cuenta as TipoCuentaEmpleado,
    numero_cuenta: values.numero_cuenta,
  };
}
