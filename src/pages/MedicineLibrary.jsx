import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Pill,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

function MedicineLibrary() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [form, setForm] = useState({
    name: "",
    generic_name: "",
    strength: "",
    form: "",
  });

  // --------------------------------------------------
  // LOAD MEDICINES
  // --------------------------------------------------

  useEffect(() => {
    loadMedicines();
  }, []);

  async function loadMedicines() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("medicines")
      .select("id, name, generic_name, strength, form")
      .order("name", { ascending: true });

    if (error) {
      console.error("Load medicines error:", error);

      setError(error.message);
      setMedicines([]);
      setLoading(false);
      return;
    }

    setMedicines(data || []);
    setLoading(false);
  }

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredMedicines = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      return (
        medicine.name?.toLowerCase().includes(value) ||
        medicine.generic_name?.toLowerCase().includes(value) ||
        medicine.strength?.toLowerCase().includes(value) ||
        medicine.form?.toLowerCase().includes(value)
      );
    });
  }, [medicines, search]);

  // --------------------------------------------------
  // ADD MEDICINE MODAL
  // --------------------------------------------------

  function openAddModal() {
    setAddError("");

    setForm({
      name: "",
      generic_name: "",
      strength: "",
      form: "",
    });

    setShowAddModal(true);
  }

  function closeAddModal() {
    if (adding) return;

    setShowAddModal(false);
    setAddError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // --------------------------------------------------
  // ADD MEDICINE
  // --------------------------------------------------

  async function handleAddMedicine(event) {
    event.preventDefault();

    setAddError("");

    const name = form.name.trim();
    const genericName = form.generic_name.trim();
    const strength = form.strength.trim();
    const medicineForm = form.form.trim();

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name) {
      setAddError("Medicine name is required.");
      return;
    }

    if (!genericName) {
      setAddError("Generic name is required.");
      return;
    }

    if (!strength) {
      setAddError("Strength is required.");
      return;
    }

    if (!medicineForm) {
      setAddError("Medicine form is required.");
      return;
    }

    // -----------------------------
    // Duplicate check
    // -----------------------------

    const alreadyExists = medicines.some(
      (medicine) =>
        medicine.name?.trim().toLowerCase() === name.toLowerCase() &&
        medicine.strength?.trim().toLowerCase() ===
          strength.toLowerCase()
    );

    if (alreadyExists) {
      setAddError(
        "This medicine with the same strength already exists."
      );
      return;
    }

    setAdding(true);

    try {
      // ------------------------------------------------
      // Get currently logged-in user
      // ------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "You must be logged in to add a medicine."
        );
      }

      // ------------------------------------------------
      // Insert medicine
      // IMPORTANT:
      // created_by = current user's ID
      // is_system = false
      // ------------------------------------------------

      const { data, error } = await supabase
        .from("medicines")
        .insert({
          name,
          generic_name: genericName,
          strength,
          form: medicineForm,
          created_by: user.id,
          is_system: false,
          is_active: true,
        })
        .select("id, name, generic_name, strength, form")
        .single();

      if (error) {
        console.error("Add medicine error:", error);
        throw error;
      }

      // ------------------------------------------------
      // Add immediately to local list
      // ------------------------------------------------

      setMedicines((current) =>
        [...current, data].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      // Show newly created medicine in search
      setSearch(data.name);

      // Reset form
      setForm({
        name: "",
        generic_name: "",
        strength: "",
        form: "",
      });

      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error("Medicine creation failed:", error);

      setAddError(
        error?.message ||
          "Something went wrong while adding the medicine."
      );
    } finally {
      setAdding(false);
    }
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#2E403A]">
      {/* Soft background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#EED2CC]/25 blur-[110px]" />

        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#6C9A8B]/10 blur-[120px]" />
      </div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-30 border-b border-[#6C9A8B]/10 bg-[#FBF7F4]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6C9A8B]/15 bg-white/80 text-[#33463F] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C9A8B]/10 text-[#6C9A8B]">
                <Pill size={19} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight text-[#2E403A] sm:text-xl">
                  Medicine Library
                </h1>

                <p className="hidden text-xs text-[#33463F]/55 sm:block">
                  Your medicine database
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#6C9A8B] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#5E8D7D] hover:shadow-md"
          >
            <Plus size={17} />

            <span className="hidden sm:inline">
              Add Medicine
            </span>

            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="relative z-10 mx-auto max-w-[1400px] px-5 py-7 sm:px-8">
        {/* INTRO */}

        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6C9A8B]">
                RxFlow
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#2E403A] sm:text-4xl">
                Find a medicine
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#33463F]/60">
                Search your library by medicine name, generic
                name, strength, or form.
              </p>
            </div>

            <div className="text-sm text-[#33463F]/55">
              <span className="font-bold text-[#2E403A]">
                {medicines.length}
              </span>{" "}
              medicines in your library
            </div>
          </div>
        </section>

        {/* SEARCH */}

        <section className="mb-8">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C9A8B]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search medicine, generic name, strength..."
              className="h-14 w-full rounded-2xl border border-[#6C9A8B]/15 bg-white/85 pl-12 pr-12 text-sm font-medium text-[#2E403A] shadow-[0_8px_30px_rgba(46,64,58,0.04)] outline-none backdrop-blur-xl transition placeholder:text-[#33463F]/35 focus:border-[#6C9A8B] focus:bg-white focus:ring-4 focus:ring-[#6C9A8B]/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#33463F]/45 transition hover:bg-[#FBF7F4] hover:text-[#33463F]"
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </section>

        {/* RESULT HEADER */}

        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#2E403A]">
              {search ? "Search Results" : "All Medicines"}
            </h3>

            <p className="mt-0.5 text-xs text-[#33463F]/50">
              {search
                ? `${filteredMedicines.length} result${
                    filteredMedicines.length !== 1 ? "s" : ""
                  }`
                : "Available in your RxFlow library"}
            </p>
          </div>

          {search && (
            <span className="rounded-full bg-[#6C9A8B]/10 px-3 py-1.5 text-xs font-bold text-[#5E8D7D]">
              {filteredMedicines.length}
            </span>
          )}
        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-[22px] border border-[#6C9A8B]/10 bg-white/70"
              />
            ))}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-[24px] border border-[#E8998D]/20 bg-white/80 p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8998D]/10 text-[#A1683A]">
              <Pill size={22} />
            </div>

            <h3 className="mt-4 font-bold text-[#2E403A]">
              Could not load medicines
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#33463F]/55">
              {error}
            </p>

            <button
              type="button"
              onClick={loadMedicines}
              className="mt-5 rounded-xl bg-[#6C9A8B] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5E8D7D]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredMedicines.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-[#6C9A8B]/20 bg-white/60 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C9A8B]/10 text-[#6C9A8B]">
                <Search size={25} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#2E403A]">
                No medicines found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#33463F]/55">
                {search
                  ? "Try another medicine name, generic name, strength, or form."
                  : "Your medicine library is empty. Add your first medicine to get started."}
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C9A8B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5E8D7D]"
              >
                <Plus size={17} />
                Add Medicine
              </button>
            </div>
          )}

        {/* MEDICINE GRID */}

        {!loading &&
          !error &&
          filteredMedicines.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMedicines.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                />
              ))}
            </div>
          )}

        {/* BOTTOM ACTION */}

        {!loading && medicines.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/new-prescription")}
              className="group inline-flex items-center gap-2 rounded-xl border border-[#6C9A8B]/15 bg-white/75 px-5 py-3 text-sm font-bold text-[#33463F] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              Create Prescription

              <ChevronRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        )}
      </main>

      {/* ==================================================
          ADD MEDICINE MODAL
      ================================================== */}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E403A]/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddModal();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[#6C9A8B]/15 bg-[#FBF7F4] shadow-[0_30px_100px_rgba(46,64,58,0.22)]">
            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-[#6C9A8B]/10 bg-white/70 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6C9A8B]/10 text-[#6C9A8B]">
                  <Plus size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-[#2E403A]">
                    Add Medicine
                  </h2>

                  <p className="mt-0.5 text-xs text-[#33463F]/50">
                    Add a medicine to your library
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={adding}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#33463F]/45 transition hover:bg-[#E8998D]/10 hover:text-[#A1683A] disabled:opacity-40"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleAddMedicine}
              className="space-y-5 p-6 sm:p-7"
            >
              <InputField
                label="Medicine Name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Paracetamol"
                required
              />

              <InputField
                label="Generic Name"
                name="generic_name"
                value={form.generic_name}
                onChange={handleFormChange}
                placeholder="e.g. Acetaminophen"
                required
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Strength"
                  name="strength"
                  value={form.strength}
                  onChange={handleFormChange}
                  placeholder="e.g. 500 mg"
                  required
                />

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#33463F]/60">
                    Form
                  </label>

                  <select
                    name="form"
                    value={form.form}
                    onChange={handleFormChange}
                    required
                    className="h-12 w-full rounded-xl border border-[#6C9A8B]/15 bg-white px-4 text-sm font-medium text-[#2E403A] outline-none transition focus:border-[#6C9A8B] focus:ring-4 focus:ring-[#6C9A8B]/10"
                  >
                    <option value="">Select form</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Solution">Solution</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {addError && (
                <div className="rounded-xl border border-[#E8998D]/20 bg-[#E8998D]/10 p-3 text-sm font-medium text-[#A1683A]">
                  {addError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={adding}
                  className="rounded-xl border border-[#6C9A8B]/15 bg-white px-5 py-3 text-sm font-bold text-[#33463F] transition hover:bg-[#FBF7F4] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#6C9A8B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5E8D7D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Add Medicine
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// MEDICINE CARD
// ======================================================

function MedicineCard({ medicine }) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-[#6C9A8B]/12 bg-white/80 p-5 shadow-[0_8px_30px_rgba(46,64,58,0.04)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(46,64,58,0.08)]">
      <div className="absolute left-0 top-0 h-1 w-full bg-[#6C9A8B]/35 transition group-hover:bg-[#6C9A8B]" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6C9A8B]/10 text-[#6C9A8B] transition group-hover:scale-105">
          <Pill size={20} />
        </div>

        {medicine.form && (
          <span className="rounded-full bg-[#FBF7F4] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#33463F]/60">
            {medicine.form}
          </span>
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-bold text-[#2E403A]">
          {medicine.name}
        </h3>

        <p className="mt-1 text-sm italic text-[#33463F]/55">
          {medicine.generic_name ||
            "Generic name not available"}
        </p>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-[#6C9A8B]/10 pt-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#33463F]/35">
            Strength
          </p>

          <p className="mt-1 text-sm font-bold text-[#33463F]">
            {medicine.strength || "—"}
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBF7F4] text-[#33463F]/35 transition group-hover:bg-[#6C9A8B]/10 group-hover:text-[#6C9A8B]">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// INPUT
// ======================================================

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#33463F]/60">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-[#6C9A8B]/15 bg-white px-4 text-sm font-medium text-[#2E403A] outline-none transition placeholder:text-[#33463F]/30 focus:border-[#6C9A8B] focus:ring-4 focus:ring-[#6C9A8B]/10"
      />
    </div>
  );
}

export default MedicineLibrary;