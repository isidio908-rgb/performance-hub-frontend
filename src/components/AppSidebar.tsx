import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Code2,
  Activity,
  UserPlus,
  ShoppingCart,
  Plug,
  BarChart3,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Projetos", url: "/projects", icon: FolderKanban },
  { title: "Instalação", url: "/install", icon: Code2 },
];

const dataItems = [
  { title: "Eventos", url: "/events", icon: Activity },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "E-commerce", url: "/ecommerce", icon: ShoppingCart },
];

const systemItems = [
  { title: "Integrações", url: "/integrations", icon: Plug },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

function NavGroup({
  label,
  items,
  currentPath,
}: {
  label: string;
  items: typeof mainItems;
  currentPath: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = currentPath.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link to={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const currentPath = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            P
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Performance Hub</span>
            <span className="text-xs text-muted-foreground">v3.4</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Visão geral" items={mainItems} currentPath={currentPath} />
        <NavGroup label="Dados" items={dataItems} currentPath={currentPath} />
        <NavGroup label="Sistema" items={systemItems} currentPath={currentPath} />
      </SidebarContent>
    </Sidebar>
  );
}
