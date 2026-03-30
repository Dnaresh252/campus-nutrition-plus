import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AdminLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen" style={{ background: "#f8f9fc" }}>
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div className="flex flex-col flex-1" style={{ marginLeft: "260px" }}>
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
