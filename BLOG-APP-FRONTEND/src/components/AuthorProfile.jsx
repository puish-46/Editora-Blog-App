import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { pageWrapper, divider } from "../styles/common";

function AuthorProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={pageWrapper}>
      {/* PROFILE HEADER */}
      <Card hoverEffect={false} className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {currentUser?.profileImageUrl ? (
            <img
              src={currentUser.profileImageUrl}
              className="w-16 h-16 rounded-full object-cover border border-accent/20 p-0.5 shadow-sm"
              alt="profile"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xl font-bold border border-accent/25">
              {currentUser?.firstName?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p className="text-xs uppercase font-bold tracking-widest text-accent mb-0.5">Creator Dashboard</p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-light-primary dark:text-text-dark-primary">{currentUser?.firstName} {currentUser?.lastName || ""}</h2>
          </div>
        </div>

        <Button
          variant="danger"
          onClick={onLogout}
          className="w-full sm:w-auto px-6"
        >
          Logout
        </Button>
      </Card>

      {/* NAVIGATION (TABS STYLE) */}
      <div className="flex gap-2 mb-8 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-1.5 rounded-full w-fit">
        <NavLink
          to="articles"
          className={({ isActive }) =>
            isActive
              ? "bg-accent text-white dark:text-paper-dark px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-editorial"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:text-accent dark:hover:text-accent px-6 py-2.5 rounded-full text-sm font-medium transition-editorial"
          }
        >
          My Articles
        </NavLink>

        <NavLink
          to="write-article"
          className={({ isActive }) =>
            isActive
              ? "bg-accent text-white dark:text-paper-dark px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-editorial"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:text-accent dark:hover:text-accent px-6 py-2.5 rounded-full text-sm font-medium transition-editorial"
          }
        >
          Write Article
        </NavLink>
      </div>

      <div className={divider}></div>

      {/* CONTENT */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthorProfile;