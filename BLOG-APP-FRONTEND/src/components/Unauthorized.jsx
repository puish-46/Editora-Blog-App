import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import Button from "./ui/Button";

const Unauthorized = ({ delay = 5000 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.redirectTo || "/login";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, delay);

    return () => clearTimeout(timer);
  }, [navigate, redirectTo, delay]);

  return (
    <div className="flex flex-col justify-center items-center py-20 text-center max-w-lg mx-auto px-4">
      {/* Visual Accent */}
      <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center text-2xl font-bold mb-6 animate-pulse">
        !
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-light-primary dark:text-text-dark-primary mb-4 tracking-tight">
        403 — Access Restricted
      </h1>
      
      <p className="text-sm sm:text-base text-text-light-secondary/85 dark:text-text-dark-secondary/85 leading-relaxed mb-8">
        You do not have the required credentials to access this section of the magazine.
      </p>

      <div className="flex flex-col gap-4 items-center w-full">
        <Button
          variant="secondary"
          onClick={() => navigate(redirectTo, { replace: true })}
          className="w-full sm:w-auto px-6 py-2.5"
        >
          Go Back Now
        </Button>
        <span className="text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40">
          Or you will be automatically redirected shortly...
        </span>
      </div>
    </div>
  );
};

export default Unauthorized;