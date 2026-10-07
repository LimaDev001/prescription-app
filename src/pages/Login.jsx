import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = form.email.trim();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { error: authError } = await signIn(
        email,
        form.password
      );

      if (authError) {
        throw authError;
      }

      // ALWAYS go directly to Dashboard after successful login
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-[#FBF7F4] text-[#2E403A]">
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-5">

        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="
              absolute left-1/2 top-1/2
              h-[560px] w-[560px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-[#EED2CC]/25
              blur-[110px]
            "
          />

          <div
            className="
              absolute -left-40 -top-40
              h-[400px] w-[400px]
              rounded-full
              border border-[#6C9A8B]/10
            "
          />

          <div
            className="
              absolute -bottom-44 -right-40
              h-[430px] w-[430px]
              rounded-full
              border border-[#A1683A]/10
            "
          />

          <div className="absolute left-[12%] top-[28%] h-1.5 w-1.5 rounded-full bg-[#E8998D]/50" />
          <div className="absolute right-[13%] top-[35%] h-2 w-2 rounded-full bg-[#6C9A8B]/40" />
          <div className="absolute bottom-[24%] left-[17%] h-1.5 w-1.5 rounded-full bg-[#A1683A]/40" />
          <div className="absolute bottom-[20%] right-[18%] h-1.5 w-1.5 rounded-full bg-[#E8998D]/40" />
        </div>

        {/* Card */}
        <div className="relative z-10 w-full max-w-[410px]">

          <Link
            to="/"
            className="
              mb-3.5 inline-flex items-center gap-1.5
              text-[11px] font-medium
              text-[#33463F]/45
              transition-colors
              hover:text-[#6C9A8B]
            "
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back to RxFlow
          </Link>

          <div
            className="
              rounded-[24px]
              border border-[#33463F]/[0.07]
              bg-white/80
              px-6 py-5
              shadow-[0_22px_65px_rgba(50,70,63,0.08)]
              backdrop-blur-2xl
              sm:px-7 sm:py-6
            "
          >

            {/* Logo */}
            <div className="mb-4">
              <div className="mb-3 flex items-center gap-2.5">

                <div
                  className="
                    flex h-8 w-8 items-center justify-center
                    rounded-[10px]
                    bg-[#6C9A8B]
                    text-white
                    shadow-[0_7px_18px_rgba(108,154,139,0.20)]
                  "
                >
                  <ShieldCheck size={16} strokeWidth={2} />
                </div>

                <div>
                  <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#33463F]">
                    RxFlow
                  </p>

                  <p className="text-[8px] font-medium uppercase tracking-[0.17em] text-[#33463F]/30">
                    Prescription Workspace
                  </p>
                </div>

              </div>

              <h1 className="text-[26px] font-semibold tracking-[-0.045em] text-[#33463F]">
                Welcome back
              </h1>

              <p className="mt-1 text-[12px] leading-4.5 text-[#33463F]/45">
                Sign in to continue to your prescription workspace.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-4 text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-[10px] font-semibold text-[#33463F]/60"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={14}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute left-3 top-1/2
                      -translate-y-1/2
                      text-[#33463F]/25
                    "
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="
                      h-9.5 w-full
                      rounded-[10px]
                      border border-[#33463F]/10
                      bg-[#FBF7F4]/65
                      pl-9 pr-3
                      text-[12px]
                      text-[#33463F]
                      outline-none
                      placeholder:text-[#33463F]/22
                      transition-all
                      focus:border-[#6C9A8B]/50
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#6C9A8B]/[0.07]
                    "
                  />

                </div>
              </div>

              {/* Password */}
              <div>

                <div className="mb-1 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-[10px] font-semibold text-[#33463F]/60"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="
                      text-[9px] font-semibold
                      text-[#6C9A8B]
                      transition-colors
                      hover:text-[#5E8D7D]
                    "
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <LockKeyhole
                    size={14}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute left-3 top-1/2
                      -translate-y-1/2
                      text-[#33463F]/25
                    "
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="
                      h-9.5 w-full
                      rounded-[10px]
                      border border-[#33463F]/10
                      bg-[#FBF7F4]/65
                      pl-9 pr-9
                      text-[12px]
                      text-[#33463F]
                      outline-none
                      placeholder:text-[#33463F]/22
                      transition-all
                      focus:border-[#6C9A8B]/50
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#6C9A8B]/[0.07]
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="
                      absolute right-2.5 top-1/2
                      -translate-y-1/2
                      text-[#33463F]/25
                      transition-colors
                      hover:text-[#6C9A8B]
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={14}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={14}
                        strokeWidth={1.8}
                      />
                    )}
                  </button>

                </div>
              </div>

              {/* Remember */}
              <label className="flex cursor-pointer items-center gap-2 pt-0.5">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  className="
                    h-3.5 w-3.5
                    cursor-pointer
                    accent-[#6C9A8B]
                  "
                />

                <span className="text-[10px] font-medium text-[#33463F]/40">
                  Keep me signed in
                </span>

              </label>

              {/* Sign in */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  mt-1
                  flex h-10 w-full
                  items-center justify-center gap-2
                  rounded-[10px]
                  bg-[#6C9A8B]
                  text-[12px]
                  font-semibold
                  text-white
                  shadow-[0_10px_24px_rgba(108,154,139,0.18)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#5E8D7D]
                  hover:shadow-[0_14px_30px_rgba(108,154,139,0.25)]
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={14}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                      "
                    />
                  </>
                )}

              </button>

            </form>

            {/* Signup */}
            <div className="mt-4 border-t border-[#33463F]/[0.06] pt-3.5">

              <p className="text-center text-[10px] text-[#33463F]/35">
                New to RxFlow?
              </p>

              <Link
                to="/signup"
                className="
                  mt-1.5
                  flex h-9.5 w-full
                  items-center justify-center
                  rounded-[10px]
                  border border-[#33463F]/10
                  bg-white/60
                  text-[11px]
                  font-semibold
                  text-[#33463F]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:border-[#6C9A8B]/25
                  hover:bg-white
                "
              >
                Create your RxFlow account
              </Link>

            </div>

          </div>

          <p className="mt-3 text-center text-[8px] font-medium uppercase tracking-[0.18em] text-[#33463F]/25">
            Simple · Professional · Focused
          </p>

        </div>
      </div>
    </main>
  );
};

export default Login;