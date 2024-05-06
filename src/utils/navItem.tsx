import { Home, Package, Package2, ShoppingCart, User2 } from "lucide-react";

export const navItems = [
  {
    icon: <Home className='w-5 h-5' />,
    title: "Dashboard",
    link: "/dashboard",
    active: false,
  },
  {
    icon: <ShoppingCart className='w-5 h-5' />,
    title: "Orders",
    link: "/order",
    active: true,
  },
  {
    icon: <Package className='w-5 h-5' />,
    title: "Products",
    link: "/products",
    active: true,
  },
  {
    icon: <Package2 className='w-5 h-5' />,
    title: "Category",
    link: "/category",
    active: true,
  },
  {
    icon: <User2 className='w-5 h-5' />,
    title: "Customers",
    link: "/customers",
    active: false,
  },
];
