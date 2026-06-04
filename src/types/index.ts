export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  domain?: string;
  trackingKey?: string;
  createdAt?: string;
}

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
  [k: string]: number | undefined;
}
