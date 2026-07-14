import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";
import type { DocumentType } from "@/shared/validations/register.schema";
import type {
  CreateEmpleadoRequest,
  EmpleadoDTO,
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

const TIPO_DOCUMENTO_FROM_API: Record<TipoDocumento, DocumentType> = {
  cc: "CC",
  ce: "CE",
  ti: "CC",
  pas: "PASSPORT",
};

export function mapTipoDocumentoToApi(value: string): TipoDocumento {
  return TIPO_DOCUMENTO_MAP[value] ?? "cc";
}

export function mapTipoDocumentoFromApi(
  value: TipoDocumento | string,
): DocumentType {
  return TIPO_DOCUMENTO_FROM_API[value as TipoDocumento] ?? "CC";
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

export function mapEmpleadoDtoToFormValues(
  empleado: EmpleadoDTO,
): CreateEmpleadoFormValues {
  return {
    tipo_documento: mapTipoDocumentoFromApi(empleado.tipo_documento),
    documento: empleado.documento,
    nombre: empleado.nombre,
    correo: empleado.email_empleado ?? "",
    celular: empleado.celular ?? "",
    salario: empleado.salario,
    tipo_contrato: empleado.tipo_contrato,
    fecha_ingreso: empleado.fecha_ingreso?.slice(0, 10) ?? "",
    banco_id: empleado.banco_id,
    tipo_cuenta: empleado.tipo_cuenta,
    numero_cuenta: empleado.numero_cuenta,
  };
}
