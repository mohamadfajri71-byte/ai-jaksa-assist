import { Search, MessageSquare, FileText, BookOpen, Shield, User, Bell, FolderTree, ChevronRight, Cloud } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Cari Database", url: "/dashboard/search", icon: Search },
  { title: "Chat Hukum", url: "/dashboard/chat", icon: MessageSquare },
  { title: "Asisten Draf", url: "/dashboard/draft", icon: FileText },
  { title: "Database", url: "/dashboard/knowledge", icon: BookOpen },
  { title: "Reminder Absen", url: "/dashboard/reminder", icon: Bell },
  { title: "Temp Cloud", url: "/dashboard/temp-cloud", icon: Cloud },
];

const settingsItems = [
  { title: "Profil", url: "/dashboard/profile", icon: User },
  { title: "Notifikasi", url: "/dashboard/notifications", icon: Bell },
];

interface AppSidebarProps {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const [bidangOpen, setBidangOpen] = useState(false);

  // Debug: Log menu items
  useEffect(() => {
    console.log("=== AppSidebar Debug ===");
    console.log("Menu items count:", menuItems.length);
    console.log("Menu items:", menuItems.map(item => item.title));
    console.log("Reminder Absen in menu:", menuItems.some(item => item.title === "Reminder Absen"));
    console.log("Temp Cloud in menu:", menuItems.some(item => item.title === "Temp Cloud"));
  }, []);

  const isActive = (path: string) => location.pathname === path;
  
  const bidangSubmenu = [
    { title: "Pidsus", url: "/dashboard/bidang/pidsus" },
    { title: "Pidum", url: "/dashboard/bidang/pidum" },
    { title: "Datun", url: "/dashboard/bidang/datun" },
    { title: "Intel", url: "/dashboard/bidang/intel" },
  ];
  
  // Check if any submenu is active
  const isBidangActive = bidangSubmenu.some(item => isActive(item.url));
  
  // Auto-expand submenu if any submenu is active
  useEffect(() => {
    if (isBidangActive && !collapsed) {
      setBidangOpen(true);
    }
  }, [isBidangActive, collapsed]);

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <img 
            src="/logo website.png" 
            alt="AICA Logo" 
            className="h-8 w-auto"
          />
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              AICA.WEB.ID
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Menu Bidang dengan Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => !collapsed && setBidangOpen(!bidangOpen)}
                  data-active={isBidangActive}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <FolderTree className="h-5 w-5" />
                  {!collapsed && (
                    <>
                      <span>Bidang</span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 transition-transform ${bidangOpen ? "rotate-90" : ""}`}
                      />
                    </>
                  )}
                </SidebarMenuButton>
                {!collapsed && bidangOpen && (
                  <SidebarMenuSub>
                    {bidangSubmenu.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-2"
                          >
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/dashboard/admin"
                      className="flex items-center gap-3 px-3 py-2"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <Shield className="h-5 w-5" />
                      {!collapsed && <span>Admin Panel</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PENGATURAN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
