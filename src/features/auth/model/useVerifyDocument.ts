import { useMutation } from "@tanstack/react-query";
import { authEndpoints } from "@/shared/api/endpoints";
import type { VerifyDocumentRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { demoVerifyDocument } from "./registerDemo";

export function useVerifyDocument() {
  return useMutation({
    mutationFn: async (data: VerifyDocumentRequest) => {
      if (env.apiUrl) {
        return authEndpoints.verifyDocument(data);
      }
      return demoVerifyDocument(data);
    },
  });
}
