import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  FileText,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PrescriptionHistory() {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function loadPrescriptions() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error: prescriptionsError } = await supabase
        .from("prescriptions")
        .select(`
          id,
          doctor_id,
          patient_id,
          prescription_date,
          notes,
          created_at,
          patient:patients!prescriptions_patient_id_fkey (
            id,
            patient_id,
            full_name,
            age,
            gender,
            phone,
            address
          ),
          prescription_items (
            id,
            medicine_id,
            medicine_name,
            generic_name,
            strength,
            form,
            dosage,
            frequency,
            duration,
            instructions,
            sort_order,
            created_at
          )
        `)
        .eq("doctor_id", user.id)
        .order("prescription_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (prescriptionsError) {
        throw new Error(prescriptionsError.message);
      }

      setPrescriptions(data || []);
    } catch (loadError) {
      console.error("Prescription history error:", loadError);

      setError(
        loadError.message ||
          "Something went wrong while loading prescription history."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredPrescriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return prescriptions;
    }

    return prescriptions.filter((prescription) => {
      const patient = prescription.patient;

      if (!patient) {
        return (
          prescription.id?.toLowerCase().includes(query) ||
          prescription.patient_id?.toLowerCase().includes(query)
        );
      }

      return (
        patient.full_name?.toLowerCase().includes(query) ||
        patient.patient_id?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query) ||
        patient.address?.toLowerCase().includes(query)
      );
    });
  }, [prescriptions, search]);

  function formatDate(date) {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function openPrescription(prescription) {
    navigate("/prescription-history/view", {
      state: {
        prescription,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#2E403A]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#EED2CC]/30 blur-[120px]" />

        <div className="absolute -right-32 bottom-[-120px] h-[440px] w-[440px] rounded-full bg-[#6C9A8B]/10 blur-[130px]" />

        <div className="absolute left-1/2 top-[38%] h-[300px] w-[300px] -translate-x-1/2 rounded-full border border-[#6C9A8B]/5" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#6C9A8B]/10 bg-[#FBF7F4]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-[74px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              aria-label="Back to dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6C9A8B]/15 bg-white/80 text-[#33463F] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <ArrowLeft
                size={18}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </button>

            <div className="hidden h-7 w-px bg-[#6C9A8B]/15 sm:block" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C9A8B]/10 text-[#6C9A8B]">
                <FileText size={18} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold tracking-tight text-[#2E403A] sm:text-base">
                  Prescription History
                </h1>

                <p className="hidden text-[10px] font-medium text-[#33463F]/45 sm:block">
                  Your saved prescription records
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/new-prescription")}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#6C9A8B] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#5E8D7D] hover:shadow-md sm:px-4 sm:text-sm"
          >
            <FileText size={16} />

            <span className="hidden sm:inline">
              New Prescription
            </span>

            <span className="sm:hidden">
              New
            </span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10">
        {/* Intro */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C9A8B]">
                RxFlow Records
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#2E403A] sm:text-4xl">
                Saved Prescriptions
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#33463F]/55">
                Find and review previous prescriptions by patient
                name, ID, or phone number.
              </p>
            </div>

            {!loading && !error && (
              <div className="flex items-center gap-2 self-start rounded-full border border-[#6C9A8B]/10 bg-white/65 px-3.5 py-2 text-xs font-medium text-[#33463F]/55 shadow-sm lg:self-auto">
                <span className="font-bold text-[#2E403A]">
                  {prescriptions.length}
                </span>

                {prescriptions.length === 1
                  ? "prescription"
                  : "prescriptions"}
              </div>
            )}
          </div>
        </section>

        {/* Search */}
        <section className="mb-8">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C9A8B]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient name, ID, or phone..."
              className="h-14 w-full rounded-2xl border border-[#6C9A8B]/15 bg-white/85 pl-12 pr-12 text-sm font-medium text-[#2E403A] shadow-[0_8px_30px_rgba(46,64,58,0.04)] outline-none backdrop-blur-xl transition duration-200 placeholder:text-[#33463F]/30 focus:border-[#6C9A8B] focus:bg-white focus:ring-4 focus:ring-[#6C9A8B]/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#33463F]/40 transition hover:bg-[#FBF7F4] hover:text-[#33463F]"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {!loading && !error && (
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-[11px] font-medium text-[#33463F]/40">
                {filteredPrescriptions.length}{" "}
                {filteredPrescriptions.length === 1
                  ? "result"
                  : "results"}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[11px] font-bold text-[#6C9A8B] transition hover:text-[#5E8D7D]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[230px] animate-pulse rounded-[24px] border border-[#6C9A8B]/10 bg-white/70"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-[26px] border border-[#E8998D]/20 bg-white/80 p-8 shadow-[0_12px_40px_rgba(46,64,58,0.05)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8998D]/10 text-[#A1683A]">
                <span className="text-lg font-black">
                  !
                </span>
              </div>

              <div>
                <h3 className="font-bold text-[#2E403A]">
                  Could not load history
                </h3>

                <p className="mt-1 break-words text-sm leading-6 text-[#A1683A]/80">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadPrescriptions}
                  className="mt-5 rounded-xl bg-[#6C9A8B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#5E8D7D]"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredPrescriptions.length === 0 && (
            <div className="rounded-[28px] border border-[#6C9A8B]/12 bg-white/70 px-6 py-16 text-center shadow-[0_12px_40px_rgba(46,64,58,0.04)] backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C9A8B]/10 text-[#6C9A8B]">
                {search ? (
                  <Search size={25} />
                ) : (
                  <FileText size={25} />
                )}
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#2E403A]">
                {search
                  ? "No prescriptions found"
                  : "No prescriptions yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#33463F]/50">
                {search
                  ? "Try searching with another patient name, ID, or phone number."
                  : "Your saved prescriptions will appear here after you create them."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => navigate("/new-prescription")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C9A8B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#5E8D7D] hover:shadow-md"
                >
                  <FileText size={16} />
                  Create Prescription
                </button>
              )}
            </div>
          )}

        {/* Prescription cards */}
        {!loading &&
          !error &&
          filteredPrescriptions.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPrescriptions.map((prescription) => {
                const patient = prescription.patient;

                const medicines =
                  prescription.prescription_items || [];

                const sortedMedicines = [...medicines].sort(
                  (a, b) =>
                    (a.sort_order || 0) -
                    (b.sort_order || 0)
                );

                return (
                  <button
                    key={prescription.id}
                    type="button"
                    onClick={() =>
                      openPrescription(prescription)
                    }
                    className="group relative w-full overflow-hidden rounded-[24px] border border-[#6C9A8B]/12 bg-white/80 p-5 text-left shadow-[0_8px_30px_rgba(46,64,58,0.04)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(46,64,58,0.09)] sm:p-6"
                  >
                    {/* Accent */}
                    <div className="absolute left-0 top-0 h-1 w-full bg-[#6C9A8B]/25 transition group-hover:bg-[#6C9A8B]" />

                    {/* Card top */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6C9A8B]/10 text-[#6C9A8B] transition duration-200 group-hover:scale-105">
                        <UserRound size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-[#2E403A] sm:text-lg">
                              {patient?.full_name ||
                                "Unknown Patient"}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="rounded-full bg-[#FBF7F4] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#33463F]/55">
                                ID:{" "}
                                {patient?.patient_id || "—"}
                              </span>

                              {patient?.age !== null &&
                                patient?.age !== undefined && (
                                  <span className="text-[10px] font-medium text-[#33463F]/40">
                                    Age {patient.age}
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 text-[#33463F]/40">
                            <CalendarDays size={14} />

                            <span className="text-[10px] font-semibold">
                              {formatDate(
                                prescription.prescription_date
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medicines */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {sortedMedicines
                        .slice(0, 4)
                        .map((medicine, index) => (
                          <span
                            key={
                              medicine.id ||
                              `${medicine.medicine_name}-${index}`
                            }
                            className="rounded-full border border-[#6C9A8B]/10 bg-[#6C9A8B]/5 px-3 py-1.5 text-[10px] font-semibold text-[#33463F]/65"
                          >
                            {medicine.medicine_name ||
                              "Medicine"}

                            {medicine.strength
                              ? ` ${medicine.strength}`
                              : ""}
                          </span>
                        ))}

                      {sortedMedicines.length > 4 && (
                        <span className="rounded-full bg-[#6C9A8B] px-3 py-1.5 text-[10px] font-bold text-white">
                          +{sortedMedicines.length - 4} more
                        </span>
                      )}

                      {sortedMedicines.length === 0 && (
                        <span className="rounded-full border border-[#E8998D]/15 bg-[#E8998D]/5 px-3 py-1.5 text-[10px] font-semibold text-[#A1683A]/65">
                          No medicines recorded
                        </span>
                      )}
                    </div>

                    {/* Notes preview */}
                    {prescription.notes && (
                      <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-[#33463F]/40">
                        {prescription.notes}
                      </p>
                    )}

                    {/* Bottom */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#6C9A8B]/10 pt-4">
                      <span className="text-[10px] font-semibold text-[#33463F]/35">
                        {sortedMedicines.length}{" "}
                        {sortedMedicines.length === 1
                          ? "medicine"
                          : "medicines"}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#6C9A8B] transition group-hover:text-[#5E8D7D]">
                        View prescription

                        <ChevronRight
                          size={14}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
      </main>
    </div>
  );
}

export default PrescriptionHistory;