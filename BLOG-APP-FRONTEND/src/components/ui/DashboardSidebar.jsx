import Card from "./Card";
import Button from "./Button";

function DashboardSidebar({ activeTab, setActiveTab, onLogout, user }) {
  const menuItems = [
    { id: "overview", label: "Overview & Analytics", icon: "📊" },
    { id: "my-blogs", label: "My Stories", icon: "✍️", countKey: "totalBlogs" },
    { id: "liked-blogs", label: "Liked Stories", icon: "❤️", countKey: "totalLikes" },
    { id: "bookmarks", label: "Saved Bookmarks", icon: "🔖", countKey: "totalBookmarks" },
    { id: "notifications", label: "Notifications Logs", icon: "🔔" },
    { id: "settings", label: "Account Settings", icon: "⚙️" },
  ];

  return (
    <Card hoverEffect={false} className="border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 rounded-3xl h-fit shrink-0">
      {/* Mini Profile Summary */}
      <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-border-light/30 dark:border-border-dark/30">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="avatar"
            className="w-10 h-10 rounded-xl object-cover border border-accent/25"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-serif text-lg font-bold">
            {user?.firstName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary truncate">
            {user?.firstName} {user?.lastName || ""}
          </h4>
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-light-secondary/60 dark:text-text-dark-secondary/60">
            {user?.role || "Reader"}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-between transition-all duration-200 cursor-pointer ${
              activeTab === item.id
                ? "bg-accent text-white dark:text-paper-dark shadow-md"
                : "text-text-light-secondary/70 dark:text-text-dark-secondary/70 hover:bg-paper-light dark:hover:bg-paper-dark hover:text-accent"
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* Logout Action */}
      <div className="mt-8 pt-5 border-t border-border-light/30 dark:border-border-dark/30">
        <Button
          variant="danger"
          onClick={onLogout}
          className="w-full py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Logout Session
        </Button>
      </div>
    </Card>
  );
}

export default DashboardSidebar;
