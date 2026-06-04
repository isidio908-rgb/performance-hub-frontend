import type { DashboardKpis } from "@/types";

// O backend pode retornar variações pequenas de nome de campo
// (whatsappClick vs whatsappClicks, formSubmit vs formSubmits, etc.)
// e às vezes embrulha tudo em { data: {...} }.
// Esta função normaliza a forma para o que a UI espera, sem inventar dados.
export function normalizeDashboardKpis(raw: unknown): DashboardKpis {
  if (!raw || typeof raw !== "object") return {};
  const root = raw as Record<string, unknown>;
  const src =
    root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;

  const num = (...keys: string[]): number | undefined => {
    for (const k of keys) {
      const v = src[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) {
        return Number(v);
      }
    }
    return undefined;
  };

  return {
    pageViews: num("pageViews", "pageviews", "page_views", "views"),
    events: num("events", "totalEvents", "eventCount"),
    leads: num("leads", "totalLeads"),
    whatsappClick: num("whatsappClick", "whatsappClicks", "whatsapp_clicks"),
    formSubmit: num("formSubmit", "formSubmits", "form_submits"),
    addToCart: num("addToCart", "addToCarts", "add_to_cart"),
    checkouts: num("checkouts", "checkout", "initiateCheckout"),
    purchases: num("purchases", "purchase", "orders"),
    revenue: num("revenue", "totalRevenue", "gmv"),
    averageTicket: num("averageTicket", "avgTicket", "average_ticket", "aov"),
    conversionRate: num("conversionRate", "conversion_rate", "conversion"),
  };
}
