import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function AddPatient() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patientId, setPatientId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!user) {
      setError("You must be logged in to add a patient.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("patients")
      .insert({
        doctor_id: user.id,
        patient_id: patientId.trim(),
        full_name: fullName.trim(),
        age: age ? Number(age) : null,
        phone: phone.trim() || null,
        address: address.trim() || null,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    navigate("/new-prescription", {
      state: {
        patient: data,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5">
          <button
            type="button"
            onClick={() => navigate("/new-prescription")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add New Patient
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a patient record before writing a prescription.
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Section Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus size={24} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Patient Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the patient's basic information.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient ID */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Patient ID
              </label>

              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. PT-1001"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />

              <p className="mt-2 text-xs text-slate-400">
                This ID will be used to quickly find the patient later.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Patient full name"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Age */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Age
              </label>

              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Patient age"
                min="0"
                max="150"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+93 700 000 000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Patient address"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/new-prescription")}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving Patient..." : "Save Patient"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddPatient;