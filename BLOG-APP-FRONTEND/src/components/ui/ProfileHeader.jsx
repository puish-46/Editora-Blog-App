import Card from "./Card";

function ProfileHeader({ user, stats, editable = false, onAvatarClick }) {
  const getInitials = () => {
    return user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U";
  };

  const formatDate = (date) => {
    if (!date) return "Joined recently";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };

  return (
    <Card hoverEffect={false} className="relative overflow-hidden border border-border-light dark:border-border-dark p-0 bg-card-light dark:bg-card-dark shadow-editorial rounded-3xl mb-8">
      {/* Visual Editorial Magazine Header Band */}
      <div className="h-32 sm:h-44 bg-gradient-to-r from-accent/20 via-paper-light dark:via-paper-dark to-accent/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      </div>

      <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start gap-6 -mt-10 sm:-mt-14">
        {/* Avatar Frame with overlay upload button */}
        <div className="relative group/avatar shrink-0">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="avatar"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-card-light dark:border-card-dark shadow-editorial bg-white p-0.5"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-accent text-white flex items-center justify-center text-3xl font-serif font-bold border-4 border-card-light dark:border-card-dark shadow-editorial">
              {getInitials()}
            </div>
          )}
          
          {editable && (
            <button
              onClick={onAvatarClick}
              className="absolute inset-0 bg-black/60 text-white rounded-2xl flex flex-col items-center justify-center text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 cursor-pointer"
            >
              <span>📷</span>
              <span className="mt-1">Update</span>
            </button>
          )}
        </div>

        {/* Bio & Details Column */}
        <div className="flex-1 min-w-0 pt-2 sm:pt-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-light-primary dark:text-text-dark-primary tracking-tight">
              {user?.firstName} {user?.lastName || ""}
            </h2>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/15">
              {user?.role || "Reader"}
            </span>
          </div>

          {user?.profession && (
            <p className="text-xs font-semibold text-text-light-secondary/80 dark:text-text-dark-secondary/80 mt-1">
              💼 {user.profession}
            </p>
          )}

          {user?.bio ? (
            <p className="text-xs sm:text-sm text-text-light-secondary/90 dark:text-text-dark-secondary/90 mt-3 max-w-xl leading-relaxed italic">
              "{user.bio}"
            </p>
          ) : (
            <p className="text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 mt-3 italic">
              No bio written yet.
            </p>
          )}

          {/* Location & Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-semibold border-t border-border-light/30 dark:border-border-dark/30 pt-3">
            {user?.location && (
              <span>📍 {user.location}</span>
            )}
            {user?.website && (
              <a 
                href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors"
              >
                🌐 {user.website}
              </a>
            )}
            <span>📅 Member since {formatDate(user?.createdAt)}</span>
          </div>

          {/* Social Links Row */}
          {user?.socialLinks && (Object.values(user.socialLinks).some(Boolean)) && (
            <div className="flex items-center gap-3 mt-4">
              {user.socialLinks.twitter && (
                <a 
                  href={user.socialLinks.twitter} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center text-xs hover:border-accent hover:text-accent transition-colors"
                  title="Twitter"
                >
                  🐦
                </a>
              )}
              {user.socialLinks.github && (
                <a 
                  href={user.socialLinks.github} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center text-xs hover:border-accent hover:text-accent transition-colors"
                  title="GitHub"
                >
                  💻
                </a>
              )}
              {user.socialLinks.linkedin && (
                <a 
                  href={user.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center text-xs hover:border-accent hover:text-accent transition-colors"
                  title="LinkedIn"
                >
                  🔗
                </a>
              )}
            </div>
          )}
        </div>

        {/* Mini stats counters on the side */}
        {stats && (
          <div className="flex sm:flex-col gap-4 pt-4 sm:pt-4 self-stretch sm:self-auto border-t sm:border-t-0 sm:border-l border-border-light/30 dark:border-border-dark/30 sm:pl-6 shrink-0 justify-around sm:justify-start">
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-light-secondary/50 dark:text-text-dark-secondary/50 block">Blogs</span>
              <span className="font-serif text-xl sm:text-2xl font-black text-text-light-primary dark:text-text-dark-primary">{stats.totalBlogs || 0}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-light-secondary/50 dark:text-text-dark-secondary/50 block">Likes Recd</span>
              <span className="font-serif text-xl sm:text-2xl font-black text-text-light-primary dark:text-text-dark-primary">{stats.totalLikes || 0}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ProfileHeader;
