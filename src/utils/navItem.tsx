import { Home, Package2, Shirt, ShoppingCart, User2, Zap } from "lucide-react";

export const navItems = [
  {
    icon: <Home className="w-5 h-5" />,
    title: "Dashboard",
    link: "/",
    active: true,
    roles: ["admin", "manager", "moderator"],
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    title: "Orders",
    link: "/order",
    active: true,
    roles: ["admin", "manager", "moderator"],
  },
  {
    icon: <Shirt className="w-5 h-5" />,
    title: "Products",
    link: "/products",
    active: true,
    roles: ["admin", "manager"],
  },
  {
    icon: <Package2 className="w-5 h-5" />,
    title: "Category",
    link: "/category",
    active: true,
    roles: ["admin", "manager"],
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Campaign",
    link: "/campaign",
    active: true,
    roles: ["admin", "manager"],
  },
  {
    icon: <User2 className="w-5 h-5" />,
    title: "Customers",
    link: "/customers",
    active: false,
    roles: ["admin", "manager"],
  },
];
