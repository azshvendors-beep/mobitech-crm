import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  Wallet,
  BarChart,
  UserCog,
  Settings,
  HelpCircle,
  Search,
  FileText,
  ClipboardCheck,
  FileSpreadsheet,
  Package,
  ShieldHalf,
  LucideIcon
} from "lucide-react";

const BASE_URL = `/admin`;

export const adminNavigation = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://avatar.iran.liara.run/public/32",
  },

  main: [
    {
      title: "Dashboard",
      url: `${BASE_URL}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Model",
      url: ``,
      icon: Box,
      items: [
        { title: "Add New Model", url: `${BASE_URL}/add-model` },
        { title: "View Models", url: `${BASE_URL}/view-models` },
        // { title: "Edit Model", url: `${BASE_URL}/edit-model` },
      ],
    
    },
    {
      title: "Pickups",
      url: `${BASE_URL}/pickups`,
      icon: Box,
      items: [
        {
          title: "Create Order",
          url: `${BASE_URL}/pickups/create-order`,
          items: [
            {
              title: "Store Pickup",
              url: `${BASE_URL}/pickups/create-order/store-pickup`,
            },
            {
              title: "Doorstep Pickup",
              url: `${BASE_URL}/pickups/create-order/doorstep-pickup`,
            },
          ],
        },
      ],
    },
    {
      title: "Purchase",
      url: `${BASE_URL}/purchase`,
      icon: ShoppingCart,
      items: [
        { 
          title: "Partners Purchase Entry", 
          url: `${BASE_URL}/purchase/partners-purchase-entry` 
        },
        { 
          title: "New Mobiles Purchase", 
          url: `${BASE_URL}/purchase/new-mobiles-purchase` 
        },
      ],
    },
    {
      title: "Sales",
      url: `${BASE_URL}/sales`,
      icon: ShoppingCart,
      items: [
        { title: "Create Sale", url: `${BASE_URL}/sales/create-sale` },
        { title: "View Sales", url: `${BASE_URL}/sales/view-sales` },
        { title: "Edit Sales", url: `${BASE_URL}/sales/edit-sales` },
      ],
    },
    {
      title: "Customers",
      url: `${BASE_URL}/customers`,
      icon: Users,
      items: [
        { title: "Add Customer", url: `${BASE_URL}/customers/add` },
        { title: "View or Edit Customer", url: `${BASE_URL}/customers/customer` },
      ],
    },
    {
      title: "Manage Team",
      url: `#`,
      icon: UserCog,
      items: [
        { title: "Employees", url: `${BASE_URL}/employees` },
      ],
    },
    {
      title: "Items",
      url: `${BASE_URL}/items`,
      icon: Box,
      items: [
        { title: "Pre-Owned Mobiles", url: `${BASE_URL}/items/pre-owned-mobiles` },
        { title: "Brand New Mobiles", url: `${BASE_URL}/items/brand-new-mobiles` },
        { title: "Laptops", url: `${BASE_URL}/items/laptops` },
      ],
    },
  ],

  reports: [
    {
      title: "Daily Reports",
      url: `${BASE_URL}/reports/daily`,
      icon: FileText,
    },
    {
      title: "Monthly Reports",
      url: `${BASE_URL}/reports/monthly`,
      icon: FileSpreadsheet,
    },
    {
      title: "QC Reports",
      url: `${BASE_URL}/reports/qc-reports`,
      icon: ClipboardCheck,
    },
    {
      title: "Stock Reports",
      url: `${BASE_URL}/reports/stock`,
      icon: Package,
      items: [
        { title: "Total Stock", url: `${BASE_URL}/reports/stock/total-stock` },
        { title: "Repair Pending", url: `${BASE_URL}/reports/stock/repair-pending` },
        { title: "Stock Value", url: `${BASE_URL}/reports/stock/stock-value` },
        { title: "Ready to Sale", url: `${BASE_URL}/reports/stock/ready-to-sale` },
        { title: "Today Sale", url: `${BASE_URL}/reports/stock/today-sale` },
      ],
    },
  ],

  wallet: [
    {
      title: "Wallet",
      url: `${BASE_URL}/wallet`,
      icon: Wallet,
      items: [
        { title: "Add Money", url: `${BASE_URL}/wallet/add-money` },
        { title: "All Transactions", url: `${BASE_URL}/wallet/all-transactions` },
        { title: "Credits", url: `${BASE_URL}/wallet/credits` },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: `${BASE_URL}/settings`,
      icon: Settings,
    },
    {
      title: "Sessions",
      url: "/admin/sessions",
      icon: HelpCircle,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
};

// Types
export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavItem[];
};

export type UserData = {
  name: string;
  email: string;
  avatar?: string;
}; 