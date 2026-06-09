import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar   from "./Sidebar";
import TopBar    from "./TopBar";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 pb-20 lg:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Outlet />
          </div>
        </main>
      </div>
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
