import Card from "./Card";

function UserStatsCard({ title, value, icon, description }) {
  return (
    <Card hoverEffect={true} className="flex items-center gap-5 p-6 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-editorial transition-editorial">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl font-bold shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-text-light-secondary/60 dark:text-text-dark-secondary/60">
          {title}
        </p>
        <h4 className="font-serif text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mt-0.5">
          {value}
        </h4>
        {description && (
          <p className="text-[10px] text-text-light-secondary/50 dark:text-text-dark-secondary/50 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}

export default UserStatsCard;
