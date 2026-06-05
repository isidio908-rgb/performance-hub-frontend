import type { DiagnosticSection, DiagnosticsSummary } from "@/hooks/useSystemDiagnostics";

export interface DiagnosticsExportPayload {
  generatedAt: string;
  app: {
    origin: string | null;
    href: string | null;
  };
  api: {
    baseUrlMasked: string;
    configured: boolean;
    mixedContent: boolean;
    httpsPage: boolean;
    httpApi: boolean;
  };
  user: {
    id: string | null;
    emailMasked: string | null;
  };
  selection: {
    clientId: string | null;
    projectId: string | null;
  };
  summary: DiagnosticsSummary;
  sections: DiagnosticSection[];
}

/** Mascara um valor textual mantendo prefixo/sufixo curtos. */
export function maskSensitive(value: string | null | undefined, visible = 3): string | null {
  if (!value) return null;
  if (value.length <= visible * 2) return "***";
  return `${value.slice(0, visible)}***${value.slice(-visible)}`;
}

/** Mascara um email preservando domínio. */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.indexOf("@");
  if (at <= 0) return maskSensitive(email);
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const maskedLocal = local.length <= 2 ? "***" : `${local.slice(0, 2)}***`;
  return `${maskedLocal}${domain}`;
}

/** Mascara URL preservando protocolo, primeiros e últimos chars do host. */
export function maskUrl(url: string | null | undefined): string {
  if (!url) return "(vazio)";
  try {
    const u = new URL(url);
    const host = u.hostname;
    const masked = host.length > 6 ? host.slice(0, 3) + "***" + host.slice(-3) : "***";
    return `${u.protocol}//${masked}${u.port ? ":" + u.port : ""}`;
  } catch {
    return url.length > 12 ? `${url.slice(0, 6)}***${url.slice(-3)}` : "***";
  }
}

interface BuildPayloadInput {
  baseUrl: string;
  apiEnv: {
    configured: boolean;
    mixedContent: boolean;
    httpsPage: boolean;
    httpApi: boolean;
  };
  user: { id?: string; email?: string } | null | undefined;
  clientId: string | null;
  projectId: string | null;
  summary: DiagnosticsSummary;
  sections: DiagnosticSection[];
}

export function buildDiagnosticsExportPayload(input: BuildPayloadInput): DiagnosticsExportPayload {
  return {
    generatedAt: new Date().toISOString(),
    app: {
      origin: typeof window !== "undefined" ? window.location.origin : null,
      href: typeof window !== "undefined" ? window.location.href : null,
    },
    api: {
      baseUrlMasked: maskUrl(input.baseUrl),
      configured: input.apiEnv.configured,
      mixedContent: input.apiEnv.mixedContent,
      httpsPage: input.apiEnv.httpsPage,
      httpApi: input.apiEnv.httpApi,
    },
    user: {
      id: input.user?.id ?? null,
      emailMasked: maskEmail(input.user?.email ?? null),
    },
    selection: {
      clientId: input.clientId,
      projectId: input.projectId,
    },
    summary: input.summary,
    sections: input.sections,
  };
}

/** Copia texto para o clipboard. Retorna true em caso de sucesso. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback abaixo */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Dispara download de um payload JSON. */
export function downloadJson(filename: string, payload: unknown): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
