import DealerNavbar from "../components/DealerNavbar";
import { Outlet } from "react-router-dom";

const DealerLayout = () => {
  return (
    <>
      <DealerNavbar />

      <main className="min-h-screen bg-[#f8f6f3]">
        <Outlet />
      </main>
    </>
  );
};

export default DealerLayout;