import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Input from "./ui/Input";
import Button from "./ui/Button";
import {
  pageBackground,
  formCard,
  formTitle,
  errorClass,
  mutedText,
  linkClass,
} from "../styles/common";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { login, currentUser, loading, error, isAuthenticated } = useAuth((state) => state);

  const onUserLogin = (userCredObj) => {
    login(userCredObj);
  };

  useEffect(() => {
    if (isAuthenticated === true) {
      if (currentUser.role === "USER") {
        toast.success("Welcome back! Redirecting to user dashboard...");
        navigate("/user-profile");
      }
      if (currentUser.role === "AUTHOR") {
        toast.success("Welcome back! Redirecting to writer panel...");
        navigate("/author-profile");
      }
      if (currentUser.role === "ADMIN") {
        toast.success("System admin authenticated. Opening dashboard...");
        navigate("/admin-profile");
      }
    }
  }, [isAuthenticated]);

  return (
    <div className={`${pageBackground} flex items-center justify-center py-10 sm:py-20 px-4`}>
      <div className={formCard}>
        {/* Title */}
        <h2 className={formTitle}>Sign In</h2>

        {/* API error */}
        {error && <p className={errorClass}>{error}</p>}

        <form onSubmit={handleSubmit(onUserLogin)}>
          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              validate: (value) => value.trim().length > 0 || "Email cannot be empty",
            })}
          />

          {/* Password */}
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              validate: (value) => value.trim().length > 0 || "Password cannot be empty",
            })}
          />

          {/* Forgot password */}
          <div className="text-right -mt-2 mb-6">
            <NavLink to="/forgot-password" className={`${linkClass} text-xs font-semibold`}>
              Forgot password?
            </NavLink>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading}
            className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider"
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className={`${mutedText} text-center mt-6`}>
          Don't have an account?{" "}
          <NavLink to="/register" className={linkClass}>
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;