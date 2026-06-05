export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface Client {
  id: string;
  name: string;
  document?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    projects?: number;
  };
  projectsCount?: number;
}

export type ProjectStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export type AttributionModel =
  | "FIRST_TOUCH"
  | "LAST_TOUCH"
  | "LINEAR"
  | "POSITION_BASED_40_20_40"
  | "TIME_DECAY";

export interface Project {
  id: string;
  clientId: string;
  ownerId?: string;
  name: string;
  domain?: string | null;
  status?: ProjectStatus;
  trackingKey?: string;
  attributionModel?: AttributionModel;
  attributionWindowDays?: number;
  sessionTimeoutMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
  client?: {
    id: string;
    name: string;
  };
  _count?: {
    events?: number;
    leads?: number;
    purchases?: number;
  };
  eventsCount?: number;
  leadsCount?: number;
  purchasesCount?: number;
}

export interface CreateClientInput {
  name: string;
  document?: string;
  notes?: string;
}
export type UpdateClientInput = Partial<CreateClientInput>;

export interface CreateProjectInput {
  clientId: string;
  name: string;
  domain?: string;
  attributionModel?: AttributionModel;
  attributionWindowDays?: number;
  sessionTimeoutMinutes?: number;
}
export type UpdateProjectInput = Partial<CreateProjectInput> & {
  status?: ProjectStatus;
};

// Forma normalizada usada pela UI. Backend pode retornar variações.
export interface DashboardKpis {
  pageViews?: number;
  events?: number;
  leads?: number;
  whatsappClick?: number;
  formSubmit?: number;
  addToCart?: number;
  checkouts?: number;
  purchases?: number;
  revenue?: number;
  averageTicket?: number;
  conversionRate?: number;
  [k: string]: number | undefined;
}

export type EventType =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "WhatsAppClick"
  | "FormSubmit";

export interface AnalyticsEvent {
  id: string;
  projectId?: string;
  type: EventType | string;
  name?: string | null;
  visitorId?: string;
  sessionId?: string;
  currentUrl?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  createdAt?: string;
}

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST" | string;

export interface Lead {
  id: string;
  projectId?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  status?: LeadStatus | null;
  visitorId?: string | null;
  sessionId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  createdAt?: string;
  [k: string]: unknown;
}

export interface PurchaseItem {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number;
}

export interface Purchase {
  id: string;
  projectId?: string;
  orderId?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  total?: number | null;
  amount?: number | null;
  currency?: string | null;
  items?: PurchaseItem[];
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  status?: string | null;
  createdAt?: string;
  [k: string]: unknown;
}

// ===== Fase 5 — Analytics avançado =====

export interface RevenueTimelinePoint {
  date?: string;
  day?: string;
  timestamp?: string;
  revenue?: number;
  total?: number;
  purchases?: number;
  count?: number;
  [k: string]: unknown;
}

export interface FunnelStep {
  name?: string;
  label?: string;
  type?: string;
  count?: number;
  value?: number;
  conversionRate?: number;
  [k: string]: unknown;
}

export interface FunnelSummary {
  steps?: FunnelStep[];
  pageViews?: number;
  viewContent?: number;
  addToCart?: number;
  initiateCheckout?: number;
  purchase?: number;
  leads?: number;
  conversionRate?: number;
  [k: string]: unknown;
}

export interface RevenueByChannelItem {
  channel?: string;
  source?: string;
  utmSource?: string;
  name?: string;
  revenue?: number;
  total?: number;
  purchases?: number;
  count?: number;
  [k: string]: unknown;
}

export interface RevenueByCampaignItem {
  campaign?: string;
  utmCampaign?: string;
  name?: string;
  source?: string;
  channel?: string;
  revenue?: number;
  total?: number;
  purchases?: number;
  count?: number;
  [k: string]: unknown;
}

export interface AttributionSummary {
  model?: AttributionModel | string;
  totalConversions?: number;
  totalRevenue?: number;
  channels?: Array<Record<string, unknown>>;
  [k: string]: unknown;
}

export interface ConversionPathStep {
  channel?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  type?: string;
  [k: string]: unknown;
}

export interface ConversionPath {
  id?: string;
  path?: ConversionPathStep[] | string[];
  steps?: ConversionPathStep[];
  channels?: string[];
  count?: number;
  conversions?: number;
  revenue?: number;
  total?: number;
  [k: string]: unknown;
}

export interface AssistedChannel {
  channel?: string;
  source?: string;
  utmSource?: string;
  name?: string;
  assistedConversions?: number;
  assisted?: number;
  directConversions?: number;
  direct?: number;
  revenue?: number;
  total?: number;
  [k: string]: unknown;
}

// ===== Fase 5 — Integrações =====

export type IntegrationProvider = "META_CAPI" | "GA4" | "GOOGLE_ADS" | "WEBHOOK" | string;

export type IntegrationDeliveryStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "RETRY"
  | string;

export interface IntegrationHealth {
  id?: string;
  provider?: IntegrationProvider;
  name?: string;
  status?: "HEALTHY" | "DEGRADED" | "DOWN" | string;
  healthy?: boolean;
  enabled?: boolean;
  successCount?: number;
  failureCount?: number;
  pendingCount?: number;
  lastSuccessAt?: string | null;
  lastFailureAt?: string | null;
  lastError?: string | null;
  message?: string | null;
  [k: string]: unknown;
}

export interface IntegrationDelivery {
  id: string;
  projectId?: string;
  provider?: IntegrationProvider;
  status?: IntegrationDeliveryStatus;
  eventType?: string;
  eventId?: string;
  payload?: unknown;
  response?: unknown;
  error?: string | null;
  attempts?: number;
  maxAttempts?: number;
  nextRetryAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: unknown;
}

// ===== Pagination (Phase 7) =====
export interface PaginationMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export type PaginatedResponse<T> =
  | T[]
  | {
      data?: T[];
      items?: T[];
      meta?: PaginationMeta;
    };

export interface TablePaginationState {
  page: number;
  pageSize: number;
}
