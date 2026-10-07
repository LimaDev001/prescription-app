import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ImagePlus,
  Palette,
  Upload,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  History,
  MapPin,
  Phone,
  Pill,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  bg: "#EEEAE6",
  paper: "#FFFFFF",
  green: "#6C9A8B",
  greenDark: "#33463F",
  greenSoft: "#E8F0ED",
  border: "#DDE5E1",
  muted: "#89958F",
};

/* =========================================================
   TEMPLATES
========================================================= */

const STANDARD_TEMPLATES = [
  {
    id: "classic",
    name: "Classic Medical",
    layout: "classic",
    style: "classic",
    color: "#253237",
  },
  {
    id: "modern",
    name: "Modern Clinical",
    layout: "modern",
    style: "modern",
    color: "#05668D",
  },
  {
    id: "hospital",
    name: "Hospital Standard",
    layout: "hospital",
    style: "hospital",
    color: "#00A896",
  },
  {
    id: "minimal",
    name: "Minimal Care",
    layout: "minimal",
    style: "minimal",
    color: "#02C39A",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function cleanValue(value, fallback = "") {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value).trim() || fallback;
}

function formatDate() {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  ).format(new Date());
}

function generatePatientId() {
  const now = new Date();

  const year = String(
    now.getFullYear()
  ).slice(-2);

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  // Timestamp + random part makes collisions extremely unlikely.
  const timePart = String(
    Date.now()
  ).slice(-6);

  const randomPart = Math.floor(
    100 + Math.random() * 900
  );

  return `PT-${year}${month}${day}-${timePart}${randomPart}`;
}

async function generateUniquePatientNo(doctorId) {
  let attempts = 0;

  while (attempts < 10) {
    const candidate = generatePatientId();

    const { data, error } = await supabase
      .from("patients")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("patient_id", candidate)
      .maybeSingle();

    if (error) {
      console.error("Patient No. check error:", error);
      // Still return a freshly generated value; the database can enforce
      // uniqueness if a unique constraint exists on patient_id.
      return candidate;
    }

    if (!data) return candidate;

    attempts += 1;
  }

  return generatePatientId();
}

function getSavedTemplate() {
  try {
    const saved =
      localStorage.getItem(
        "rxflow-selected-template"
      );

    if (!saved) return null;

    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function getCustomTemplates() {
  try {
    const saved =
      localStorage.getItem(
        "rxflow-custom-templates"
      );

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

const LOGO_DB_NAME = "rxflow-logo-db";
const LOGO_STORE_NAME = "logos";
const LOGO_KEY = "clinic-logo";

function openLogoDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(
      LOGO_DB_NAME,
      1
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(LOGO_STORE_NAME)) {
        db.createObjectStore(LOGO_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLogoToStorage(logo) {
  if (!logo) return;

  const db = await openLogoDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        LOGO_STORE_NAME,
        "readwrite"
      );
      const store = transaction.objectStore(
        LOGO_STORE_NAME
      );

      store.put(logo, LOGO_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(
          transaction.error ||
            new Error("Logo save was aborted.")
        );
    });
  } finally {
    db.close();
  }
}

async function loadLogoFromStorage() {
  const db = await openLogoDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        LOGO_STORE_NAME,
        "readonly"
      );
      const store = transaction.objectStore(
        LOGO_STORE_NAME
      );
      const request = store.get(LOGO_KEY);

      request.onsuccess = () =>
        resolve(
          typeof request.result === "string"
            ? request.result
            : ""
        );
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function removeLogoFromStorage() {
  const db = await openLogoDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        LOGO_STORE_NAME,
        "readwrite"
      );
      const store = transaction.objectStore(
        LOGO_STORE_NAME
      );

      store.delete(LOGO_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(
          transaction.error ||
            new Error("Logo removal was aborted.")
        );
    });
  } finally {
    db.close();
  }
}

function getInitialTemplate() {
  return (
    getSavedTemplate() ||
    getCustomTemplates()[0] ||
    STANDARD_TEMPLATES[1]
  );
}

/* =========================================================
   INLINE FIELD
========================================================= */

function InlineField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  inputClassName = "",
  inputRef,
  onKeyDown,
}) {
  return (
    <div
      className={`flex min-w-0 items-baseline gap-1.5 ${className}`}
    >
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C9892]">
        {label}
      </span>

      <input
        ref={inputRef}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        onKeyDown={onKeyDown}
        type={type}
        placeholder={placeholder}
        className={`min-w-0 flex-1 border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-[10px] font-semibold text-[#33463F] outline-none transition placeholder:text-[#B1BAB6] hover:border-[#D5DFDA] focus:border-[#6C9A8B] ${inputClassName}`}
      />
    </div>
  );
}

/* =========================================================
   ICON ACTION BUTTON (with hover tooltip)
========================================================= */

function IconAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  loading,
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DADFDA] bg-white text-[#62716A] transition hover:border-[#BFCBC5] hover:bg-[#F5F9F7] hover:text-[#33463F] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DADFDA] border-t-[#33463F]" />
        ) : (
          <Icon size={14} />
        )}
      </button>

      {/* TOOLTIP */}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#33463F] px-2 py-1 text-[8px] font-semibold text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
        {label}
        <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-[#33463F]" />
      </span>
    </div>
  );
}

/* =========================================================
   LOGO
========================================================= */

function PaperLogo({
  profile,
  hospitalName,
  customLogo,
}) {
  const [imageError, setImageError] =
    useState(false);

  const logoSource =
    customLogo || profile?.logo_url;

  if (
    logoSource &&
    !imageError
  ) {
    return (
      <img
        src={logoSource}
        alt={`${hospitalName} logo`}
        onError={() =>
          setImageError(true)
        }
        className="rxflow-paper-logo h-[82px] w-[82px] shrink-0 rounded-xl object-contain"
      />
    );
  }

  return (
    <div
      className="rxflow-paper-logo flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-xl"
      style={{
        backgroundColor:
          COLORS.greenSoft,
        color: COLORS.greenDark,
      }}
    >
      <FileText
        size={38}
        strokeWidth={1.7}
      />
    </div>
  );
}

/* =========================================================
   MEDICINE ROW
========================================================= */

function MedicineRow({
  medicine,
  index,
  suggestions,
  showSuggestions,
  onMedicineChange,
  onSelectSuggestion,
  onRemove,
  onFieldChange,
  onMedicineKeyDown,
}) {
  const fields = [
    "medicine",
    "strengthForm",
    "dosage",
    "frequency",
    "duration",
    "instructions",
  ];

  function handleKeyDown(event, field) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (field === "medicine") {
      onMedicineKeyDown(event, medicine);
      return;
    }

    if (field === "instructions") {
      onMedicineKeyDown(event, medicine);
      return;
    }

    const currentIndex = fields.indexOf(field);
    const nextField = fields[currentIndex + 1];

    if (!nextField) {
      onMedicineKeyDown(event, medicine);
      return;
    }

    const nextInput = document.querySelector(
      `[data-medicine-id="${medicine.id}"][data-field="${nextField}"]`
    );

    nextInput?.focus();
  }

  return (
    <div
      data-medicine-row
      className="group relative border-b border-[#E7ECE9] py-3 last:border-b-0"
    >
      <div className="grid grid-cols-[24px_1.65fr_1.15fr_0.9fr_1fr_0.9fr_1.45fr_22px] items-center gap-3">
        {/* NUMBER */}
        <div className="text-[11px] font-bold text-[#9AA59F]">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* MEDICINE */}
        <div className="relative min-w-0">
          <input
            data-medicine-id={medicine.id}
            data-field="medicine"
            value={medicine.medicine_name || ""}
            onChange={(event) =>
              onMedicineChange(event.target.value)
            }
            onKeyDown={(event) =>
              handleKeyDown(event, "medicine")
            }
            placeholder="Medicine"
            className="rxflow-medicine-input w-full border-0 bg-transparent px-0 py-1 text-[11px] font-bold text-[#33463F] outline-none placeholder:text-[#B8C0BC]"
          />

          {medicine.generic_name && (
            <p className="mt-0.5 truncate text-[9px] text-[#8A9791]">
              {medicine.generic_name}
            </p>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-8 z-50 w-[300px] overflow-hidden rounded-xl border border-[#D9E2DE] bg-white shadow-[0_15px_35px_rgba(51,70,63,0.15)]">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelectSuggestion(suggestion);
                  }}
                  className="flex w-full items-start gap-3 border-b border-[#EEF2F0] px-3 py-3 text-left last:border-b-0 hover:bg-[#F5F9F7]"
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: COLORS.greenSoft,
                      color: COLORS.greenDark,
                    }}
                  >
                    <Pill size={13} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-[#33463F]">
                      {suggestion.name}
                    </p>
                    <p className="mt-0.5 truncate text-[7px] text-[#89958F]">
                      {[
                        suggestion.generic_name,
                        suggestion.strength,
                        suggestion.form,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STRENGTH / FORM */}
        <input
          data-medicine-id={medicine.id}
          data-field="strengthForm"
          value={
            medicine.strengthForm ||
            [medicine.strength, medicine.form]
              .filter(Boolean)
              .join(" / ")
          }
          onChange={(event) =>
            onFieldChange(
              medicine.id,
              "strengthForm",
              event.target.value
            )
          }
          onKeyDown={(event) =>
            handleKeyDown(event, "strengthForm")
          }
          placeholder="Strength / Form"
          className="rxflow-medicine-input w-full border-0 bg-transparent px-0 py-1 text-[11px] font-medium text-[#55645E] outline-none placeholder:text-[#B0BAB5]"
        />

        {/* DOSAGE */}
        <input
          data-medicine-id={medicine.id}
          data-field="dosage"
          value={medicine.dosage || ""}
          onChange={(event) =>
            onFieldChange(
              medicine.id,
              "dosage",
              event.target.value
            )
          }
          onKeyDown={(event) =>
            handleKeyDown(event, "dosage")
          }
          placeholder="Dosage"
          className="rxflow-medicine-input w-full border-0 bg-transparent px-0 py-1 text-[11px] font-medium text-[#55645E] outline-none placeholder:text-[#B0BAB5]"
        />

        {/* FREQUENCY */}
        <input
          data-medicine-id={medicine.id}
          data-field="frequency"
          value={medicine.frequency || ""}
          onChange={(event) =>
            onFieldChange(
              medicine.id,
              "frequency",
              event.target.value
            )
          }
          onKeyDown={(event) =>
            handleKeyDown(event, "frequency")
          }
          placeholder="Frequency"
          className="rxflow-medicine-input w-full border-0 bg-transparent px-0 py-1 text-[11px] font-medium text-[#55645E] outline-none placeholder:text-[#B0BAB5]"
        />

        {/* DURATION */}
        <input
          data-medicine-id={medicine.id}
          data-field="duration"
          value={medicine.duration || ""}
          onChange={(event) =>
            onFieldChange(
              medicine.id,
              "duration",
              event.target.value
            )
          }
          onKeyDown={(event) =>
            handleKeyDown(event, "duration")
          }
          placeholder="Duration"
          className="rxflow-medicine-input w-full border-0 bg-transparent px-0 py-1 text-[11px] font-medium text-[#55645E] outline-none placeholder:text-[#B0BAB5]"
        />

        {/* INSTRUCTIONS */}
        <input
          data-medicine-id={medicine.id}
          data-field="instructions"
          value={medicine.instructions || ""}
          onChange={(event) =>
            onFieldChange(
              medicine.id,
              "instructions",
              event.target.value
            )
          }
          onKeyDown={(event) =>
            handleKeyDown(event, "instructions")
          }
          placeholder="Instructions"
          className="rxflow-medicine-input w-full border-0 bg-transparent px-0 py-1 text-[11px] font-medium text-[#55645E] outline-none placeholder:text-[#B0BAB5]"
        />

        {/* DELETE */}
        <button
          type="button"
          onClick={() => onRemove(medicine.id)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[#A6B0AB] opacity-0 transition hover:bg-[#FCEDEA] hover:text-[#B35F55] group-hover:opacity-100"
          title="Remove medicine"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function NewPrescription() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* PROFILE */
  const [profile, setProfile] =
    useState(null);

  /* EDITABLE HOSPITAL NAME */
  const [
    hospitalNameOverride,
    setHospitalNameOverride,
  ] = useState(null);

  /* EDITABLE MEDICAL SPECIALTY */
  const [
    specialtyOverride,
    setSpecialtyOverride,
  ] = useState(null);

  /* PATIENT */
  const [
    patient,
    setPatient,
  ] = useState({
    full_name: "",
    age: "",
    gender: "",
    phone: "",
    patient_id: "",
    address: "",
  });

  const [
    existingPatient,
    setExistingPatient,
  ] = useState(null);

  const [
    patientSearchOpen,
    setPatientSearchOpen,
  ] = useState(false);

  const [
    patientSuggestions,
    setPatientSuggestions,
  ] = useState([]);

  const [
    patientLoading,
    setPatientLoading,
  ] = useState(false);

  const [
    patientSearch,
    setPatientSearch,
  ] = useState("");

  /* MEDICINES */
  const [
    addedMedicines,
    setAddedMedicines,
  ] = useState(() => [
    {
      id: "medicine-initial",
      medicine_id: null,
      medicine_name: "",
      generic_name: "",
      strength: "",
      form: "",
      strengthForm: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  const [
    activeMedicineId,
    setActiveMedicineId,
  ] = useState(null);

  const [
    medicineSuggestions,
    setMedicineSuggestions,
  ] = useState([]);

  const [
    medicineLoading,
    setMedicineLoading,
  ] = useState(false);

  /* NOTES */
  const [notes, setNotes] =
    useState("");

  /* CLINICAL RECORD */
  const [
    clinicalRecordLines,
    setClinicalRecordLines,
  ] = useState([""]);

  const clinicalRecordRefs =
    useRef([]);

  /* TEMPLATE */
  const [
    selectedTemplate,
    setSelectedTemplate,
  ] = useState(
    getInitialTemplate()
  );

  const [
    templateColor,
    setTemplateColor,
  ] = useState(() => {
    try {
      return (
        localStorage.getItem(
          "rxflow-custom-color"
        ) ||
        getInitialTemplate()?.color ||
        COLORS.green
      );
    } catch {
      return (
        getInitialTemplate()?.color ||
        COLORS.green
      );
    }
  });

  const [customLogo, setCustomLogo] = useState(
    ""
  );
  const logoLoadedRef = useRef(false);

  /* UI */
  const [
    showTemplatePanel,
    setShowTemplatePanel,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    savingHistory,
    setSavingHistory,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    toast,
    setToast,
  ] = useState("");

  const [
    paperScale,
    setPaperScale,
  ] = useState(0.8);

  const [
    activeField,
    setActiveField,
  ] = useState(null);

  const paperContainerRef =
    useRef(null);

  const paperRef =
    useRef(null);

  const patientNameRef =
    useRef(null);

  const patientAgeRef =
    useRef(null);

  const patientGenderRef =
    useRef(null);

  const patientPhoneRef =
    useRef(null);

  const medicineRefs =
    useRef({});

  const notesRef =
    useRef(null);

  /* =========================================================
     LOAD PROFILE
  ========================================================== */

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    async function loadProfile() {
      const { data, error } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

      if (error) {
        console.error(
          "Profile loading error:",
          error
        );
        return;
      }

      if (mounted) {
        setProfile(data || null);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  /* =========================================================
     PAPER SCALE
  ========================================================== */

  useEffect(() => {
    const element =
      paperContainerRef.current;

    if (!element) return;

    const updateScale = () => {
      const width =
        element.getBoundingClientRect()
          .width;

      // Keep desktop EXACTLY the same.
      // On small screens, leave a little extra breathing room so the full
      // A4 prescription fits comfortably without changing its internal layout.
      const isSmallScreen = window.innerWidth < 640;
      const availableWidth = isSmallScreen
        ? Math.max(width - 32, 260)
        : Math.max(width - 16, 280);

      const scale =
        availableWidth / 794;

      setPaperScale(
        Math.min(
          Math.max(scale, 0.35),
          0.92
        )
      );
    };

    updateScale();

    const observer =
      new ResizeObserver(updateScale);

    observer.observe(element);

    window.addEventListener(
      "resize",
      updateScale
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "resize",
        updateScale
      );
    };
  }, []);

  /* =========================================================
     TEMPLATE
  ========================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        "rxflow-selected-template",
        JSON.stringify(
          selectedTemplate
        )
      );
    } catch {
      // ignore
    }
  }, [selectedTemplate]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "rxflow-custom-color",
        templateColor
      );
    } catch {
      // ignore
    }
  }, [templateColor]);

  useEffect(() => {
    let mounted = true;

    async function loadSavedLogo() {
      try {
        let savedLogo = await loadLogoFromStorage();

        // Migrate an older logo that was stored in localStorage.
        if (!savedLogo) {
          try {
            savedLogo =
              localStorage.getItem(
                "rxflow-custom-logo"
              ) ||
              "";
          } catch {
            savedLogo = "";
          }

          if (savedLogo) {
            try {
              await saveLogoToStorage(savedLogo);
              localStorage.removeItem(
                "rxflow-custom-logo"
              );
            } catch (migrationError) {
              console.error(
                "Could not migrate clinic logo:",
                migrationError
              );
            }
          }
        }

        if (mounted) {
          setCustomLogo(savedLogo || "");
          logoLoadedRef.current = true;
        }
      } catch (error) {
        console.error(
          "Could not load clinic logo:",
          error
        );

        if (mounted) {
          logoLoadedRef.current = true;
        }
      }
    }

    loadSavedLogo();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!logoLoadedRef.current) return;

    if (!customLogo) {
      removeLogoFromStorage().catch((error) => {
        console.error(
          "Could not remove clinic logo:",
          error
        );
      });
      return;
    }

    saveLogoToStorage(customLogo).catch((error) => {
      console.error(
        "Could not save clinic logo:",
        error
      );
    });
  }, [customLogo]);

  /* =========================================================
     TOAST AUTO-DISMISS
  ========================================================== */

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => {
      setToast("");
    }, 2600);

    return () => clearTimeout(timeout);
  }, [toast]);

  /* =========================================================
     PATIENT SEARCH
  ========================================================== */

  const searchPatients =
    useCallback(
      async (value) => {
        if (
          !user?.id ||
          !value.trim()
        ) {
          setPatientSuggestions([]);
          return;
        }

        setPatientLoading(true);

        const safeValue =
          value
            .trim()
            .replace(
              /[%_,]/g,
              ""
            );

        const { data, error } =
          await supabase
            .from("patients")
            .select("*")
            .eq(
              "doctor_id",
              user.id
            )
            .or(
              `full_name.ilike.%${safeValue}%,patient_id.ilike.%${safeValue}%`
            )
            .order(
              "full_name",
              {
                ascending: true,
              }
            )
            .limit(8);

        if (!error) {
          const results = data || [];

          setPatientSuggestions(results);

          /*
           * AUTO-FILL PATIENT
           * If the typed name exactly matches a saved patient, or the
           * search returns only one patient, fill all patient information
           * immediately. The doctor does not need to click anything.
           */
          const normalizedValue = value.trim().toLowerCase();

          const exactPatient = results.find(
            (item) =>
              item.full_name?.trim().toLowerCase() ===
              normalizedValue
          );

          const patientToAutoFill =
            exactPatient ||
            (results.length === 1 ? results[0] : null);

          if (patientToAutoFill) {
            setExistingPatient(patientToAutoFill);

            setPatient({
              full_name:
                patientToAutoFill.full_name || "",
              age:
                patientToAutoFill.age ?? "",
              gender:
                patientToAutoFill.gender === "Male" ||
                patientToAutoFill.gender === "Female"
                  ? patientToAutoFill.gender
                  : "",
              phone:
                patientToAutoFill.phone || "",
              patient_id:
                patientToAutoFill.patient_id || "",
              address:
                patientToAutoFill.address || "",
            });

            setPatientSearch("");
            setPatientSuggestions([]);
            setPatientSearchOpen(false);
          }
        }

        setPatientLoading(false);
      },
      [user?.id]
    );

  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatientSuggestions([]);
      return;
    }

    const timeout =
      setTimeout(() => {
        searchPatients(
          patientSearch
        );
      }, 250);

    return () =>
      clearTimeout(timeout);
  }, [
    patientSearch,
    searchPatients,
  ]);

  /* =========================================================
     FIND PATIENT BY NAME
     - Used on Enter so the doctor does not have to click a suggestion.
     - Uses the database directly to get the latest patient information.
  ========================================================== */

  const findPatientForName = useCallback(
    async (value) => {
      if (!user?.id || !value.trim()) return null;

      const safeValue = value
        .trim()
        .replace(/[%_,]/g, "");

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", user.id)
        .ilike("full_name", `%${safeValue}%`)
        .order("full_name", { ascending: true })
        .limit(8);

      if (error) {
        console.error("Patient lookup error:", error);
        return null;
      }

      const patients = data || [];
      const normalized = value.trim().toLowerCase();

      // Exact full-name match always wins.
      const exact = patients.find(
        (item) =>
          item.full_name?.trim().toLowerCase() === normalized
      );

      // For Enter: use the exact match first. If there is no exact match,
      // use the first matching patient so a short/partial name can still
      // immediately load the saved patient's complete information.
      return exact || patients[0] || null;
    },
    [user?.id]
  );

  /* =========================================================
     MEDICINE SEARCH
  ========================================================== */

  const searchMedicines =
    useCallback(
      async (value) => {
        if (!value.trim()) {
          setMedicineSuggestions([]);
          return;
        }

        setMedicineLoading(true);

        const safeValue =
          value
            .trim()
            .replace(
              /[%_,]/g,
              ""
            );

        const { data, error } =
          await supabase
            .from("medicines")
            .select("*")
            .or(
              `name.ilike.%${safeValue}%,generic_name.ilike.%${safeValue}%,brand_name.ilike.%${safeValue}%`
            )
            .order(
              "name",
              {
                ascending: true,
              }
            )
            .limit(8);

        if (!error) {
          setMedicineSuggestions(
            data || []
          );
        } else {
          console.error(
            "Medicine search error:",
            error
          );
        }

        setMedicineLoading(false);
      },
      []
    );

  /* =========================================================
     PATIENT FIELD CHANGE
  ========================================================== */

  function updatePatient(
    field,
    value
  ) {
    setPatient((current) => ({
      ...current,
      [field]: value,
    }));

    // Once the doctor changes the name, do not leave the previous patient's
    // details attached to the new name.
    if (field === "full_name") {
      setExistingPatient(null);
      setPatient((current) => ({
        ...current,
        full_name: value,
        age: "",
        gender: "",
        phone: "",
        patient_id: "",
        address: "",
      }));
    }
  }

  /* =========================================================
     PATIENT SELECTION
  ========================================================== */

  function selectExistingPatient(
    selected
  ) {
    setExistingPatient(selected);

    setPatient({
      full_name:
        selected.full_name ||
        "",
      age:
        selected.age ?? "",
      gender:
        selected.gender === "Male" ||
        selected.gender === "Female"
          ? selected.gender
          : "",
      phone:
        selected.phone ||
        "",
      patient_id:
        selected.patient_id ||
        "",
      address:
        selected.address ||
        "",
    });

    setPatientSearch("");
    setPatientSuggestions([]);
    setPatientSearchOpen(false);
  }

  /* =========================================================
     MEDICINE CHANGE
  ========================================================== */

  function updateMedicine(
    id,
    field,
    value
  ) {
    setAddedMedicines(
      (current) =>
        current.map(
          (medicine) =>
            medicine.id === id
              ? {
                  ...medicine,
                  [field]:
                    value,
                }
              : medicine
        )
    );
  }

  /* =========================================================
     MEDICINE NAME CHANGE
  ========================================================== */

  function handleMedicineNameChange(
    id,
    value
  ) {
    updateMedicine(
      id,
      "medicine_name",
      value
    );

    updateMedicine(
      id,
      "medicine_id",
      null
    );

    setActiveMedicineId(id);

    searchMedicines(value);
  }

  /* =========================================================
     SELECT MEDICINE
  ========================================================== */

  function selectMedicine(
    medicine
  ) {
    if (!activeMedicineId)
      return;

    setAddedMedicines(
      (current) =>
        current.map(
          (item) => {
            if (
              item.id !==
              activeMedicineId
            ) {
              return item;
            }

            return {
              ...item,

              medicine_id:
                medicine.id,

              medicine_name:
                medicine.name ||
                "",

              generic_name:
                medicine.generic_name ||
                "",

              strength:
                medicine.strength ||
                "",

              form:
                medicine.form ||
                "",

              strengthForm:
                [
                  medicine.strength,
                  medicine.form,
                ]
                  .filter(
                    Boolean
                  )
                  .join(" / "),
            };
          }
        )
    );

    setMedicineSuggestions([]);
    setMedicineLoading(false);
  }

  /* =========================================================
     ADD MEDICINE ROW
  ========================================================== */

  function addMedicineRow() {
    const id =
      typeof crypto !==
        "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const newMedicine = {
      id,
      medicine_id: null,
      medicine_name: "",
      generic_name: "",
      strength: "",
      form: "",
      strengthForm: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    };

    setAddedMedicines(
      (current) => [
        ...current,
        newMedicine,
      ]
    );

    setActiveMedicineId(id);

    setTimeout(() => {
      document
        .querySelector(
          `[data-medicine-id="${id}"][data-field="medicine"]`
        )
        ?.focus();
    }, 60);
  }

  /* =========================================================
     REMOVE MEDICINE
  ========================================================== */

  function removeMedicine(id) {
    setAddedMedicines(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );

    if (
      activeMedicineId === id
    ) {
      setActiveMedicineId(null);
    }

    setMedicineSuggestions([]);
  }

  /* =========================================================
     MEDICINE KEYBOARD
  ========================================================== */

  function handleMedicineKeyDown(
    event,
    medicine
  ) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (medicineSuggestions.length > 0) {
        selectMedicine(medicineSuggestions[0]);

        setTimeout(() => {
          const dosage =
            document.querySelector(
              `[data-medicine-id="${medicine.id}"][data-field="dosage"]`
            );

          dosage?.focus();
        }, 30);

        return;
      }

      // When the doctor finishes a medicine and presses Enter,
      // automatically create the next medicine row.
      if (medicine.medicine_name?.trim()) {
        addMedicineRow();
      }

      return;
    }

    if (
      event.key === "Escape"
    ) {
      setMedicineSuggestions([]);
      return;
    }
  }

  /* =========================================================
     CREATE / UPDATE PATIENT
  ========================================================== */

  async function savePatient() {
    if (!user?.id) {
      throw new Error(
        "You must be logged in."
      );
    }

    if (
      !patient.full_name.trim()
    ) {
      throw new Error(
        "Please enter the patient name."
      );
    }

    /* EXISTING PATIENT */
    if (existingPatient?.id) {
      const { data, error } =
        await supabase
          .from("patients")
          .update({
            full_name:
              patient.full_name.trim(),

            age: patient.age
              ? Number(
                  patient.age
                )
              : null,

            gender:
              patient.gender.trim() ||
              null,

            phone:
              patient.phone.trim() ||
              null,

            address:
              patient.address.trim() ||
              null,
          })
          .eq(
            "id",
            existingPatient.id
          )
          .eq(
            "doctor_id",
            user.id
          )
          .select("*")
          .single();

      if (error) {
        throw error;
      }

      setExistingPatient(data);

      setPatient(
        (current) => ({
          ...current,
          patient_id:
            data.patient_id,
        })
      );

      return data;
    }

    /* NEW PATIENT */
    const generatedId =
      patient.patient_id ||
      (await generateUniquePatientNo(user.id));

    const { data, error } =
      await supabase
        .from("patients")
        .insert({
          doctor_id: user.id,

          patient_id:
            generatedId,

          full_name:
            patient.full_name.trim(),

          age: patient.age
            ? Number(
                patient.age
              )
            : null,

          gender:
            patient.gender.trim() ||
            null,

          phone:
            patient.phone.trim() ||
            null,

          address:
            patient.address.trim() ||
            null,
        })
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    setExistingPatient(data);

    setPatient({
      full_name:
        data.full_name || "",
      age:
        data.age ?? "",
      gender:
        data.gender || "",
      phone:
        data.phone || "",
      patient_id:
        data.patient_id || "",
      address:
        data.address || "",
    });

    return data;
  }

  /* =========================================================
     CONTINUE TO PREVIEW
  ========================================================== */

  async function continueToPreview() {
    setError("");
    setSaving(true);

    try {
      if (
        addedMedicines.length ===
        0
      ) {
        throw new Error(
          "Add at least one medicine before saving and printing."
        );
      }

      // Save the prescription to History first.
      const saved = await handleSaveToHistory();

      // Only open Print if the History save succeeded.
      if (!saved) {
        return;
      }

      // Give React a moment to finish the save/toast state before
      // opening the browser print dialog.
      setTimeout(() => {
        window.print();
      }, 150);
    } catch (err) {
      console.error(
        "Save & Print error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while saving and printing."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     PRINT
  ========================================================== */

  function handlePrint() {
    window.print();
  }

  /* =========================================================
     DOWNLOAD (PDF) — captures the paper and saves a real .pdf
  ========================================================== */

  async function handleDownload() {
    setError("");
    setDownloading(true);

    try {
      const node = paperRef.current;

      if (!node) {
        throw new Error(
          "Nothing to export yet."
        );
      }

      // Render the full-size (unscaled) paper to a canvas.
      // scale: 2 gives crisp text/print-quality output.
      const canvas =
        await html2canvas(node, {
          scale: 2,
          useCORS: true,
          backgroundColor:
            "#ffffff",
        });

      const imageData =
        canvas.toDataURL(
          "image/png"
        );

      // Build a PDF page sized exactly to the canvas so the
      // layout matches the on-screen prescription 1:1.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [
          canvas.width,
          canvas.height,
        ],
      });

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height
      );

      const safeName =
        (patient.full_name ||
          "Prescription")
          .trim()
          .replace(
            /[^a-z0-9]+/gi,
            "_"
          );

      const fileDate = formatDate()
        .replace(/,/g, "")
        .replace(/\s+/g, "-");

      pdf.save(
        `Prescription_${safeName}_${fileDate}.pdf`
      );
    } catch (err) {
      console.error(
        "Download error:",
        err
      );

      setError(
        err?.message ||
          "Could not generate the PDF."
      );
    } finally {
      setDownloading(false);
    }
  }

  /* =========================================================
     SAVE TO HISTORY
  ========================================================== */

  async function handleSaveToHistory() {
    setError("");
    setSavingHistory(true);

    try {
      if (!user?.id) {
        throw new Error(
          "You must be logged in."
        );
      }

      if (
        addedMedicines.length === 0
      ) {
        throw new Error(
          "Add at least one medicine before saving."
        );
      }

      const savedPatient =
        await savePatient();

      /*
       * HISTORY STORAGE
       *
       * The History page reads:
       *   1. one record from `prescriptions`
       *   2. medicine records from `prescription_items`
       *
       * So we must save BOTH. Storing only `medicines` JSON inside
       * `prescriptions` is not enough for the History page to display them.
       */

      const { data: savedPrescription, error: prescriptionError } =
        await supabase
          .from("prescriptions")
          .insert({
            doctor_id: user.id,
            patient_id: savedPatient.id,
            notes,
          })
          .select("id")
          .single();

      if (prescriptionError) {
        throw prescriptionError;
      }

      const prescriptionItems = addedMedicines
        .filter(
          (medicine) =>
            medicine.medicine_name?.trim()
        )
        .map((medicine, index) => ({
          prescription_id:
            savedPrescription.id,

          medicine_id:
            medicine.medicine_id || null,

          medicine_name:
            medicine.medicine_name?.trim() || "",

          generic_name:
            medicine.generic_name?.trim() || null,

          strength:
            medicine.strength?.trim() || null,

          form:
            medicine.form?.trim() || null,

          dosage:
            medicine.dosage?.trim() || null,

          frequency:
            medicine.frequency?.trim() || null,

          duration:
            medicine.duration?.trim() || null,

          instructions:
            medicine.instructions?.trim() || null,

          sort_order: index,
        }));

      if (prescriptionItems.length === 0) {
        await supabase
          .from("prescriptions")
          .delete()
          .eq(
            "id",
            savedPrescription.id
          );

        throw new Error(
          "Add at least one medicine before saving."
        );
      }

      const { error: itemsError } =
        await supabase
          .from("prescription_items")
          .insert(prescriptionItems);

      if (itemsError) {
        // Remove the parent prescription if its medicine rows could not
        // be saved, so History never contains an incomplete record.
        await supabase
          .from("prescriptions")
          .delete()
          .eq(
            "id",
            savedPrescription.id
          );

        throw itemsError;
      }

      setToast(
        "Prescription saved to history"
      );

      return true;
    } catch (err) {
      console.error(
        "Save to history error:",
        err
      );

      setError(
        err?.message ||
          "Could not save to history."
      );

      return false;
    } finally {
      setSavingHistory(false);
    }
  }

  /* =========================================================
     PATIENT KEYBOARD
  ========================================================== */

  async function handlePatientKeyDown(
    event,
    nextRef
  ) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const typedName = patient.full_name.trim();

    if (!typedName) {
      nextRef?.current?.focus();
      return;
    }

    // First try the freshest database result. This avoids relying on
    // autocomplete state that may still be loading when Enter is pressed.
    const selectedPatient =
      await findPatientForName(typedName);

    if (selectedPatient) {
      selectExistingPatient(selectedPatient);

      setTimeout(() => {
        nextRef?.current?.focus();
      }, 0);

      return;
    }

    // No saved patient matched the typed name. Keep it as a new patient
    // and prepare a Patient No. immediately. It will be checked again
    // against the database when the patient is actually saved.
    setExistingPatient(null);

    if (!patient.patient_id) {
      const generatedPatientNo =
        await generateUniquePatientNo(user.id);

      setPatient((current) => ({
        ...current,
        patient_id:
          current.patient_id || generatedPatientNo,
      }));
    }

    setPatientSearchOpen(false);
    setPatientSuggestions([]);

    setTimeout(() => {
      nextRef?.current?.focus();
    }, 0);
  }

  /* =========================================================
     CUSTOMIZE
  ========================================================== */

  function handleLogoUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for the logo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo image must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCustomLogo(
        typeof reader.result === "string"
          ? reader.result
          : ""
      );
    };

    reader.onerror = () => {
      setError("Could not load the logo image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  /* =========================================================
     TEMPLATE
  ========================================================== */

  const customTemplates =
    getCustomTemplates();

  const allTemplates = [
    ...STANDARD_TEMPLATES,
    ...customTemplates.filter(
      (custom) =>
        !STANDARD_TEMPLATES.some(
          (standard) =>
            standard.id ===
            custom.id
        )
    ),
  ];

  /* =========================================================
     PROFILE DATA
  ========================================================== */

  useEffect(() => {
    const savedHospitalName =
      localStorage.getItem("prescription_hospital_name");

    // null = no saved override, so the profile value can be used.
    // An empty string = the doctor intentionally cleared the field.
    if (savedHospitalName !== null) {
      setHospitalNameOverride(savedHospitalName);
    }
  }, []);

  useEffect(() => {
    if (hospitalNameOverride === null) return;

    // Persist even an empty value so clearing the field stays cleared.
    localStorage.setItem(
      "prescription_hospital_name",
      hospitalNameOverride
    );
  }, [hospitalNameOverride]);

  useEffect(() => {
    const savedSpecialty =
      localStorage.getItem(
        "prescription_medical_specialty"
      );

    if (savedSpecialty !== null) {
      setSpecialtyOverride(savedSpecialty);
    }
  }, []);

  useEffect(() => {
    if (specialtyOverride === null) return;

    // Persist even an empty value so clearing the field stays cleared.
    localStorage.setItem(
      "prescription_medical_specialty",
      specialtyOverride
    );
  }, [specialtyOverride]);

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

  /* =========================================================
     PRESCRIPTION READY CHECK
  ========================================================== */

  const prescriptionReady = Boolean(
    patient.full_name?.trim() &&
      addedMedicines.length > 0 &&
      addedMedicines.every(
        (medicine) =>
          medicine.medicine_name?.trim() &&
          medicine.dosage?.trim() &&
          medicine.frequency?.trim() &&
          medicine.duration?.trim()
      )
  );

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div className="rxflow-prescription-app flex h-screen flex-col overflow-hidden bg-[#EEEAE6]">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0 !important;
        }

        @media print {
          html,
          body,
          #root {
            width: 210mm !important;
            height: 297mm !important;
            min-width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }

          body * {
            visibility: hidden !important;
          }

          .rxflow-prescription-app,
          .rxflow-prescription-app * {
            visibility: visible !important;
          }

          .rxflow-prescription-app {
            display: block !important;
            position: static !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
          }

          .rxflow-prescription-app > header,
          .rxflow-prescription-app > main > :not(.rxflow-print-area),
          .rxflow-prescription-app .print-hide {
            display: none !important;
          }

          .rxflow-print-area {
            display: block !important;
            position: static !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .rxflow-print-frame {
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .rxflow-print-sheet > header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .rxflow-print-sheet > main {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .rxflow-print-sheet {
            width: 210mm !important;
            height: 297mm !important;
            min-width: 210mm !important;
            min-height: 297mm !important;
            max-width: 210mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            box-shadow: none !important;
            border: 0 !important;
            overflow: hidden !important;
          }

          /* Larger, easier-to-read prescription typography */
          .rxflow-print-sheet .rxflow-paper-logo {
            width: 82px !important;
            height: 82px !important;
          }

          .rxflow-print-sheet .rxflow-hospital-name {
            font-size: 30px !important;
            line-height: 1.05 !important;
          }

          .rxflow-print-sheet .rxflow-specialty {
            font-size: 11px !important;
          }

          .rxflow-print-sheet .rxflow-meta-text {
            font-size: 9px !important;
          }

          .rxflow-print-sheet .rxflow-patient-label {
            font-size: 9px !important;
          }

          .rxflow-print-sheet .rxflow-patient-value {
            font-size: 11px !important;
          }

          .rxflow-print-sheet .rxflow-rx-title {
            font-size: 19px !important;
          }

          .rxflow-print-sheet .rxflow-table-header {
            font-size: 8px !important;
          }

          .rxflow-print-sheet .rxflow-medicine-text {
            font-size: 10px !important;
          }

          .rxflow-print-sheet .rxflow-medicine-input {
            font-size: 11px !important;
          }

          .rxflow-print-sheet [data-medicine-row] {
            padding-top: 14px !important;
            padding-bottom: 14px !important;
          }

          .rxflow-print-sheet [data-medicine-row] input {
            font-size: 11px !important;
            line-height: 1.35 !important;
          }

          .rxflow-print-sheet [data-medicine-row] p {
            font-size: 9px !important;
          }

          .rxflow-print-sheet footer {
            font-size: 1em !important;
          }

          .rxflow-print-sheet input,
          .rxflow-print-sheet textarea {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      {/* =====================================================
          TOP APP BAR
      ====================================================== */}

      <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#DDD9D5] bg-[#FBF7F4]/95 px-3 sm:px-5 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#66746E] transition hover:bg-white hover:text-[#33463F]"
            title="Back"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="h-5 w-px bg-[#D9D6D2]" />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA39F]">
              RxFlow
            </p>

            <h1 className="text-[14px] font-bold text-[#33463F]">
              New Prescription
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {/* CUSTOMIZE */}
          <button
            type="button"
            onClick={() =>
              setShowTemplatePanel(
                (value) => !value
              )
            }
            className="flex h-9 items-center gap-2 rounded-lg border border-[#DADFDA] bg-white px-3 text-[9px] font-bold text-[#62716A] transition hover:border-[#BFCBC5] hover:bg-[#F7FAF8]"
          >
            <Palette size={13} />

            <span className="hidden sm:block">
              Customize
            </span>

            {showTemplatePanel ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>

          {/* SAVE & PRINT */}
          <button
            type="button"
            onClick={continueToPreview}
            disabled={saving}
            className="flex h-9 items-center gap-2 rounded-lg bg-[#33463F] px-4 text-[9px] font-bold text-white shadow-sm transition hover:bg-[#263731] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving & Printing...
              </>
            ) : (
              <>
                Save & Print
                <Printer size={13} />
              </>
            )}
          </button>
        </div>

        {/* CUSTOMIZE — mobile */}
        <button
          type="button"
          onClick={() =>
            setShowTemplatePanel(
              (value) => !value
            )
          }
          className="flex h-9 items-center gap-2 rounded-lg border border-[#DADFDA] bg-white px-3 text-[9px] font-bold text-[#62716A] transition hover:border-[#BFCBC5] hover:bg-[#F7FAF8] sm:hidden"
        >
          <Palette size={13} />
          <span>Customize</span>
        </button>
      </header>

      {/* =====================================================
          CUSTOMIZE PANEL
      ====================================================== */}

      {showTemplatePanel && (
        <div className="absolute right-5 top-[72px] z-[100] w-[320px] max-w-[calc(100vw-24px)] rounded-2xl border border-[#D9E1DD] bg-white p-4 shadow-[0_20px_50px_rgba(51,70,63,0.16)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-[#33463F]">
                Customize Prescription
              </p>
              <p className="mt-0.5 text-[8px] text-[#929D98]">
                Change the accent color and your clinic logo.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowTemplatePanel(false)
              }
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#8D9893] hover:bg-[#F3F6F4]"
              aria-label="Close customize panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* ACCENT COLOR */}
          <div className="border-b border-[#E7ECE9] pb-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#89958F]">
                  Accent Color
                </p>
                <p className="mt-1 text-[7px] text-[#A0AAA5]">
                  Used throughout the prescription design.
                </p>
              </div>

              <label className="relative flex h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-white shadow-[0_0_0_1px_#D9E1DD]">
                <input
                  type="color"
                  value={templateColor}
                  onChange={(event) =>
                    setTemplateColor(
                      event.target.value
                    )
                  }
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Choose custom accent color"
                />
                <span
                  className="h-full w-full"
                  style={{
                    backgroundColor:
                      templateColor,
                  }}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "#6C9A8B",
                "#05668D",
                "#00A896",
                "#02C39A",
                "#253237",
                "#8A5A44",
                "#6D597A",
                "#4F46E5",
                "#B45309",
                "#DC2626",
                "#DB2777",
                "#9333EA",
                "#7C3AED",
                "#2563EB",
                "#0891B2",
                "#16A34A",
                "#65A30D",
                "#CA8A04",
                "#EA580C",
                "#475569",
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setTemplateColor(color)
                  }
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                    templateColor.toLowerCase() ===
                    color.toLowerCase()
                      ? "border-[#33463F]"
                      : "border-transparent"
                  }`}
                  aria-label={`Use ${color}`}
                >
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{
                      backgroundColor: color,
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F6F8F7] px-3 py-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    templateColor,
                }}
              />
              <span className="text-[8px] font-semibold text-[#62716A]">
                {templateColor.toUpperCase()}
              </span>
            </div>
          </div>

          {/* LOGO */}
          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#89958F]">
              Clinic Logo
            </p>
            <p className="mt-1 text-[7px] text-[#A0AAA5]">
              Add a logo to the logo position on the prescription.
            </p>

            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E0E6E3] bg-[#FAFCFB] p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#DDE5E1] bg-white">
                {customLogo ? (
                  <img
                    src={customLogo}
                    alt="Custom clinic logo preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImagePlus
                    size={20}
                    strokeWidth={1.7}
                    className="text-[#89958F]"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <label className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#33463F] px-3 text-[10px] font-bold text-white transition hover:bg-[#263731]">
                  <Upload size={12} />
                  {customLogo ? "Change Logo" : "Add Logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {customLogo && (
                  <button
                    type="button"
                    onClick={async () => {
                      setCustomLogo("");

                      try {
                        await removeLogoFromStorage();
                      } catch (error) {
                        console.error(
                          "Could not remove clinic logo:",
                          error
                        );
                      }
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-1 text-[7px] font-bold text-[#A85D54] hover:underline"
                  >
                    <Trash2 size={10} />
                    Remove logo
                  </button>
                )}
              </div>
            </div>

            <p className="mt-2 text-[7px] leading-relaxed text-[#A0AAA5]">
              PNG, JPG, WEBP or SVG • max 2MB. The logo is saved on this device.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          WORKSPACE
      ====================================================== */}

      <main
        ref={paperContainerRef}
        className="relative min-h-0 flex-1 overflow-auto px-6 py-7"
      >
        {/* ERROR */}
        {error && (
          <div className="fixed bottom-5 left-1/2 z-[200] flex max-w-[500px] -translate-x-1/2 items-center gap-3 rounded-xl border border-[#F0D4D0] bg-white px-4 py-3 text-[10px] font-semibold text-[#A85D54] shadow-[0_12px_30px_rgba(51,70,63,0.14)]">
            <span className="flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div className="fixed bottom-5 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#CFE3D9] bg-white px-4 py-3 text-[10px] font-semibold text-[#33463F] shadow-[0_12px_30px_rgba(51,70,63,0.14)]">
            <Check
              size={13}
              className="text-[#6C9A8B]"
            />
            <span>{toast}</span>
          </div>
        )}

        {/* ===================================================
            A4 PAPER
        ==================================================== */}

        <div
          className="rxflow-print-area mx-auto"
          style={{
            width: `${794 * paperScale}px`,
            height: `${1123 * paperScale}px`,
          }}
        >
          <div
            className="rxflow-print-frame"
            style={{
              width: "794px",
              height: "1123px",
              transform: `scale(${paperScale})`,
              transformOrigin:
                "top left",
            }}
          >
            <div
              ref={paperRef}
              className="rxflow-print-sheet flex h-[1123px] w-[794px] flex-col overflow-hidden bg-white text-[#33463F] shadow-[0_18px_50px_rgba(51,70,63,0.14)]"
              onClick={() => {
                setPatientSearchOpen(
                  false
                );

                setMedicineSuggestions(
                  []
                );
              }}
            >
              {/* ACCENT */}
              <div
                className="h-[7px] w-full shrink-0"
                style={{
                  backgroundColor:
                    templateColor,
                }}
              />

              {/* =============================================
                  HEADER
              ============================================== */}

              <header className="shrink-0 px-8 pb-6 pt-8">
                <div className="flex items-start justify-between gap-8">
                  <div className="flex min-w-0 items-center gap-5">
                    <PaperLogo
                      profile={profile}
                      hospitalName={
                        hospitalName
                      }
                      customLogo={customLogo}
                    />

                    <div className="min-w-0">
                      <input
                        value={hospitalName}
                        onChange={(event) =>
                          setHospitalNameOverride(
                            event.target.value
                          )
                        }
                        placeholder="Hospital / Clinic Name"
                        aria-label="Hospital or clinic name"
                        className="rxflow-hospital-name block w-full max-w-[430px] truncate border-0 border-b border-transparent bg-transparent p-0 text-[30px] font-bold tracking-[-0.035em] text-[#263630] outline-none transition focus:border-[#6C9A8B]"
                      />

                      <input
                        value={specialty}
                        onChange={(event) =>
                          setSpecialtyOverride(
                            event.target.value
                          )
                        }
                        placeholder="Medical Specialty"
                        aria-label="Medical specialty"
                        className="rxflow-specialty mt-1 block w-full max-w-[300px] border-0 border-b border-transparent bg-transparent p-0 text-[11px] font-bold uppercase tracking-[0.17em] text-[#6C9A8B] outline-none transition focus:border-[#6C9A8B]"
                        style={{
                          color:
                            templateColor,
                        }}
                      />

                      <div className="mt-2 flex items-center gap-3 text-[9px] text-[#7C8983]">
                        {hospitalPhone && (
                          <span className="flex items-center gap-1">
                            <Phone
                              size={10}
                            />
                            {
                              hospitalPhone
                            }
                          </span>
                        )}

                        {hospitalAddress && (
                          <span className="flex max-w-[320px] items-center gap-1 truncate">
                            <MapPin
                              size={10}
                            />
                            {
                              hospitalAddress
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#909B96]">
                      <CalendarDays
                        size={9}
                      />
                      Date
                    </div>

                    <p className="mt-1 text-[11px] font-bold text-[#33463F]">
                      {formatDate()}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-6 h-px"
                  style={{
                    backgroundColor: `${templateColor}35`,
                  }}
                />

                {/* =========================================
                    PATIENT INFORMATION
                    ALL INLINE — NO BOXES
                ========================================== */}

                <div
                  className="relative mt-4"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    {/* PATIENT */}
                    <div className="relative flex min-w-0 flex-[2] items-baseline gap-1.5">
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8C9892]">
                        Patient
                      </span>

                      <input
                        ref={
                          patientNameRef
                        }
                        value={
                          patient.full_name
                        }
                        onChange={(
                          event
                        ) => {
                          updatePatient(
                            "full_name",
                            event.target
                              .value
                          );

                          setPatientSearch(
                            event.target
                              .value
                          );

                          setPatientSearchOpen(
                            true
                          );
                        }}
                        onFocus={() =>
                          setActiveField(
                            "patient"
                          )
                        }
                        onKeyDown={(event) =>
                          handlePatientKeyDown(
                            event,
                            patientAgeRef
                          )
                        }
                        placeholder="Type patient name"
                        autoComplete="off"
                        className={`min-w-0 flex-1 border-0 border-b bg-transparent px-0 py-1 text-[11px] font-bold text-[#33463F] outline-none ${
                          activeField ===
                          "patient"
                            ? "border-[#6C9A8B]"
                            : "border-transparent"
                        }`}
                      />

                      {/* PATIENT AUTOCOMPLETE */}
                      {patientSearchOpen &&
                        patientSearch.trim() &&
                        patientSuggestions.length >
                          0 && (
                          <div
                            className="absolute left-[48px] top-[27px] z-[80] w-[270px] overflow-hidden rounded-xl border border-[#D9E2DE] bg-white shadow-[0_15px_35px_rgba(51,70,63,0.15)]"
                            onClick={(
                              event
                            ) =>
                              event.stopPropagation()
                            }
                          >
                            <div className="border-b border-[#EEF2F0] px-3 py-2">
                              <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#9AA49F]">
                                Existing patients
                              </p>
                            </div>

                            {patientSuggestions.map(
                              (
                                suggestion
                              ) => (
                                <button
                                  key={
                                    suggestion.id
                                  }
                                  type="button"
                                  onMouseDown={(
                                    event
                                  ) => {
                                    event.preventDefault();

                                    selectExistingPatient(
                                      suggestion
                                    );
                                  }}
                                  className="flex w-full items-center gap-3 border-b border-[#EEF2F0] px-3 py-2.5 text-left last:border-b-0 hover:bg-[#F5F9F7]"
                                >
                                  <div
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                    style={{
                                      backgroundColor:
                                        COLORS.greenSoft,
                                      color:
                                        COLORS.greenDark,
                                    }}
                                  >
                                    <Search
                                      size={
                                        12
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-bold text-[#33463F]">
                                      {
                                        suggestion.full_name
                                      }
                                    </p>

                                    <p className="mt-0.5 text-[7px] text-[#8B9792]">
                                      {
                                        suggestion.patient_id
                                      }
                                    </p>
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        )}
                    </div>

                    <div className="h-4 w-px shrink-0 bg-[#DDE4E0]" />

                    {/* AGE */}
                    <InlineField
                      label="Age"
                      value={
                        patient.age
                      }
                      onChange={(
                        value
                      ) =>
                        updatePatient(
                          "age",
                          value
                        )
                      }
                      placeholder="—"
                      type="number"
                      inputRef={
                        patientAgeRef
                      }
                      onKeyDown={(event) =>
                        handlePatientKeyDown(
                          event,
                          patientGenderRef
                        )
                      }
                      className="w-[75px] shrink-0"
                    />

                    <div className="h-4 w-px shrink-0 bg-[#DDE4E0]" />

                    {/* GENDER */}
                    <div className="flex w-[105px] shrink-0 items-baseline gap-1.5">
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8C9892]">
                        Gender
                      </span>

                      <select
                        ref={
                          patientGenderRef
                        }
                        value={
                          patient.gender
                        }
                        onChange={(event) =>
                          updatePatient(
                            "gender",
                            event.target
                              .value
                          )
                        }
                        onFocus={() =>
                          setActiveField(
                            "gender"
                          )
                        }
                        onKeyDown={(event) =>
                          handlePatientKeyDown(
                            event,
                            patientPhoneRef
                          )
                        }
                        className="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent px-0 py-1 text-[11px] font-semibold text-[#33463F] outline-none focus:border-[#6C9A8B]"
                      >
                        <option value="">
                          —
                        </option>
                        <option value="Male">
                          Male
                        </option>
                        <option value="Female">
                          Female
                        </option>
                      </select>
                    </div>

                    <div className="h-4 w-px shrink-0 bg-[#DDE4E0]" />

                    {/* PHONE */}
                    <InlineField
                      label="Phone"
                      value={
                        patient.phone
                      }
                      onChange={(
                        value
                      ) =>
                        updatePatient(
                          "phone",
                          value
                        )
                      }
                      placeholder="—"
                      inputRef={
                        patientPhoneRef
                      }
                      className="min-w-[145px] flex-1"
                    />

                    <div className="h-4 w-px shrink-0 bg-[#DDE4E0]" />

                    {/* PATIENT ID */}
                    <div className="flex min-w-[130px] shrink-0 items-baseline gap-1.5">
                      <span className="shrink-0 text-[7px] font-bold uppercase tracking-[0.1em] text-[#8C9892]">
                        Patient No.
                      </span>

                      <span
                        className={`truncate text-[10px] font-bold ${
                          patient.patient_id
                            ? "text-[#33463F]"
                            : "text-[#B1BAB6]"
                        }`}
                      >
                        {patient.patient_id ||
                          "Auto-generated"}
                      </span>
                    </div>
                  </div>

                  {/* NEW PATIENT NOTICE */}
                  {!existingPatient &&
                    patient.full_name.trim() && (
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              templateColor,
                          }}
                        />

                        <span className="text-[9px] text-[#98A39E]">
                          New patient — a
                          unique Patient No.
                          will be generated
                          automatically when
                          you continue.
                        </span>
                      </div>
                    )}
                </div>
              </header>

              {/* =============================================
                  PRESCRIPTION BODY
              ============================================== */}

              <main className="flex min-h-0 flex-1 flex-col px-8 pb-6">
                {/* TWO-COLUMN CLINICAL AREA */}
                <div className="grid min-h-0 flex-1 grid-cols-[155px_minmax(0,1fr)] gap-5">
                  {/* =========================================
                      CLINICAL RECORD SIDEBAR
                  ========================================== */}
                  <aside className="flex h-full min-h-0 flex-col border-r border-[#DDE5E1] pr-4">
                    <div className="flex shrink-0 items-center gap-2 border-b border-[#DDE5E1] pb-2">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: templateColor }}
                      />

                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{ color: templateColor }}
                      >
                        Clinical Record
                      </p>
                    </div>

                    <div className="mt-4 flex min-h-0 flex-1 flex-col">
                      {clinicalRecordLines.map((line, index) => (
                        <div
                          key={index}
                          className="flex h-[24px] min-h-[24px] shrink-0 items-end border-b border-[#DDE5E1]"
                        >
                          <input
                            ref={(element) => {
                              clinicalRecordRefs.current[index] =
                                element;
                            }}
                            type="text"
                            value={line}
                            aria-label={`Clinical record line ${index + 1}`}
                            className="h-[22px] w-full border-0 bg-transparent px-0 pb-1 text-[11px] text-[#26332F] outline-none placeholder:text-transparent"
                            onChange={(event) => {
                              const value = event.target.value;

                              setClinicalRecordLines((current) => {
                                const updated = [...current];
                                updated[index] = value;
                                return updated;
                              });

                              // Only create the next line when this line
                              // actually reaches the end of its width.
                              if (index === clinicalRecordLines.length - 1) {
                                requestAnimationFrame(() => {
                                  const input =
                                    clinicalRecordRefs.current[index];

                                  if (
                                    input &&
                                    input.scrollWidth > input.clientWidth + 1
                                  ) {
                                    setClinicalRecordLines((current) => {
                                      if (
                                        current.length - 1 !== index ||
                                        !current[index]?.trim()
                                      ) {
                                        return current;
                                      }

                                      return [...current, ""];
                                    });

                                    requestAnimationFrame(() => {
                                      clinicalRecordRefs.current[
                                        index + 1
                                      ]?.focus();
                                    });
                                  }
                                });
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;

                              event.preventDefault();

                              // Enter always finishes the current line and
                              // creates exactly one new line.
                              if (index === clinicalRecordLines.length - 1) {
                                setClinicalRecordLines((current) => [
                                  ...current,
                                  "",
                                ]);

                                requestAnimationFrame(() => {
                                  clinicalRecordRefs.current[
                                    index + 1
                                  ]?.focus();
                                });
                              } else {
                                clinicalRecordRefs.current[
                                  index + 1
                                ]?.focus();
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </aside>

                  {/* =========================================
                      PRESCRIPTION
                  ========================================== */}
                  <section className="flex min-h-0 min-w-0 flex-col">
                    {/* RX TITLE */}
                    <div className="mb-4 flex items-center gap-3">
                      <h2
                        className="text-[19px] font-bold tracking-[0.08em]"
                        style={{ color: templateColor }}
                      >
                        Rx
                      </h2>

                      <div
                        className="h-px flex-1"
                        style={{
                          backgroundColor: `${templateColor}30`,
                        }}
                      />
                    </div>

                    {/* MEDICINE WRITING SPACE */}
                    <div className="flex-1 min-h-[250px]">
                      <div
                        className="grid grid-cols-[24px_1.65fr_1.15fr_0.9fr_1fr_0.9fr_1.45fr_22px] gap-3 border-b border-[#DDE5E1] pb-2 text-[8px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: templateColor }}
                      >
                        <div>#</div>
                        <div>Medicine</div>
                        <div>Strength / Form</div>
                        <div>Dosage</div>
                        <div>Frequency</div>
                        <div>Duration</div>
                        <div>Instructions</div>
                        <div />
                      </div>

                      <div className="mt-1">
                        {addedMedicines.map((medicine, index) => (
                          <MedicineRow
                            key={medicine.id}
                            medicine={medicine}
                            index={index}
                            suggestions={
                              activeMedicineId === medicine.id
                                ? medicineSuggestions
                                : []
                            }
                            showSuggestions={
                              activeMedicineId === medicine.id &&
                              medicineSuggestions.length > 0
                            }
                            onMedicineChange={(value) =>
                              handleMedicineNameChange(
                                medicine.id,
                                value
                              )
                            }
                            onSelectSuggestion={selectMedicine}
                            onRemove={removeMedicine}
                            onFieldChange={(id, field, value) =>
                              updateMedicine(id, field, value)
                            }
                            onMedicineKeyDown={(
                              event,
                              currentMedicine
                            ) =>
                              handleMedicineKeyDown(
                                event,
                                currentMedicine
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>

                {/* FOOTER */}
                <footer className="mt-6 border-t border-[#DDE5E1] pt-4">
                  <div className="flex items-end justify-between gap-8">
                    <div>
                      <p className="text-[12px] font-bold text-[#53625C]">
                        {hospitalName}
                      </p>

                      <div className="mt-1 flex items-center gap-3 text-[9px] text-[#89958F]">
                        {hospitalPhone && (
                          <span className="flex items-center gap-1">
                            <Phone
                              size={7}
                            />
                            {
                              hospitalPhone
                            }
                          </span>
                        )}

                        {hospitalAddress && (
                          <span className="flex items-center gap-1">
                            <MapPin
                              size={7}
                            />
                            {
                              hospitalAddress
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-[180px] text-right">
                      <div className="mb-2 ml-auto h-px w-[155px] bg-[#BFCBC5]" />

                      <p className="text-[13px] font-bold text-[#33463F]">
                        {doctorName}
                      </p>

                      <p
                        className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                        style={{
                          color:
                            templateColor,
                        }}
                      >
                        {specialty}
                      </p>

                      <p className="mt-1 text-[8px] text-[#9AA49F]">
                        Authorized Signature
                      </p>
                    </div>
                  </div>
                </footer>
                  </section>
                </div>


              </main>
            </div>
          </div>
        </div>

        {/* PRINT / DOWNLOAD / SAVE TO HISTORY — mobile only */}
        <div className="flex w-full justify-center gap-3 pt-5 sm:hidden">
          <IconAction
            icon={Printer}
            label={
              prescriptionReady
                ? "Print"
                : "Complete prescription first"
            }
            onClick={handlePrint}
            disabled={!prescriptionReady}
          />

          <IconAction
            icon={Download}
            label={
              prescriptionReady
                ? "Download"
                : "Complete prescription first"
            }
            onClick={handleDownload}
            disabled={!prescriptionReady || downloading}
            loading={downloading}
          />

          <IconAction
            icon={History}
            label={
              prescriptionReady
                ? "Save to history"
                : "Complete prescription first"
            }
            onClick={handleSaveToHistory}
            disabled={!prescriptionReady || savingHistory}
            loading={savingHistory}
          />
        </div>
      </main>

      {/* =====================================================
          MOBILE / DESKTOP HELP
      ====================================================== */}

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-[#D9E1DD] bg-white/95 px-4 py-2 text-[8px] font-semibold text-[#89958F] shadow-sm xl:block">
        Click any field to type • Tab to move • Enter to select
      </div>
    </div>
  );
}
 