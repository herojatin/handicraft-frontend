import { Link, Outlet } from "react-router-dom";

const AdminDashboard = () => {
  const menu = [
    { name: "Events", path: "/admin" },
    { name: "Add Event", path: "/admin/add-event" },
    { name: "Products", path: "/admin/products" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Orders", path: "/admin/orders" },
  ];

  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5">
        <h2 className="text-xl mb-6">Admin Panel</h2>

        {menu.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className="block mb-3 hover:text-gray-300"
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-10 bg-[#faf7f2]">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;