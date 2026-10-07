import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Mail,
  Pencil,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, specialty, hospital_name, logo_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();
  }, [user?.id]);

  const doctorName =
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Doctor";

  const specialty =
    profile?.specialty?.trim() ||
    "Medical Professional";

  const hospital =
    profile?.hospital_name?.trim() ||
    "RxFlow Workspace";

  const email = user?.email || "No email available";

  const initials = doctorName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("") || "DR";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0FBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#C2DFE3] border-t-[#05668D]" />

          <p className="mt-4 text-xs font-bold text-[#5C6B73]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0FBFC] text-[#253237]">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#5C6B73] transition hover:bg-white/60 hover:text-[#253237]"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile-setup")}
            className="flex items-center gap-2 rounded-xl bg-[#253237] px-4 py-2.5 text-xs font-bold text-[#E0FBFC] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#5C6B73]"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>

        {/* PROFILE HERO */}

        <section className="relative overflow-hidden rounded-[32px] bg-[#253237] shadow-[0_35px_80px_-35px_rgba(37,50,55,0.65)]">
          {/* Decoration */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[60px] border-[#5C6B73]/20" />

            <div className="absolute -bottom-40 left-[35%] h-80 w-80 rounded-full border-[45px] border-[#9DB4C0]/10" />

            <div className="absolute right-[25%] top-16 h-2 w-2 rounded-full bg-[#E0FBFC]" />

            <div className="absolute right-[28%] top-28 h-1.5 w-1.5 rounded-full bg-[#9DB4C0]" />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-12">

            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">

              {/* AVATAR */}

              <div className="relative shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[30px] border-4 border-[#5C6B73] bg-[#C2DFE3] text-3xl font-black text-[#253237] shadow-2xl sm:h-36 sm:w-36 sm:text-4xl">
                  {profile?.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt={doctorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#253237] bg-[#9DB4C0]">
                  <ShieldCheck
                    size={17}
                    className="text-[#253237]"
                  />
                </div>
              </div>

              {/* INFO */}

              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#5C6B73]/30 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9DB4C0]" />

                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#9DB4C0]">
                    Doctor Profile
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-[-0.04em] text-[#E0FBFC] sm:text-4xl">
                  {doctorName}
                </h1>

                <p className="mt-2 text-sm font-semibold text-[#C2DFE3]">
                  {specialty}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#5C6B73]/30 px-3 py-2 text-[9px] font-bold text-[#C2DFE3]">
                    <Building2 size={13} />
                    {hospital}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#5C6B73]/30 px-3 py-2 text-[9px] font-bold text-[#C2DFE3]">
                    <Mail size={13} />
                    {email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE INFORMATION */}

        <section className="mt-6 grid gap-5 md:grid-cols-2">

          {/* PERSONAL */}

          <ProfileCard
            icon={UserRound}
            title="Personal Information"
            description="Your basic profile information"
          >
            <InfoRow
              label="Full Name"
              value={doctorName}
            />

            <InfoRow
              label="Email"
              value={email}
            />
          </ProfileCard>

          {/* PROFESSIONAL */}

          <ProfileCard
            icon={Stethoscope}
            title="Professional Information"
            description="Your medical workspace details"
          >
            <InfoRow
              label="Specialty"
              value={specialty}
            />

            <InfoRow
              label="Hospital / Clinic"
              value={hospital}
            />
          </ProfileCard>
        </section>

        {/* ACCOUNT STATUS */}

        <section className="mt-5 rounded-[28px] border border-[#C2DFE3] bg-[#E0FBFC] p-6 shadow-[0_18px_50px_-28px_rgba(37,50,55,0.35)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C2DFE3] text-[#253237]">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#5C6B73]">
                Account Status
              </p>

              <p className="mt-1 text-sm font-black text-[#253237]">
                Your RxFlow workspace is active
              </p>
            </div>

            <div className="ml-auto hidden items-center gap-2 rounded-full bg-[#C2DFE3] px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#05668D]" />

              <span className="text-[8px] font-black uppercase tracking-wider text-[#253237]">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="mt-8 flex items-center justify-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9DB4C0]" />

          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#5C6B73]">
            RxFlow • Doctor Profile
          </p>

          <span className="h-1.5 w-1.5 rounded-full bg-[#9DB4C0]" />
        </footer>
      </main>
    </div>
  );
}

function ProfileCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div className="rounded-[28px] border border-[#C2DFE3] bg-[#E0FBFC] p-6 shadow-[0_18px_50px_-28px_rgba(37,50,55,0.35)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#253237] text-[#E0FBFC]">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="text-sm font-black text-[#253237]">
            {title}
          </h2>

          <p className="mt-0.5 text-[9px] font-semibold text-[#5C6B73]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-[#C2DFE3]">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="text-[9px] font-black uppercase tracking-wider text-[#9DB4C0]">
        {label}
      </p>

      <p className="max-w-[65%] truncate text-right text-xs font-bold text-[#253237]">
        {value}
      </p>
    </div>
  );
}

export default Profile;