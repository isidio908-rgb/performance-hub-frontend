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
  { title: "Compras", url: "/ecommerce", icon: ShoppingCart },
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
      <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = currentPath.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="group/nav h-9 rounded-md text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-[inset_2px_0_0_0_var(--sidebar-primary)]"
                >
                  <Link to={item.url} className="flex items-center gap-2.5">
                    <item.icon className="h-[18px] w-[18px] shrink-0 opacity-80 group-hover/nav:opacity-100 group-data-[active=true]/nav:text-sidebar-primary group-data-[active=true]/nav:opacity-100" />
                    <span className="truncate">{item.title}</span>
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold shadow-sm ring-1 ring-inset ring-white/10">
            P
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">Performance Hub</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              by Performify
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-2 px-1">
        <NavGroup label="Visão geral" items={mainItems} currentPath={currentPath} />
        <NavGroup label="Dados" items={dataItems} currentPath={currentPath} />
        <NavGroup label="Sistema" items={systemItems} currentPath={currentPath} />
      </SidebarContent>
    </Sidebar>
  );
}
