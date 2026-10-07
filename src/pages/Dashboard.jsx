import { useMemo } from "react";
import {
  ArrowRight,
  FilePlus2,
  FileText,
  LogOut,
  Pill,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const doctorName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Doctor";

  const firstName = doctorName.split(" ")[0];

  const initials = useMemo(() => {
    const words = doctorName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return (
      words
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("") || "DR"
    );
  }, [doctorName]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#FBF7F4]
        text-[#2E403A]
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Main peach glow */}
        <div
          className="
            absolute
            left-1/2
            top-[38%]
            h-[420px]
            w-[420px]
            -translate-x-1/2
            rounded-full
            bg-[#EED2CC]/25
            blur-[100px]
            sm:h-[520px]
            sm:w-[520px]
            sm:blur-[115px]
          "
        />

        {/* Top-left ring */}
        <div
          className="
            absolute
            -left-48
            -top-48
            h-[460px]
            w-[460px]
            rounded-full
            border
            border-[#6C9A8B]/10
          "
        />

        {/* Bottom-right ring */}
        <div
          className="
            absolute
            -bottom-48
            -right-48
            h-[480px]
            w-[480px]
            rounded-full
            border
            border-[#A1683A]/10
          "
        />

        {/* Decorative dots */}
        <div
          className="
            absolute
            left-[8%]
            top-[30%]
            h-1.5
            w-1.5
            rounded-full
            bg-[#E8998D]/60
            sm:left-[10%]
          "
        />

        <div
          className="
            absolute
            right-[8%]
            top-[27%]
            h-2
            w-2
            rounded-full
            bg-[#6C9A8B]/45
            sm:right-[12%]
          "
        />

        <div
          className="
            absolute
            bottom-[18%]
            left-[12%]
            h-1.5
            w-1.5
            rounded-full
            bg-[#A1683A]/45
            sm:left-[17%]
          "
        />

        <div
          className="
            absolute
            bottom-[23%]
            right-[10%]
            h-1.5
            w-1.5
            rounded-full
            bg-[#E8998D]/50
            sm:right-[15%]
          "
        />
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <nav
        className="
          relative
          z-50
          px-3
          pt-3
          sm:px-5
          sm:pt-4
          md:px-6
          md:pt-5
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[60px]
            w-full
            max-w-6xl
            items-center
            justify-between
            rounded-[18px]
            border
            border-[#33463F]/[0.07]
            bg-white/70
            px-2.5
            py-2
            shadow-[0_12px_40px_rgba(50,70,63,0.055)]
            backdrop-blur-2xl
            sm:min-h-[68px]
            sm:rounded-[20px]
            sm:px-4
          "
        >
          {/* =================================================
              BRAND
          ================================================== */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
              group
              flex
              min-w-0
              items-center
              gap-2
              rounded-[13px]
              px-1.5
              py-1.5
              transition-all
              duration-300
              hover:bg-[#6C9A8B]/[0.045]
              sm:gap-3
              sm:px-2
            "
          >
            {/* Logo */}
            <div className="relative shrink-0">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[11px]
                  bg-[#6C9A8B]
                  text-white
                  shadow-[0_8px_22px_rgba(108,154,139,0.22)]
                  transition-all
                  duration-300
                  group-hover:scale-105
                  group-hover:shadow-[0_10px_26px_rgba(108,154,139,0.30)]
                  sm:h-10
                  sm:w-10
                  sm:rounded-[13px]
                "
              >
                <Stethoscope
                  size={17}
                  strokeWidth={1.8}
                  className="sm:hidden"
                />

                <Stethoscope
                  size={18}
                  strokeWidth={1.8}
                  className="hidden sm:block"
                />
              </div>

              {/* Peach accent */}
              <span
                className="
                  absolute
                  -bottom-0.5
                  -right-0.5
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-white
                  bg-[#E8998D]
                "
              />
            </div>

            {/* Brand text */}
            <div className="min-w-0 text-left">
              <div
                className="
                  text-[15px]
                  font-semibold
                  tracking-[-0.045em]
                  text-[#33463F]
                  sm:text-[17px]
                "
              >
                Rx<span className="text-[#6C9A8B]">Flow</span>
              </div>

              <div
                className="
                  mt-[-1px]
                  hidden
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#33463F]/30
                  sm:block
                "
              >
                Prescription Workspace
              </div>
            </div>
          </button>

          {/* =================================================
              CENTER STATUS
          ================================================== */}
          <div className="hidden md:flex items-center">
            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[#6C9A8B]/10
                bg-[#6C9A8B]/[0.035]
                px-3.5
                py-2
              "
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-[#6C9A8B]/30
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-2
                    w-2
                    rounded-full
                    bg-[#6C9A8B]
                  "
                />
              </span>

              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#33463F]/45
                "
              >
                Workspace active
              </span>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="
                group
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[#33463F]/[0.07]
                bg-white/65
                py-1
                pl-1
                pr-2
                transition-all
                duration-300
                hover:border-[#6C9A8B]/20
                hover:bg-white
                hover:shadow-[0_8px_24px_rgba(50,70,63,0.06)]
                sm:gap-2.5
                sm:py-1.5
                sm:pl-1.5
                sm:pr-3.5
              "
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EED2CC]/70
                    text-[9px]
                    font-bold
                    text-[#6C9A8B]
                    ring-1
                    ring-[#6C9A8B]/10
                    transition-transform
                    duration-300
                    group-hover:scale-105
                    sm:h-9
                    sm:w-9
                    sm:text-[10px]
                  "
                >
                  {initials}
                </div>

                {/* Online indicator */}
                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-2
                    w-2
                    rounded-full
                    border-[1.5px]
                    border-white
                    bg-[#6C9A8B]
                    sm:h-2.5
                    sm:w-2.5
                    sm:border-2
                  "
                />
              </div>

              {/* Name */}
              <div className="hidden text-left sm:block">
                <p
                  className="
                    max-w-[120px]
                    truncate
                    text-[10px]
                    font-semibold
                    tracking-[-0.01em]
                    text-[#33463F]
                  "
                >
                  {doctorName}
                </p>

                <p
                  className="
                    mt-0.5
                    text-[7px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-[#33463F]/30
                  "
                >
                  My profile
                </p>
              </div>

              <ArrowRight
                size={11}
                className="
                  hidden
                  text-[#33463F]/20
                  transition-all
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:text-[#6C9A8B]
                  sm:block
                "
              />
            </button>

            {/* Divider */}
            <div
              className="
                mx-0.5
                hidden
                h-7
                w-px
                bg-[#33463F]/[0.07]
                sm:block
              "
            />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="
                group
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-[11px]
                border
                border-[#33463F]/[0.07]
                bg-white/55
                text-[#33463F]/30
                transition-all
                duration-300
                hover:border-[#E8998D]/25
                hover:bg-[#EED2CC]/30
                hover:text-[#A1683A]
                sm:h-10
                sm:w-10
                sm:rounded-[13px]
              "
            >
              <LogOut
                size={14}
                strokeWidth={1.8}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                  sm:h-[15px]
                  sm:w-[15px]
                "
              />
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[calc(100vh-76px)]
          w-full
          max-w-6xl
          flex-col
          px-4
          pb-6
          pt-6
          sm:min-h-[calc(100vh-88px)]
          sm:px-7
          sm:pb-5
          sm:pt-9
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}
        <section className="dashboard-enter shrink-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-6 bg-[#6C9A8B]/30 sm:w-7" />

            <span
              className="
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#6C9A8B]/70
                sm:text-[8px]
                sm:tracking-[0.25em]
              "
            >
              Your workspace
            </span>

            <span className="h-px w-6 bg-[#6C9A8B]/30 sm:w-7" />
          </div>

          <h1
            className="
              text-[28px]
              font-semibold
              tracking-[-0.055em]
              text-[#33463F]
              xs:text-[30px]
              sm:text-[40px]
            "
          >
            Good morning,{" "}
            <span className="text-[#6C9A8B]">
              {firstName}.
            </span>
          </h1>

          <p
            className="
              mt-1.5
              max-w-xl
              text-[10px]
              leading-[1.7]
              text-[#33463F]/50
              sm:text-[12px]
              sm:leading-5
            "
          >
            Everything you need to create, manage, and organize
            prescriptions — in one focused workspace.
          </p>
        </section>

        {/* =================================================
            ACTION CARDS
        ================================================== */}
        <section
          className="
            mt-6
            grid
            grid-cols-1
            gap-3
            sm:mt-7
            sm:gap-4
            md:flex-1
            md:grid-cols-3
            md:items-center
          "
        >
          {/* CREATE */}
          <ActionCard
            number="01"
            icon={FilePlus2}
            title="Create Prescription"
            description="Start a new professional prescription for your patient."
            action="Create prescription"
            featured
            onClick={() => navigate("/new-prescription")}
          />

          {/* MEDICINES */}
          <ActionCard
            number="02"
            icon={Pill}
            title="Medicine Library"
            description="Search, browse, and manage your medicine collection."
            action="Open medicine library"
            onClick={() => navigate("/medicines")}
          />

          {/* HISTORY */}
          <ActionCard
            number="03"
            icon={FileText}
            title="Prescription History"
            description="Find and review your previous prescription records."
            action="View prescription history"
            onClick={() => navigate("/prescription-history")}
          />
        </section>

        {/* =================================================
            FOOTER
        ================================================== */}
        <footer className="shrink-0 pt-5 text-center sm:pt-4">
          <span
            className="
              text-[7px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-[#33463F]/20
              sm:text-[8px]
              sm:tracking-[0.22em]
            "
          >
            Simple · Professional · Focused
          </span>
        </footer>
      </div>

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}
      <style>{`
        .dashboard-enter {
          animation: dashboardEnter 0.7s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        @keyframes dashboardEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-enter {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

/* ============================================================
   ACTION CARD
============================================================ */

function ActionCard({
  number,
  icon: Icon,
  title,
  description,
  action,
  featured = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-[20px]
        border
        p-5
        text-left
        transition-all
        duration-300
        hover:-translate-y-1
        active:translate-y-0
        sm:rounded-[24px]
        sm:p-6

        ${
          featured
            ? `
              border-[#6C9A8B]/20
              bg-[#6C9A8B]
              text-white
              shadow-[0_20px_50px_rgba(108,154,139,0.18)]
              hover:bg-[#5E8D7D]
              hover:shadow-[0_25px_55px_rgba(108,154,139,0.24)]
            `
            : `
              border-[#33463F]/[0.07]
              bg-white/65
              text-[#33463F]
              shadow-[0_18px_50px_rgba(50,70,63,0.055)]
              backdrop-blur-xl
              hover:border-[#6C9A8B]/20
              hover:bg-white/80
              hover:shadow-[0_22px_55px_rgba(50,70,63,0.09)]
            `
        }
      `}
    >
      {/* Decorative circle */}
      <div
        className={`
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-32
          w-32
          rounded-full
          border-[24px]
          transition-transform
          duration-500
          group-hover:scale-125
          sm:-right-12
          sm:-top-12
          sm:h-36
          sm:w-36
          sm:border-[28px]

          ${
            featured
              ? "border-white/[0.07]"
              : "border-[#6C9A8B]/[0.055]"
          }
        `}
      />

      <div className="relative">
        {/* Icon + number */}
        <div className="flex items-start justify-between">
          <div
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-[13px]
              transition-transform
              duration-300
              group-hover:scale-105
              sm:h-11
              sm:w-11
              sm:rounded-[14px]

              ${
                featured
                  ? "bg-white text-[#6C9A8B]"
                  : "bg-[#EED2CC]/35 text-[#6C9A8B]"
              }
            `}
          >
            <Icon
              size={19}
              strokeWidth={1.9}
              className="sm:h-5 sm:w-5"
            />
          </div>

          <span
            className={`
              text-[8px]
              font-semibold
              tracking-[0.15em]

              ${
                featured
                  ? "text-white/35"
                  : "text-[#33463F]/20"
              }
            `}
          >
            {number}
          </span>
        </div>

        {/* Title */}
        <h2
          className={`
            mt-6
            text-[16px]
            font-semibold
            tracking-[-0.03em]
            sm:mt-7
            sm:text-[17px]

            ${
              featured
                ? "text-white"
                : "text-[#33463F]"
            }
          `}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          className={`
            mt-2
            max-w-[300px]
            text-[10px]
            leading-5
            sm:min-h-[40px]
            sm:max-w-[260px]

            ${
              featured
                ? "text-white/60"
                : "text-[#33463F]/45"
            }
          `}
        >
          {description}
        </p>

        {/* Action */}
        <div
          className={`
            mt-5
            flex
            items-center
            gap-2
            text-[9px]
            font-semibold
            sm:mt-6

            ${
              featured
                ? "text-white/85"
                : "text-[#6C9A8B]"
            }
          `}
        >
          {action}

          <ArrowRight
            size={12}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </button>
  );
}

export default Dashboard;