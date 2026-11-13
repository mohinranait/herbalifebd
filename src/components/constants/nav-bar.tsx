import {
  Ambulance,
  Car,
  CarFront,
  Cross,
  PlaneTakeoff,
  LayoutDashboard,
  Package,
  LucideIcon,
  Settings,
  Image,
  Bolt,
  Users,
  Columns2,
  FileUser,
  Webhook,
  Calculator,
  ShoppingCart,
  HelpCircle,
  MessageSquare,
  Layers,
  FolderTree,
  Tag,
  FileText,
  SlidersHorizontal,
} from "lucide-react";

export interface SidebarNavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  badge?: string;
  items?: SidebarNavItem[];
}

// Navigation group interface
export interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
}

// User interface
export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
}

// Team interface
export interface SidebarTeam {
  name: string;
  logo: LucideIcon;
  plan: string;
}

// Main sidebar data interface
export interface SidebarData {
  navGroups: SidebarNavGroup[];
}

export const ambulanceTypes = [
  {
    id: "1",
    icon: <Car className="text-primary" size={30} />,
    title: "Ac ambulance service",
    content:
      "The Ac Ambulance is the best to transport a patient a place to another. It is all Districts are available.",
    url: "/ac-ambulance-service",
  },
  {
    id: "2",
    icon: <Ambulance className="text-primary" size={30} />,
    title: "Non-Ac Ambulance service",
    content:
      "Non-Ac Ambulance is Normal then Ac Ambulacne. it is low price then Ac Ambulance. 24/7 Ambulance is Available.",
    url: "/non-ac-ambulance",
  },
  {
    id: "3",
    icon: <CarFront className="text-primary" size={30} />,
    title: "Basic Life Support (BLS) Ambulances",
    content:
      "Basic Life Support ambulances are a crucial part of emergency medical services, providing essential care.",
    url: "/icu-ambulance-service",
  },
  {
    id: "4",
    icon: <Cross className="text-primary" size={30} />,
    title: "Advanced Life Support (ALS) Ambulances",
    content:
      "ALS ambulances are equipped to provide a wider range of medical procedures than BLS ambulances",
    url: "/",
  },
  {
    id: "5",
    icon: <PlaneTakeoff className="text-primary" size={30} />,
    title: "Freezing Ambulance service",
    content:
      "It is the best way to save or carry the dead body. It has a frozen box. Use this save the dead body.",
    url: "/freezing-ambulance-service",
  },
  {
    id: "6",
    icon: <Cross className="text-primary" size={30} />,
    title: "Hiace Microbus Service",
    content:
      "Hi-ace Microbus car is available. We provide only Hiace car from Dhaka to all districts.",
    url: "/",
  },
];

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Store Management",
      items: [
        {
          title: "Products",
          icon: Package,
          items: [
            {
              title: "All Products",
              url: "/admin/products",
              icon: Package,
            },
            {
              title: "Add Product",
              url: "/admin/products/form",
              icon: Tag,
            },
            {
              title: "Categories",
              url: "/admin/categories",
              icon: FolderTree,
            },
            {
              title: "Brands",
              url: "/admin/brands",
              icon: Tag,
            },
            {
              title: "Attributes",
              url: "/admin/attributes",
              icon: Layers,
            },
            {
              title: "Request Quotes",
              url: "/admin/request-quotes",
              icon: FileText,
            },
            {
              title: "Reviews & Comments",
              url: "/admin/comments",
              icon: MessageSquare,
            },
          ],
        },
        {
          title: "Orders",
          icon: ShoppingCart,
          items: [
            {
              title: "All Orders",
              url: "/admin/orders",
              icon: ShoppingCart,
            },
          ],
        },
      ],
    },
    {
      title: "Finance & CRM",
      items: [
        {
          title: "Accounts",
          icon: Calculator,
          items: [
            {
              title: "Profit & Loss",
              url: "/admin/accounts/profit-loss",
            },
            {
              title: "Expenses",
              url: "/admin/accounts/expenses",
            },
          ],
        },
        {
          title: "Users",
          icon: Users,
          items: [
            {
              title: "All Users",
              url: "/admin/users",
              icon: Users,
            },
          ],
        },
      ],
    },
    {
      title: "Content & Marketing",
      items: [
        {
          title: "Media Library",
          url: "/admin/media",
          icon: Image,
        },
        {
          title: "Hero Sliders",
          url: "/admin/sliders",
          icon: SlidersHorizontal,
        },
        {
          title: "Customer Queries",
          url: "/admin/contact-query",
          icon: FileUser,
        },
        {
          title: "FAQs",
          url: "/admin/faqs",
          icon: HelpCircle,
        },
        {
          title: "Site Content",
          url: "/admin/site-content",
          icon: Webhook,
        },
      ],
    },
    {
      title: "System & Settings",
      items: [
        {
          title: "General Settings",
          url: "/admin/setting",
          icon: Settings,
        },
        {
          title: "Configurations",
          url: "/admin/configure",
          icon: Bolt,
        },
      ],
    },
  ],
};


export interface IDistrict {
  id: string;
  name: string;
  value: string;
}

export const districts: IDistrict[] = [
  { id: "1", name: "Bagerhat", value: "bagerhat" },
  { id: "2", name: "Bandarban", value: "bandarban" },
  { id: "3", name: "Barguna", value: "barguna" },
  { id: "4", name: "Barisal", value: "barisal" },
  { id: "5", name: "Bhola", value: "bhola" },
  { id: "6", name: "Bogura", value: "bogura" },
  { id: "7", name: "Brahmanbaria", value: "brahmanbaria" },
  { id: "8", name: "Chandpur", value: "chandpur" },
  { id: "9", name: "Chapainawabganj", value: "chapainawabganj" },
  { id: "10", name: "Chattogram", value: "chattogram" },
  { id: "11", name: "Chuadanga", value: "chuadanga" },
  { id: "12", name: "Cox’s Bazar", value: "coxs-bazar" },
  { id: "13", name: "Cumilla", value: "cumilla" },
  { id: "14", name: "Dhaka", value: "dhaka" },
  { id: "15", name: "Dinajpur", value: "dinajpur" },
  { id: "16", name: "Faridpur", value: "faridpur" },
  { id: "17", name: "Feni", value: "feni" },
  { id: "18", name: "Gaibandha", value: "gaibandha" },
  { id: "19", name: "Gazipur", value: "gazipur" },
  { id: "20", name: "Gopalganj", value: "gopalganj" },
  { id: "21", name: "Habiganj", value: "habiganj" },
  { id: "22", name: "Jamalpur", value: "jamalpur" },
  { id: "23", name: "Jashore", value: "jashore" },
  { id: "24", name: "Jhalokathi", value: "jhalokathi" },
  { id: "25", name: "Jhenaidah", value: "jhenaidah" },
  { id: "26", name: "Joypurhat", value: "joypurhat" },
  { id: "27", name: "Khagrachari", value: "khagrachari" },
  { id: "28", name: "Khulna", value: "khulna" },
  { id: "29", name: "Kishoreganj", value: "kishoreganj" },
  { id: "30", name: "Kurigram", value: "kurigram" },
  { id: "31", name: "Kushtia", value: "kushtia" },
  { id: "32", name: "Lakshmipur", value: "lakshmipur" },
  { id: "33", name: "Lalmonirhat", value: "lalmonirhat" },
  { id: "34", name: "Madaripur", value: "madaripur" },
  { id: "35", name: "Magura", value: "magura" },
  { id: "36", name: "Manikganj", value: "manikganj" },
  { id: "37", name: "Meherpur", value: "meherpur" },
  { id: "38", name: "Moulvibazar", value: "moulvibazar" },
  { id: "39", name: "Munshiganj", value: "munshiganj" },
  { id: "40", name: "Mymensingh", value: "mymensingh" },
  { id: "41", name: "Naogaon", value: "naogaon" },
  { id: "42", name: "Narail", value: "narail" },
  { id: "43", name: "Narayanganj", value: "narayanganj" },
  { id: "44", name: "Narsingdi", value: "narsingdi" },
  { id: "45", name: "Natore", value: "natore" },
  { id: "46", name: "Netrokona", value: "netrokona" },
  { id: "47", name: "Nilphamari", value: "nilphamari" },
  { id: "48", name: "Noakhali", value: "noakhali" },
  { id: "49", name: "Pabna", value: "pabna" },
  { id: "50", name: "Panchagarh", value: "panchagarh" },
  { id: "51", name: "Patuakhali", value: "patuakhali" },
  { id: "52", name: "Pirojpur", value: "pirojpur" },
  { id: "53", name: "Rajbari", value: "rajbari" },
  { id: "54", name: "Rajshahi", value: "rajshahi" },
  { id: "55", name: "Rangamati", value: "rangamati" },
  { id: "56", name: "Rangpur", value: "rangpur" },
  { id: "57", name: "Satkhira", value: "satkhira" },
  { id: "58", name: "Shariatpur", value: "shariatpur" },
  { id: "59", name: "Sherpur", value: "sherpur" },
  { id: "60", name: "Sirajganj", value: "sirajganj" },
  { id: "61", name: "Sunamganj", value: "sunamganj" },
  { id: "62", name: "Sylhet", value: "sylhet" },
  { id: "63", name: "Tangail", value: "tangail" },
  { id: "64", name: "Thakurgaon", value: "thakurgaon" }
];
