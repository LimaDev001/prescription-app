import React from "react";
import {
  ArrowRight,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import doctorImage from "../assets/doctor.png";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isLoggedIn = Boolean(user);

  return (
    <main className="h-screen w-full overflow-hidden bg-[#FBF7F4] text-[#2E403A]">
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">

        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="
              absolute left-1/2 top-1/2
              h-[600px] w-[600px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-[#EED2CC]/35
              blur-[120px]
            "
          />

          <div
            className="
              absolute -left-40 -top-40
              h-[420px] w-[420px]
              rounded-full
              border border-[#6C9A8B]/10
            "
          />

          <div
            className="
              absolute -bottom-48 -right-40
              h-[480px] w-[480px]
              rounded-full
              border border-[#A1683A]/10
            "
          />

          <div
            className="
              absolute left-1/2 top-[55%]
              h-[390px] w-[390px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-[#6C9A8B]/10
            "
          />
        </div>

        {/* Decorative dots */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[34%] h-2 w-2 rounded-full bg-[#E8998D]/60" />
          <div className="absolute right-[10%] top-[39%] h-2 w-2 rounded-full bg-[#6C9A8B]/50" />
          <div className="absolute left-[16%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-[#A1683A]/50" />
          <div className="absolute right-[17%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-[#E8998D]/60" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex h-full w-full max-w-5xl flex-col items-center justify-center px-6">

          {/* Brand */}
          <div className="brand-enter text-center">
            <div className="mb-2.5 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-[#6C9A8B]/30" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#6C9A8B]/70">
                Prescription Workspace
              </span>

              <span className="h-px w-8 bg-[#6C9A8B]/30" />
            </div>

            <h1
              className="
                text-[52px]
                font-semibold
                tracking-[-0.065em]
                text-[#33463F]
                sm:text-[64px]
                md:text-[72px]
              "
            >
              Rx<span className="text-[#6C9A8B]">Flow</span>
            </h1>
          </div>

          {/* Doctor */}
          <div className="doctor-section relative mt-1 flex items-center justify-center">

            {/* Glow */}
            <div
              className="
                absolute left-1/2 top-1/2
                h-[270px] w-[270px]
                -translate-x-1/2 -translate-y-1/2
                rounded-full
                bg-[#6C9A8B]/10
                blur-[40px]
                sm:h-[330px] sm:w-[330px]
              "
            />

            {/* Ring */}
            <div
              className="
                absolute left-1/2 top-1/2
                h-[280px] w-[280px]
                -translate-x-1/2 -translate-y-1/2
                rounded-full
                border border-[#6C9A8B]/10
                sm:h-[350px] sm:w-[350px]
              "
            />

            {/* Doctor */}
            <img
              src={doctorImage}
              alt="Professional doctor writing a prescription"
              className="
                doctor-image
                relative z-10
                w-[255px]
                object-contain
                sm:w-[320px]
                md:w-[350px]
              "
            />

            {/* Status */}
            <div
              className="
                status-card
                absolute
                bottom-[8%]
                right-[-115px]
                z-20
                hidden
                items-center
                gap-2
                rounded-full
                border border-[#6C9A8B]/10
                bg-white/80
                px-3 py-2
                shadow-[0_12px_35px_rgba(50,70,63,0.08)]
                backdrop-blur-xl
                sm:flex
              "
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6C9A8B]/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6C9A8B]" />
              </span>

              <span className="text-[10px] font-medium tracking-wide text-[#33463F]/70">
                Ready to prescribe
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="description-enter -mt-3 max-w-[460px] text-center sm:-mt-5">
            <p className="text-[14px] leading-6 text-[#33463F]/60 sm:text-[15px]">
              A smarter workspace for creating, managing, and organizing
              prescriptions with clarity.
            </p>
          </div>

          {/* Buttons */}
          <div className="actions-enter mt-5 flex items-center gap-2.5 sm:mt-6">

            {isLoggedIn ? (
              /* DASHBOARD */
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="
                  group
                  flex items-center gap-2
                  rounded-xl
                  bg-[#6C9A8B]
                  px-5 py-2.5
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-[0_12px_30px_rgba(108,154,139,0.20)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#5E8D7D]
                  hover:shadow-[0_16px_35px_rgba(108,154,139,0.28)]
                  active:translate-y-0
                "
              >
                <LayoutDashboard
                  size={15}
                  strokeWidth={2}
                />

                Go to Dashboard

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </button>
            ) : (
              <>
                {/* SIGN IN */}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="
                    group
                    flex items-center gap-2
                    rounded-xl
                    bg-[#6C9A8B]
                    px-5 py-2.5
                    text-[13px]
                    font-semibold
                    text-white
                    shadow-[0_12px_30px_rgba(108,154,139,0.20)]
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#5E8D7D]
                    hover:shadow-[0_16px_35px_rgba(108,154,139,0.28)]
                    active:translate-y-0
                  "
                >
                  <LogIn
                    size={15}
                    strokeWidth={2}
                  />

                  Sign In
                </button>

                {/* CREATE ACCOUNT */}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="
                    group
                    flex items-center gap-2
                    rounded-xl
                    border border-[#33463F]/10
                    bg-white/60
                    px-5 py-2.5
                    text-[13px]
                    font-semibold
                    text-[#33463F]
                    shadow-[0_8px_25px_rgba(50,70,63,0.04)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-[#6C9A8B]/25
                    hover:bg-white/80
                    active:translate-y-0
                  "
                >
                  Create account

                  <ArrowRight
                    size={15}
                    strokeWidth={2}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              </>
            )}

          </div>

          {/* Footer */}
          <div className="footer-enter mt-5 text-center">
            <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#33463F]/30">
              Simple · Professional · Focused
            </span>
          </div>

        </div>
      </section>

      {/* Animations */}
      <style>{`
        .brand-enter {
          animation: brandEnter 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .doctor-section {
          animation: doctorEnter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
        }

        .description-enter {
          animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
        }

        .actions-enter {
          animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.38s both;
        }

        .footer-enter {
          animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.48s both;
        }

        @keyframes brandEnter {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes doctorEnter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.94);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .doctor-image {
          animation: doctorFloat 6s ease-in-out 1s infinite;
          filter: drop-shadow(
            0 25px 35px rgba(50, 70, 63, 0.12)
          );
        }

        @keyframes doctorFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        .status-card {
          animation:
            statusEnter 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.8s both,
            statusFloat 5s ease-in-out 1.8s infinite;
        }

        @keyframes statusEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes statusFloat {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -4px;
          }
        }

        @media (max-width: 640px) {
          .doctor-image {
            width: 240px;
          }
        }

        @media (max-height: 720px) {
          .doctor-image {
            width: 235px;
          }

          .doctor-section {
            margin-top: -2px;
          }

          .description-enter {
            margin-top: -8px;
          }

          .actions-enter {
            margin-top: 12px;
          }

          .footer-enter {
            margin-top: 12px;
          }
        }
      `}</style>
    </main>
  );
};

export default Landing;