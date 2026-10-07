import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Edit3,
  Mail,
  Phone,
  Save,
  Stethoscope,
  Building2,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const IMAGE_KEY_PREFIX = "rxflow-profile-image-";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    specialty: "",
    hospital_name: "",
    phone: "",
    logo_url: "",
  });

  const [draft, setDraft] = useState({
    full_name: "",
    specialty: "",
    hospital_name: "",
    phone: "",
    logo_url: "",
  });

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    loadProfile();
  }, [user]);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, specialty, hospital_name, phone, logo_url, created_at"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
      }

      const savedImage = localStorage.getItem(
        `${IMAGE_KEY_PREFIX}${user.id}`
      );

      const metadata = user.user_metadata || {};

      const fallbackName =
        data?.full_name ||
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "Doctor";

      const image =
        savedImage ||
        data?.logo_url ||
        metadata.avatar_url ||
        metadata.picture ||
        "";

      const loadedProfile = {
        full_name: fallbackName,
        specialty: data?.specialty || "",
        hospital_name: data?.hospital_name || "",
        phone: data?.phone || "",
        logo_url: image,
      };

      setProfile(loadedProfile);
      setDraft(loadedProfile);

      setEmail(user.email || "");
      setNewEmail(user.email || "");
    } catch (err) {
      console.error(err);
      setError("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be smaller than 4MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        logo_url: reader.result,
      }));
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  function removeImage() {
    setDraft((current) => ({
      ...current,
      logo_url: "",
    }));
  }

  async function saveProfile() {
    setError("");
    setMessage("");

    const name = draft.full_name.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id: user.id,
        full_name: name,
        specialty: draft.specialty.trim() || null,
        hospital_name: draft.hospital_name.trim() || null,
        phone: draft.phone.trim() || null,
        logo_url: null,
      };

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(payload, {
          onConflict: "id",
        });

      if (upsertError) {
        throw upsertError;
      }

      if (draft.logo_url) {
        localStorage.setItem(
          `${IMAGE_KEY_PREFIX}${user.id}`,
          draft.logo_url
        );
      } else {
        localStorage.removeItem(`${IMAGE_KEY_PREFIX}${user.id}`);
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: name,
        },
      });

      if (authError) {
        console.warn("Could not update auth metadata:", authError.message);
      }

      setProfile({
        ...draft,
        full_name: name,
        specialty: draft.specialty.trim(),
        hospital_name: draft.hospital_name.trim(),
        phone: draft.phone.trim(),
      });

      setDraft({
        ...draft,
        full_name: name,
        specialty: draft.specialty.trim(),
        hospital_name: draft.hospital_name.trim(),
        phone: draft.phone.trim(),
      });

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setDraft(profile);
    setEditing(false);
    setError("");
    setMessage("");
  }

  async function changeEmail() {
    setError("");
    setMessage("");

    const value = newEmail.trim();

    if (!value) {
      setError("Please enter your email.");
      return;
    }

    if (value === email) {
      setError("That is already your current email.");
      return;
    }

    setChangingEmail(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: value,
      });

      if (updateError) {
        throw updateError;
      }

      setEmail(value);
      setMessage("Check your new email address to confirm the change.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not change your email.");
    } finally {
      setChangingEmail(false);
    }
  }

  function getInitials(name) {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return "DR";

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F4] px-6 py-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-xl border border-[#6C9A8B]/15 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#33463F] shadow-sm backdrop-blur transition hover:bg-white"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="mx-auto mt-10 max-w-3xl animate-pulse">
          <div className="h-72 rounded-[28px] border border-[#6C9A8B]/10 bg-white/70" />
        </div>
      </div>
    );
  }

  const displayImage = editing ? draft.logo_url : profile.logo_url;
  const displayName = editing ? draft.full_name : profile.full_name;

  return (
    <div className="min-h-screen bg-[#FBF7F4] px-5 py-6 text-[#2E403A] sm:px-8">
      {/* BACK */}
      <button
        onClick={() => navigate("/dashboard")}
        className="group inline-flex items-center gap-2 rounded-xl border border-[#6C9A8B]/15 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#33463F] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
      >
        <ArrowLeft
          size={17}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to Dashboard
      </button>

      {/* MAIN */}
      <main className="mx-auto mt-8 max-w-3xl">
        {/* HEADER */}
        <div className="mb-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#6C9A8B]">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#2E403A]">
            Your Profile
          </h1>

          <p className="mt-1 text-sm text-[#33463F]/60">
            Keep your professional information up to date.
          </p>
        </div>

        {/* PROFILE CARD */}
        <section className="overflow-hidden rounded-[28px] border border-[#6C9A8B]/15 bg-white/85 shadow-[0_18px_60px_rgba(46,64,58,0.08)] backdrop-blur-xl">
          {/* TOP PROFILE */}
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            {/* IMAGE */}
            <div className="relative shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[30px] border border-[#6C9A8B]/15 bg-[#EED2CC]/45">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={displayName || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[#6C9A8B]">
                    {getInitials(displayName)}
                  </span>
                )}
              </div>

              {editing && (
                <>
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-white bg-[#6C9A8B] text-white shadow-md transition hover:bg-[#5E8D7D]"
                    title="Change photo"
                  >
                    <Camera size={17} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* NAME */}
            <div className="min-w-0 flex-1">
              {!editing ? (
                <>
                  <h2 className="truncate text-2xl font-bold text-[#2E403A]">
                    {profile.full_name || "Doctor"}
                  </h2>

                  <p className="mt-1 text-sm text-[#33463F]/60">
                    {profile.specialty || "Medical Professional"}
                  </p>

                  {profile.hospital_name && (
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#33463F]/75">
                      <Building2 size={15} />
                      {profile.hospital_name}
                    </p>
                  )}
                </>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-[#2E403A]">
                    Edit your information
                  </h2>

                  <p className="mt-1 text-sm text-[#33463F]/60">
                    Update the details you want to change.
                  </p>

                  {draft.logo_url && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1683A] hover:underline"
                    >
                      <X size={13} />
                      Remove photo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* EDIT BUTTON */}
            {!editing && (
              <button
                onClick={() => {
                  setDraft(profile);
                  setEditing(true);
                  setMessage("");
                  setError("");
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#6C9A8B] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5E8D7D] hover:shadow-md"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* FIELDS */}
          <div className="border-t border-[#6C9A8B]/10 p-6 sm:p-8">
            {editing ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  icon={<User size={16} />}
                  name="full_name"
                  value={draft.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />

                <Field
                  label="Specialty"
                  icon={<Stethoscope size={16} />}
                  name="specialty"
                  value={draft.specialty}
                  onChange={handleChange}
                  placeholder="e.g. General Physician"
                />

                <Field
                  label="Hospital / Clinic"
                  icon={<Building2 size={16} />}
                  name="hospital_name"
                  value={draft.hospital_name}
                  onChange={handleChange}
                  placeholder="Hospital or clinic name"
                />

                <Field
                  label="Phone"
                  icon={<Phone size={16} />}
                  name="phone"
                  value={draft.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />

                <div className="sm:col-span-2 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#6C9A8B]/15 bg-white px-5 py-3 text-sm font-bold text-[#33463F] transition hover:bg-[#FBF7F4] disabled:opacity-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C9A8B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#5E8D7D] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Info
                  icon={<User size={17} />}
                  label="Full Name"
                  value={profile.full_name}
                />

                <Info
                  icon={<Stethoscope size={17} />}
                  label="Specialty"
                  value={profile.specialty}
                />

                <Info
                  icon={<Building2 size={17} />}
                  label="Hospital / Clinic"
                  value={profile.hospital_name}
                />

                <Info
                  icon={<Phone size={17} />}
                  label="Phone"
                  value={profile.phone}
                />
              </div>
            )}
          </div>
        </section>

        {/* EMAIL */}
        <section className="mt-5 rounded-[24px] border border-[#6C9A8B]/15 bg-white/80 p-6 shadow-[0_12px_40px_rgba(46,64,58,0.05)] backdrop-blur-xl sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EED2CC]/45 text-[#6C9A8B]">
              <Mail size={18} />
            </div>

            <div>
              <h2 className="font-bold text-[#2E403A]">Email Address</h2>
              <p className="text-xs text-[#33463F]/55">
                Used for signing in to RxFlow.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex min-h-[46px] flex-1 items-center rounded-xl border border-[#6C9A8B]/10 bg-[#FBF7F4]/70 px-4 text-sm font-medium text-[#33463F]">
              <Mail size={16} className="mr-3 shrink-0 text-[#6C9A8B]" />
              <span className="truncate">{email || "No email"}</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email"
                className="min-h-[46px] rounded-xl border border-[#6C9A8B]/15 bg-white px-4 text-sm text-[#2E403A] outline-none transition placeholder:text-[#33463F]/35 focus:border-[#6C9A8B] focus:ring-4 focus:ring-[#6C9A8B]/10"
              />

              <button
                onClick={changeEmail}
                disabled={changingEmail}
                className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#33463F] px-4 text-sm font-bold text-white transition hover:bg-[#2E403A] disabled:opacity-60"
              >
                {changingEmail ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Updating
                  </>
                ) : (
                  "Change Email"
                )}
              </button>
            </div>
          </div>
        </section>

        {/* MESSAGES */}
        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#6C9A8B]/15 bg-[#6C9A8B]/10 px-4 py-3 text-sm font-semibold text-[#4F7F70]">
            <Check size={17} />
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-[#E8998D]/25 bg-[#E8998D]/10 px-4 py-3 text-sm font-semibold text-[#A1683A]">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#33463F]/60">
        {icon}
        {label}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-[#6C9A8B]/15 bg-[#FBF7F4]/60 px-4 text-sm font-medium text-[#2E403A] outline-none transition placeholder:text-[#33463F]/35 focus:border-[#6C9A8B] focus:bg-white focus:ring-4 focus:ring-[#6C9A8B]/10"
      />
    </label>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#6C9A8B]/10 bg-[#FBF7F4]/55 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#33463F]/45">
        {icon}
        {label}
      </div>

      <p className="truncate text-sm font-semibold text-[#33463F]">
        {value || "Not added"}
      </p>
    </div>
  );
}