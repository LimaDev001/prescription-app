import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!fullName || !email || !form.password || !form.confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) {
        throw signupError;
      }

      if (data?.session) {
        navigate("/profile-setup");
        return;
      }

      setSuccess(
        "Account created. Check your email to confirm your account."
      );
    } catch (err) {
      setError(
        err?.message || "Unable to create your account. Please try again."
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

        {/* Main */}
        <div className="relative z-10 w-full max-w-[410px]">
          {/* Back */}
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

          {/* Card */}
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
            {/* Header */}
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
                Create your account
              </h1>

              <p className="mt-1 text-[12px] leading-4.5 text-[#33463F]/45">
                Set up your workspace and start creating prescriptions.
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-3 rounded-lg border border-[#6C9A8B]/20 bg-[#6C9A8B]/[0.08] px-3 py-2 text-[11px] leading-4 text-[#4D776A]">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1 block text-[10px] font-semibold text-[#33463F]/60"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={14}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#33463F]/25"
                  />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
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
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#33463F]/25"
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

              {/* Password row */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-[10px] font-semibold text-[#33463F]/60"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={14}
                      strokeWidth={1.8}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#33463F]/25"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
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
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#33463F]/25 hover:text-[#6C9A8B]"
                    >
                      {showPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 block text-[10px] font-semibold text-[#33463F]/60"
                  >
                    Confirm
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={14}
                      strokeWidth={1.8}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#33463F]/25"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat"
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
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#33463F]/25 hover:text-[#6C9A8B]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Small note */}
              <p className="pt-0.5 text-[9px] leading-3.5 text-[#33463F]/30">
                Use at least 6 characters for your password.
              </p>

              {/* Submit */}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <div className="mt-4 border-t border-[#33463F]/[0.06] pt-3.5">
              <p className="text-center text-[10px] text-[#33463F]/35">
                Already have an account?
              </p>

              <Link
                to="/login"
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
                Sign in to RxFlow
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-3 text-center text-[8px] font-medium uppercase tracking-[0.18em] text-[#33463F]/25">
            Simple · Professional · Focused
          </p>
        </div>
      </div>
    </main>
  );
};

export default Signup;