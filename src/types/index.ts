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
