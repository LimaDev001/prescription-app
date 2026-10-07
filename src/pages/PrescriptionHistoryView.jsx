import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/* =========================================================
   LOGO STORAGE
   SAME STORAGE USED BY NEW PRESCRIPTION
========================================================= */

const LOGO_DB_NAME = "rxflow-logo-db";
const LOGO_STORE_NAME = "logos";
const LOGO_KEY = "clinic-logo";

function openLogoDatabase() {
  return new Promise((resolve, reject) => {
    if (
      typeof window === "undefined" ||
      !window.indexedDB
    ) {
      reject(
        new Error(
          "IndexedDB is not available in this browser."
        )
      );
      return;
    }

    const request = window.indexedDB.open(
      LOGO_DB_NAME,
      1
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          LOGO_STORE_NAME
        )
      ) {
        db.createObjectStore(
          LOGO_STORE_NAME
        );
      }
    };

    request.onsuccess = () =>
      resolve(request.result);

    request.onerror = () =>
      reject(request.error);
  });
}

async function loadLogoFromStorage() {
  const db = await openLogoDatabase();

  try {
    return await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            LOGO_STORE_NAME,
            "readonly"
          );

        const store =
          transaction.objectStore(
            LOGO_STORE_NAME
          );

        const request =
          store.get(LOGO_KEY);

        request.onsuccess = () => {
          resolve(
            typeof request.result ===
              "string"
              ? request.result
              : ""
          );
        };

        request.onerror = () =>
          reject(request.error);
      }
    );
  } finally {
    db.close();
  }
}

/* =========================================================
   HELPERS
========================================================= */

function getSavedValue(key, fallback = "") {
  try {
    const value =
      localStorage.getItem(key);

    return value !== null
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );
}

/* =========================================================
   MAIN
========================================================= */

function PrescriptionHistoryView() {
  const navigate = useNavigate();
  const location = useLocation();

  const prescriptionFromState =
    location.state?.prescription;

  const [prescription, setPrescription] =
    useState(
      prescriptionFromState || null
    );

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] = useState(
    !prescriptionFromState
  );

  const [error, setError] =
    useState("");

  /* =====================================================
     CUSTOMIZATION
  ====================================================== */

  const [templateColor, setTemplateColor] =
    useState("#6C9A8B");

  const [customLogo, setCustomLogo] =
    useState("");

  const [hospitalNameOverride, setHospitalNameOverride] =
    useState(null);

  const [specialtyOverride, setSpecialtyOverride] =
    useState(null);

  /* =====================================================
     LOAD CUSTOMIZATION
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadCustomization() {
      try {
        /* ACCENT COLOR */

        const savedColor =
          getSavedValue(
            "rxflow-custom-color",
            "#6C9A8B"
          );

        if (mounted && savedColor) {
          setTemplateColor(savedColor);
        }

        /* HOSPITAL NAME */

        const savedHospitalName =
          localStorage.getItem(
            "prescription_hospital_name"
          );

        if (
          mounted &&
          savedHospitalName !== null
        ) {
          setHospitalNameOverride(
            savedHospitalName
          );
        }

        /* SPECIALTY */

        const savedSpecialty =
          localStorage.getItem(
            "prescription_medical_specialty"
          );

        if (
          mounted &&
          savedSpecialty !== null
        ) {
          setSpecialtyOverride(
            savedSpecialty
          );
        }

        /* LOGO */

        const savedLogo =
          await loadLogoFromStorage();

        if (mounted) {
          setCustomLogo(
            savedLogo || ""
          );
        }
      } catch (customizationError) {
        console.error(
          "Could not load prescription customization:",
          customizationError
        );
      }
    }

    loadCustomization();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     LOAD PRESCRIPTION
  ====================================================== */

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        let currentPrescription =
          prescriptionFromState;

        if (!currentPrescription) {
          setError(
            "This prescription could not be opened. Please return to prescription history."
          );

          setLoading(false);
          return;
        }

        if (
          currentPrescription.doctor_id &&
          currentPrescription.doctor_id !==
            user.id
        ) {
          setError(
            "You do not have access to this prescription."
          );

          setLoading(false);
          return;
        }

        /* LOAD MEDICINES */

        if (
          !currentPrescription.prescription_items
        ) {
          const {
            data: items,
            error: itemsError,
          } = await supabase
            .from("prescription_items")
            .select("*")
            .eq(
              "prescription_id",
              currentPrescription.id
            )
            .order("sort_order", {
              ascending: true,
            });

          if (itemsError) {
            throw new Error(
              itemsError.message
            );
          }

          currentPrescription = {
            ...currentPrescription,
            prescription_items:
              items || [],
          };
        }

        /* LOAD PATIENT */

        if (!currentPrescription.patient) {
          const {
            data: patient,
            error: patientError,
          } = await supabase
            .from("patients")
            .select("*")
            .eq(
              "id",
              currentPrescription.patient_id
            )
            .single();

          if (patientError) {
            throw new Error(
              patientError.message
            );
          }

          currentPrescription = {
            ...currentPrescription,
            patient,
          };
        }

        setPrescription(
          currentPrescription
        );

        /* LOAD PROFILE */

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (
          !profileError &&
          profileData
        ) {
          setProfile(profileData);
        }
      } catch (loadError) {
        console.error(
          "Prescription history view error:",
          loadError
        );

        setError(
          loadError.message ||
            "Something went wrong while opening this prescription."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    navigate,
    prescriptionFromState,
  ]);

  /* =====================================================
     PRINT
  ====================================================== */

  function handlePrint() {
    window.print();
  }

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7F4]">
        <div className="flex flex-col items-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white shadow-sm"
            style={{
              borderColor: `${templateColor}26`,
            }}
          >
            <Loader2
              size={25}
              className="animate-spin"
              style={{
                color: templateColor,
              }}
            />
          </div>

          <p className="mt-4 text-sm font-bold text-[#33463F]">
            Loading prescription...
          </p>

          <p className="mt-1 text-xs text-[#33463F]/40">
            Preparing your prescription record
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ====================================================== */

  if (error || !prescription) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FBF7F4] px-5">
        <div className="relative z-10 w-full max-w-md rounded-[30px] border border-[#6C9A8B]/12 bg-white p-8 text-center shadow-[0_20px_60px_rgba(46,64,58,0.08)]">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${templateColor}18`,
              color: templateColor,
            }}
          >
            <ShieldCheck size={26} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#2E403A]">
            Prescription unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#33463F]/50">
            {error ||
              "We could not find this prescription."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/prescription-history"
              )
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
            style={{
              backgroundColor: templateColor,
            }}
          >
            <ArrowLeft size={16} />
            Back to History
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     DATA
  ====================================================== */

  const patient =
    prescription.patient || {};

  const medicines =
    prescription.prescription_items || [];

  const hospitalName =
    hospitalNameOverride !== null
      ? hospitalNameOverride
      : profile?.hospital_name ||
        "Hospital / Clinic Name";

  const doctorName =
    profile?.full_name ||
    "Doctor Name";

  const specialty =
    specialtyOverride !== null
      ? specialtyOverride
      : profile?.specialty ||
        "Medical Specialty";

  const hospitalPhone =
    profile?.phone || "";

  const hospitalAddress =
    profile?.address ||
    profile?.hospital_address ||
    "";

  const patientId =
    patient.patient_id ||
    "Auto-generated";

  /*
   * Current NewPrescription saves `notes`.
   * Keep the existing history behavior here.
   */
  const clinicalRecord =
    prescription.notes
      ? prescription.notes
          .split("\n")
          .map((line) =>
            line.trim()
          )
          .filter(Boolean)
      : [];

  return (
    <div
      className="min-h-screen bg-[#FBF7F4] text-[#263630]"
      style={{
        "--rx-accent": templateColor,
      }}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#EED2CC]/25 blur-[130px]" />

        <div
          className="absolute -right-40 bottom-[-140px] h-[500px] w-[500px] rounded-full blur-[130px]"
          style={{
            backgroundColor: `${templateColor}12`,
          }}
        />
      </div>

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#6C9A8B]/10 bg-[#FBF7F4]/90 backdrop-blur-2xl print:hidden">
        <div className="mx-auto flex h-[74px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/prescription-history"
                )
              }
              aria-label="Back to prescription history"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6C9A8B]/15 bg-white text-[#33463F] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </button>

            <div className="hidden h-7 w-px bg-[#6C9A8B]/15 sm:block" />

            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${templateColor}18`,
                  color: templateColor,
                }}
              >
                <ShieldCheck size={18} />
              </div>

              <div>
                <h1 className="text-sm font-bold text-[#2E403A] sm:text-base">
                  Prescription
                </h1>

                <p className="hidden text-[10px] font-medium text-[#33463F]/45 sm:block">
                  Previous prescription
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md sm:text-sm"
            style={{
              backgroundColor: templateColor,
            }}
          >
            <Printer size={16} />
            <span>
              Print Prescription
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          PRESCRIPTION PAPER
      ====================================================== */}

      <main className="relative z-10 mx-auto flex max-w-[1200px] justify-center px-4 py-8 sm:px-6 sm:py-12 print:p-0">
        <div
          id="history-prescription-paper"
          className="w-full max-w-[850px] overflow-hidden bg-white shadow-[0_25px_80px_rgba(46,64,58,0.12)] ring-1 ring-[#6C9A8B]/10 print:max-w-none print:shadow-none print:ring-0"
        >
          {/* =================================================
              DYNAMIC ACCENT
          ================================================== */}

          <div
            className="h-[7px] w-full"
            style={{
              backgroundColor:
                templateColor,
            }}
          />

          <div className="p-7 sm:p-9 md:p-10 print:p-[15mm]">
            {/* =================================================
                HEADER
            ================================================== */}

            <header>
              <div className="flex items-start justify-between gap-8">
                <div className="flex min-w-0 items-center gap-4">
                  {/* CUSTOM LOGO */}

                  {customLogo ? (
                    <img
                      src={customLogo}
                      alt={`${hospitalName} logo`}
                      className="h-14 w-14 shrink-0 rounded-xl object-contain"
                    />
                  ) : profile?.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt={`${hospitalName} logo`}
                      className="h-14 w-14 shrink-0 rounded-xl object-contain"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${templateColor}18`,
                        color: templateColor,
                      }}
                    >
                      <FileText
                        size={26}
                        strokeWidth={1.7}
                      />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h1 className="truncate text-[24px] font-bold tracking-[-0.035em] text-[#263630]">
                      {hospitalName}
                    </h1>

                    <p
                      className="mt-1 text-[13px] font-bold uppercase tracking-[0.17em]"
                      style={{
                        color: templateColor,
                      }}
                    >
                      {specialty}
                    </p>

                    {(hospitalPhone ||
                      hospitalAddress) && (
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-[#7C8983]">
                        {hospitalPhone && (
                          <span className="flex items-center gap-1">
                            <Phone size={8} />
                            {hospitalPhone}
                          </span>
                        )}

                        {hospitalAddress && (
                          <span className="flex max-w-[320px] items-center gap-1 truncate">
                            <MapPin size={8} />
                            {hospitalAddress}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#909B96]">
                    <CalendarDays size={9} />
                    Date
                  </div>

                  <p className="mt-1 text-[14px] font-bold text-[#33463F]">
                    {formatDate(
                      prescription.prescription_date
                    )}
                  </p>
                </div>
              </div>

              {/* DYNAMIC DIVIDER */}

              <div
                className="mt-6 h-px"
                style={{
                  backgroundColor: `${templateColor}59`,
                }}
              />

              {/* =================================================
                  PATIENT INFORMATION
              ================================================== */}

              <div className="mt-4 overflow-x-auto">
                <div className="flex min-w-[720px] items-center gap-3 whitespace-nowrap">
                  <InlineValue
                    label="Patient"
                    value={
                      patient.full_name ||
                      "—"
                    }
                  />

                  <Divider />

                  <InlineValue
                    label="Age"
                    value={
                      patient.age !== null &&
                      patient.age !==
                        undefined &&
                      patient.age !== ""
                        ? patient.age
                        : "—"
                    }
                    className="w-[75px]"
                  />

                  <Divider />

                  <InlineValue
                    label="Gender"
                    value={
                      patient.gender ||
                      "—"
                    }
                    className="w-[105px]"
                  />

                  <Divider />

                  <InlineValue
                    label="Phone"
                    value={
                      patient.phone ||
                      "—"
                    }
                    className="min-w-[145px] flex-1"
                  />

                  <Divider />

                  <div className="flex min-w-[130px] shrink-0 items-baseline gap-1.5">
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8C9892]">
                      Patient No.
                    </span>

                    <span className="truncate text-[12px] font-bold text-[#33463F]">
                      {patientId}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* =================================================
                BODY
            ================================================== */}

            <main className="mt-5">
              <div className="grid min-h-[500px] grid-cols-[155px_minmax(0,1fr)] gap-5">
                {/* =================================================
                    CLINICAL RECORD
                ================================================== */}

                <aside className="flex min-h-0 flex-col border-r border-[#DDE5E1] pr-4">
                  <div className="flex shrink-0 items-center gap-2 border-b border-[#DDE5E1] pb-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          templateColor,
                      }}
                    />

                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        color: templateColor,
                      }}
                    >
                      Clinical Record
                    </p>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col">
                    {clinicalRecord.length >
                    0 ? (
                      clinicalRecord.map(
                        (
                          line,
                          index
                        ) => (
                          <div
                            key={index}
                            className="flex min-h-[24px] items-end border-b border-[#DDE5E1]"
                          >
                            <p className="w-full pb-1 text-[12px] text-[#26332F]">
                              {line}
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <>
                        <div className="h-[24px] border-b border-[#DDE5E1]" />
                        <div className="h-[24px] border-b border-[#DDE5E1]" />
                        <div className="h-[24px] border-b border-[#DDE5E1]" />
                        <div className="h-[24px] border-b border-[#DDE5E1]" />
                        <div className="h-[24px] border-b border-[#DDE5E1]" />
                      </>
                    )}
                  </div>
                </aside>

                {/* =================================================
                    RX
                ================================================== */}

                <section className="min-w-0">
                  <div className="mb-4 flex items-center gap-3">
                    <h2
                      className="text-[20px] font-bold tracking-[0.08em]"
                      style={{
                        color: templateColor,
                      }}
                    >
                      Rx
                    </h2>

                    <div
                      className="h-px flex-1"
                      style={{
                        backgroundColor: `${templateColor}33`,
                      }}
                    />
                  </div>

                  {/* TABLE HEADER */}

                  <div
                    className="grid grid-cols-[24px_1.65fr_1.15fr_0.9fr_1fr_0.9fr_1.45fr] gap-3 border-b border-[#DDE5E1] pb-2 text-[9px] font-extrabold uppercase tracking-[0.08em]"
                    style={{
                      color: templateColor,
                    }}
                  >
                    <div>#</div>
                    <div>
                      Medicine
                    </div>
                    <div>
                      Strength / Form
                    </div>
                    <div>
                      Dosage
                    </div>
                    <div>
                      Frequency
                    </div>
                    <div>
                      Duration
                    </div>
                    <div>
                      Instructions
                    </div>
                  </div>

                  {/* MEDICINES */}

                  <div>
                    {medicines.length >
                    0 ? (
                      medicines.map(
                        (
                          medicine,
                          index
                        ) => (
                          <HistoryMedicineRow
                            key={
                              medicine.id ||
                              index
                            }
                            medicine={
                              medicine
                            }
                            index={
                              index
                            }
                          />
                        )
                      )
                    ) : (
                      <div className="py-10 text-center text-xs text-[#8C9892]">
                        No medicines
                        recorded.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <footer className="mt-6 border-t border-[#DDE5E1] pt-4">
                <div className="flex items-end justify-between gap-8">
                  <div>
                    <p className="text-[13px] font-bold text-[#53625C]">
                      {hospitalName}
                    </p>

                    <div className="mt-1 flex items-center gap-3 text-[10px] text-[#89958F]">
                      {hospitalPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={7} />
                          {
                            hospitalPhone
                          }
                        </span>
                      )}

                      {hospitalAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin size={7} />
                          {
                            hospitalAddress
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-[180px] text-right">
                    <div
                      className="mb-2 ml-auto h-px w-[155px]"
                      style={{
                        backgroundColor:
                          "#BFCBC5",
                      }}
                    />

                    <p className="text-[14px] font-bold text-[#33463F]">
                      {doctorName}
                    </p>

                    <p
                      className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{
                        color: templateColor,
                      }}
                    >
                      {specialty}
                    </p>

                    <p className="mt-1 text-[9px] text-[#9AA49F]">
                      Authorized
                      Signature
                    </p>
                  </div>
                </div>
              </footer>

              {/* RECORD ID */}

              <div className="mt-5 flex items-center justify-between border-t border-[#DDE5E1] pt-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={12}
                    style={{
                      color: templateColor,
                    }}
                  />

                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#89958F]">
                    Electronic
                    Prescription
                  </span>
                </div>

                <span className="text-[8px] text-[#89958F]">
                  ID:{" "}
                  {prescription.id}
                </span>
              </div>
            </main>
          </div>
        </div>
      </main>

      {/* =====================================================
          PRINT STYLES
      ====================================================== */}

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            #root {
              width: 100%;
              margin: 0;
              padding: 0;
            }

            #history-prescription-paper {
              width: 210mm;
              min-height: 297mm;
              max-width: none;
              margin: 0;
              border-radius: 0 !important;
              box-shadow: none !important;
              border: none !important;
              ring: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   INLINE PATIENT FIELD
========================================================= */

function InlineValue({
  label,
  value,
  className = "",
}) {
  return (
    <div
      className={`flex min-w-0 items-baseline gap-1.5 ${className}`}
    >
      <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8C9892]">
        {label}
      </span>

      <span className="min-w-0 truncate text-[13px] font-bold text-[#33463F]">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   VERTICAL DIVIDER
========================================================= */

function Divider() {
  return (
    <div className="h-4 w-px shrink-0 bg-[#DDE4E0]" />
  );
}

/* =========================================================
   MEDICINE ROW
========================================================= */

function HistoryMedicineRow({
  medicine,
  index,
}) {
  const strengthForm = [
    medicine.strength,
    medicine.form,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="grid grid-cols-[24px_1.65fr_1.15fr_0.9fr_1fr_0.9fr_1.45fr] gap-3 border-b border-[#EEF2F0] py-4 text-[11px] text-[#33463F]">
      {/* NUMBER */}

      <div className="pt-0.5 font-bold text-[#8C9892]">
        {String(index + 1).padStart(
          2,
          "0"
        )}
      </div>

      {/* MEDICINE */}

      <div className="min-w-0">
        <p className="break-words font-bold text-[#263630]">
          {medicine.medicine_name ||
            "—"}
        </p>

        {medicine.generic_name && (
          <p className="mt-1 break-words text-[9px] italic text-[#8B9792]">
            {
              medicine.generic_name
            }
          </p>
        )}
      </div>

      {/* STRENGTH / FORM */}

      <div className="break-words">
        {strengthForm || "—"}
      </div>

      {/* DOSAGE */}

      <div className="break-words">
        {medicine.dosage || "—"}
      </div>

      {/* FREQUENCY */}

      <div className="break-words">
        {medicine.frequency ||
          "—"}
      </div>

      {/* DURATION */}

      <div className="break-words">
        {medicine.duration ||
          "—"}
      </div>

      {/* INSTRUCTIONS */}

      <div className="break-words">
        {medicine.instructions ||
          "—"}
      </div>
    </div>
  );
}

export default PrescriptionHistoryView;