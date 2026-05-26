import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import axios from "axios";
import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import {
  divider,
  errorClass,
  formCard,
  pageBackground,
  mutedText,
  labelClass,
  linkClass,
  formTitle,
} from "../styles/common";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const onUserRegister = async (userObj) => {
    let { profileImageUrl } = userObj;
    const formData = new FormData();
    formData.append("role", userObj.role);
    formData.append("firstName", userObj.firstName);
    formData.append("lastName", userObj.lastName);
    formData.append("email", userObj.email);
    formData.append("password", userObj.password);
    
    if (profileImageUrl?.[0]) {
      formData.append("profileImageUrl", profileImageUrl[0]);
    }

    try {
      setLoading(true);
      setApiError(null);
      let res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/users`, formData, { withCredentials: true });
      if (res.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      console.log("err in registration", err);
      setApiError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${pageBackground} flex items-center justify-center py-10 sm:py-20 px-4`}>
      <div className={formCard}>
        <h2 className={formTitle}>Create Account</h2>

        {/* API Error */}
        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onUserRegister)}>
          {/* ROLE */}
          <div className="mb-6">
            <p className={labelClass}>Register as</p>

            <div className="flex gap-8 mt-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  value="USER"
                  {...register("role", {
                    required: "Please select a role",
                  })}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary group-hover:text-accent transition-colors">
                  Reader (User)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  value="AUTHOR"
                  {...register("role", {
                    required: "Please select a role",
                  })}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary group-hover:text-accent transition-colors">
                  Creator (Author)
                </span>
              </label>
            </div>

            {errors.role && (
              <p className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl px-4 py-2 text-xs font-medium mt-2">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className={divider} />

          {/* NAME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <Input
              label="First Name"
              type="text"
              placeholder="First name"
              error={errors.firstName?.message}
              {...register("firstName", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "At least 2 characters required",
                },
                maxLength: {
                  value: 30,
                  message: "Max 30 characters allowed",
                },
                validate: (v) => v.trim().length > 0 || "Cannot be empty",
              })}
            />

            <Input
              label="Last Name"
              type="text"
              placeholder="Last name"
              error={errors.lastName?.message}
              {...register("lastName", {
                maxLength: {
                  value: 30,
                  message: "Max 30 characters allowed",
                },
              })}
            />
          </div>

          {/* EMAIL */}
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
            })}
          />

          {/* PASSWORD */}
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
            })}
          />

          {/* PROFILE IMAGE */}
          <div className="mb-6">
            <label className={labelClass}>Profile Image</label>
            <input 
              type="file" 
              className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-text-light-primary dark:text-text-dark-primary text-sm focus:outline-none focus:border-accent file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              accept="image/png, image/jpeg" 
              {...register("profileImageUrl", {
                validate: {
                  fileType: (files) => {
                    if (!files?.[0]) return true;
                    return ["image/png", "image/jpeg"].includes(files[0].type) || "Only JPG/PNG ALLOWED";
                  },
                  fileSize: (files) => {
                    if (!files?.[0]) return true;
                    return files[0].size <= 2 * 1024 * 1024 || "Max size allowed is 2MB";
                  }
                }
              })} 
              onChange={(event) => {
                let file = event.target.files[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }} 
            />

            {errors.profileImageUrl && (
              <p className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs font-medium mt-2">
                {errors.profileImageUrl.message}
              </p>
            )}

            {/* image preview */}
            {preview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-full border border-accent/30 p-1 shadow-md animate-fade-in"
                />
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider mt-4"
          >
            Create Account
          </Button>
        </form>

        {/* FOOTER */}
        <p className={`${mutedText} text-center mt-6`}>
          Already have an account?{" "}
          <NavLink to="/login" className={linkClass}>
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;