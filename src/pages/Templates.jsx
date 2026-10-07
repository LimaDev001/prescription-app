import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  FileImage,
  FileText,
  HeartPulse,
  LayoutTemplate,
  Palette,
  Pill,
  Plus,
  Printer,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Trash2,
  UserRound,
  X,
  Droplets,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SELECTED_TEMPLATE_KEY = "rxflow-selected-template";
const CUSTOM_TEMPLATES_KEY = "rxflow-custom-templates";

const templates = [
  {
    id: "classic",
    name: "Classic Medical",
    description:
      "Traditional hospital prescription with a strong header and clean medical structure.",
    tag: "Classic",
    accent: "#253237",
    style: "classic",
  },
  {
    id: "modern",
    name: "Modern Clinical",
    description:
      "Modern clinical layout with a fresh teal header and soft patient information card.",
    tag: "Modern",
    accent: "#05668D",
    style: "modern",
  },
  {
    id: "hospital",
    name: "Hospital Standard",
    description:
      "Hospital-focused design with bold branding, patient details, RX section and footer.",
    tag: "Hospital",
    accent: "#00A896",
    style: "hospital",
  },
  {
    id: "minimal",
    name: "Minimal Care",
    description:
      "Minimal prescription with lots of white space and a simple professional structure.",
    tag: "Minimal",
    accent: "#02C39A",
    style: "minimal",
  },
];

const customPreviewIcons = {
  HeartPulse,
  Stethoscope,
  Pill,
  Syringe,
  UserRound,
  Droplets,
  FileText,
  FileImage,
};

function Templates() {
  const navigate = useNavigate();

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return (
      localStorage.getItem(SELECTED_TEMPLATE_KEY) || "classic"
    );
  });

  const [customTemplates, setCustomTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  function loadCustomTemplates() {
    try {
      const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);

      if (!saved) {
        setCustomTemplates([]);
        return;
      }

      const parsed = JSON.parse(saved);

      setCustomTemplates(
        Array.isArray(parsed) ? parsed : []
      );
    } catch (error) {
      console.error("Could not load custom templates:", error);
      setCustomTemplates([]);
    }
  }

  function selectTemplate(templateId) {
    setSelectedTemplate(templateId);

    localStorage.setItem(
      SELECTED_TEMPLATE_KEY,
      templateId
    );
  }

  function deleteCustomTemplate(templateId) {
    const confirmed = window.confirm(
      "Delete this custom template?"
    );

    if (!confirmed) return;

    const updated = customTemplates.filter(
      (template) => template.id !== templateId
    );

    localStorage.setItem(
      CUSTOM_TEMPLATES_KEY,
      JSON.stringify(updated)
    );

    setCustomTemplates(updated);

    if (selectedTemplate === templateId) {
      selectTemplate("classic");
    }
  }

  const selectedTemplateData =
    templates.find(
      (template) => template.id === selectedTemplate
    ) ||
    customTemplates.find(
      (template) => template.id === selectedTemplate
    ) ||
    templates[0];

  return (
    <div className="min-h-screen bg-[#E0FBFC] text-[#253237]">
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#253237] text-[#E0FBFC] shadow-lg">
              <LayoutTemplate size={17} />
            </div>

            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#5C6B73]">
              RxFlow Medical Workspace
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl lg:text-5xl">
            Prescription{" "}
            <span className="text-[#5C6B73]">
              Templates
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-xs font-medium leading-6 text-[#5C6B73] sm:text-sm">
            Choose a professional prescription design
            or create your own hospital template.
          </p>
        </header>

        {/* HERO */}
        <section className="relative mb-10 overflow-hidden rounded-[30px] bg-[#253237] shadow-[0_35px_80px_-35px_rgba(37,50,55,0.65)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[60px] border-[#5C6B73]/20" />

          <div className="pointer-events-none absolute -bottom-40 left-[35%] h-80 w-80 rounded-full border-[45px] border-[#9DB4C0]/10" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E0FBFC] text-[#253237] shadow-xl">
                <Palette size={23} />
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#9DB4C0]">
                  Design Workspace
                </p>

                <p className="mt-1 text-[9px] font-bold text-[#C2DFE3]">
                  Professional prescription designs
                </p>
              </div>
            </div>

            <h2 className="mt-7 max-w-xl text-2xl font-black leading-tight tracking-[-0.045em] text-[#E0FBFC] sm:text-3xl">
              Your prescription.
              <br />
              <span className="text-[#9DB4C0]">
                Your medical style.
              </span>
            </h2>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <InfoPill
                icon={ShieldCheck}
                text="Professional"
              />

              <InfoPill
                icon={Printer}
                text="Print Ready"
              />

              <InfoPill
                icon={Stethoscope}
                text="Medical Focused"
              />
            </div>
          </div>
        </section>

        {/* STANDARD TEMPLATES */}
        <section>
          <SectionTitle
            eyebrow="Template Library"
            title="Ready-made designs"
            dot="#05668D"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={
                  selectedTemplate === template.id
                }
                onSelect={() =>
                  selectTemplate(template.id)
                }
                onPreview={() =>
                  setPreviewTemplate(template)
                }
              />
            ))}
          </div>
        </section>

        {/* MY TEMPLATES */}
        <section className="mt-12">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="My Templates"
              title="Your custom designs"
              dot="#02C39A"
            />

            {customTemplates.length > 0 && (
              <span className="text-[9px] font-bold text-[#5C6B73]">
                {customTemplates.length} custom{" "}
                {customTemplates.length === 1
                  ? "template"
                  : "templates"}
              </span>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {customTemplates.map((template) => (
              <CustomTemplateCard
                key={template.id}
                template={template}
                selected={
                  selectedTemplate === template.id
                }
                onSelect={() =>
                  selectTemplate(template.id)
                }
                onPreview={() =>
                  setPreviewTemplate(template)
                }
                onDelete={() =>
                  deleteCustomTemplate(template.id)
                }
              />
            ))}

            {/* CREATE CUSTOM */}
            <button
              type="button"
              onClick={() =>
                navigate("/create-template")
              }
              className="group relative min-h-[420px] overflow-hidden rounded-[26px] border-2 border-dashed border-[#9DB4C0] bg-white/60 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[#02C39A] hover:bg-white hover:shadow-[0_25px_60px_-30px_rgba(2,195,154,0.5)]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border-[30px] border-[#E0FBFC] transition duration-500 group-hover:scale-125" />

              <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full border-[22px] border-[#E0FBFC]" />

              <div className="relative flex min-h-[370px] flex-col items-center justify-center text-center">
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px] bg-[#253237] text-[#E0FBFC] shadow-xl transition duration-500 group-hover:rotate-90 group-hover:bg-[#02C39A]">
                  <Plus size={32} strokeWidth={2.5} />
                </div>

                <h3 className="mt-6 text-lg font-black text-[#253237]">
                  Create Template
                </h3>

                <p className="mt-2 max-w-[230px] text-[9px] font-semibold leading-5 text-[#5C6B73]">
                  Build your own prescription design
                  with your hospital branding and style.
                </p>

                <div className="mt-5 flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-[#02C39A]">
                  <Sparkles size={12} />
                  Add new template
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </button>
          </div>

          {customTemplates.length === 0 && (
            <p className="mt-4 text-center text-[8px] font-bold text-[#9DB4C0]">
              Your custom templates will appear here
              after you create them.
            </p>
          )}
        </section>

        {/* SELECTED */}
        <section className="mt-12 rounded-[24px] border border-[#C2DFE3] bg-white/70 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{
                  backgroundColor:
                    selectedTemplateData?.accent ||
                    "#253237",
                }}
              >
                <Check
                  size={17}
                  strokeWidth={3}
                />
              </div>

              <div>
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#9DB4C0]">
                  Selected template
                </p>

                <p className="text-sm font-black text-[#253237]">
                  {selectedTemplateData?.name}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-[#C2DFE3]/60 px-4 py-3 text-[8px] font-black uppercase tracking-wider text-[#253237]">
              <Check
                size={13}
                strokeWidth={3}
              />
              Saved for New Prescription
            </div>
          </div>
        </section>

        <footer className="mt-8 flex items-center justify-center gap-3 pb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9DB4C0]" />

          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#5C6B73]">
            RxFlow • Medical Prescription Workspace
          </p>

          <span className="h-1.5 w-1.5 rounded-full bg-[#9DB4C0]" />
        </footer>
      </main>

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() =>
            setPreviewTemplate(null)
          }
          onUse={() => {
            selectTemplate(previewTemplate.id);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  eyebrow,
  title,
  dot,
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />

        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#5C6B73]">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-[#253237]">
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   INFO PILL
========================================================= */

function InfoPill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#5C6B73]/40 bg-white/5 px-3 py-2 text-[8px] font-black text-[#E0FBFC]">
      <Icon size={12} />
      {text}
    </div>
  );
}

/* =========================================================
   STANDARD TEMPLATE CARD
========================================================= */

function TemplateCard({
  template,
  selected,
  onSelect,
  onPreview,
}) {
  return (
    <article
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-[26px] border bg-white transition duration-300 hover:-translate-y-1 ${
        selected
          ? "border-[#02C39A] shadow-[0_25px_60px_-30px_rgba(2,195,154,0.55)]"
          : "border-[#C2DFE3] shadow-[0_20px_50px_-30px_rgba(37,50,55,0.3)]"
      }`}
    >
      <div className="relative h-[250px] overflow-hidden bg-[#F7FBFB]">
        <div className="absolute inset-0 p-4">
          <MiniPrescription style={template.style} />
        </div>

        {selected && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#02C39A] text-white shadow-lg">
            <Check size={15} strokeWidth={3} />
          </div>
        )}

        {/* ONLY ONE PREVIEW BUTTON */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
          className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-center gap-2 rounded-xl bg-[#253237]/95 px-4 py-3 text-[9px] font-black uppercase tracking-wider text-white opacity-0 shadow-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye size={14} />
          Preview
        </button>
      </div>

      <div className="border-t border-[#E0FBFC] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-flex rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-wider text-white"
              style={{
                backgroundColor: template.accent,
              }}
            >
              {template.tag}
            </span>

            <h3 className="mt-3 text-sm font-black text-[#253237]">
              {template.name}
            </h3>
          </div>

          {selected && (
            <span className="text-[7px] font-black uppercase tracking-wider text-[#02C39A]">
              Selected
            </span>
          )}
        </div>

        <p className="mt-2 min-h-[45px] text-[9px] font-semibold leading-5 text-[#5C6B73]">
          {template.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-[#05668D]">
          <Check size={12} />
          Click card to select
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CUSTOM TEMPLATE CARD
========================================================= */

function CustomTemplateCard({
  template,
  selected,
  onSelect,
  onPreview,
  onDelete,
}) {
  return (
    <article
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-[26px] border bg-white transition duration-300 hover:-translate-y-1 ${
        selected
          ? "border-[#02C39A] shadow-[0_25px_60px_-30px_rgba(2,195,154,0.55)]"
          : "border-[#C2DFE3] shadow-[0_20px_50px_-30px_rgba(37,50,55,0.3)]"
      }`}
    >
      <div className="relative h-[250px] overflow-hidden bg-[#D8E8EA]">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <ExactCustomCanvas
            template={template}
            sample
            className="origin-center scale-[0.25] shadow-xl"
          />
        </div>

        {selected && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#02C39A] text-white shadow-lg">
            <Check size={15} strokeWidth={3} />
          </div>
        )}

        {/* ONLY ONE PREVIEW BUTTON */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
          className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-center gap-2 rounded-xl bg-[#253237]/95 px-4 py-3 text-[9px] font-black uppercase tracking-wider text-white opacity-0 shadow-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye size={14} />
          Preview
        </button>
      </div>

      <div className="border-t border-[#E0FBFC] p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex rounded-full bg-[#02C39A] px-2 py-1 text-[7px] font-black uppercase tracking-wider text-white">
              Custom
            </span>

            <h3 className="mt-3 text-sm font-black text-[#253237]">
              {template.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9DB4C0] transition hover:bg-red-50 hover:text-red-500"
            aria-label={`Delete ${template.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <p className="mt-2 min-h-[45px] text-[9px] font-semibold leading-5 text-[#5C6B73]">
          {template.description ||
            "Your custom prescription design."}
        </p>

        <div className="mt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-[#02C39A]">
          <Check size={12} />
          Click card to select
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MINI NORMAL PRESCRIPTION
========================================================= */

function MiniPrescription({ style }) {
  const accent =
    style === "hospital"
      ? "#00A896"
      : style === "modern"
        ? "#05668D"
        : style === "minimal"
          ? "#02C39A"
          : "#253237";

  const modern = style === "modern";

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white p-4 shadow-[0_8px_30px_rgba(37,50,55,0.12)]">
      <div
        className={`flex items-start justify-between gap-3 ${
          modern
            ? "rounded-lg p-3"
            : "border-b-2 pb-3"
        }`}
        style={{
          borderColor: accent,
          backgroundColor: modern
            ? "#05668D"
            : "transparent",
        }}
      >
        <div>
          <div
            className={`text-[11px] font-black ${
              modern
                ? "text-white"
                : "text-[#253237]"
            }`}
          >
            CITY MEDICAL CENTER
          </div>

          <div
            className={`mt-1 text-[5px] font-bold ${
              modern
                ? "text-white/70"
                : "text-[#5C6B73]"
            }`}
          >
            Hospital • Clinic • Medical Services
          </div>
        </div>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor: modern
              ? "rgba(255,255,255,.15)"
              : `${accent}12`,
            color: modern ? "#fff" : accent,
          }}
        >
          <Stethoscope size={15} />
        </div>
      </div>

      <div
        className="mt-3 rounded-lg p-3"
        style={{
          backgroundColor:
            style === "minimal"
              ? "#fff"
              : "#F7FBFB",
          border:
            style === "hospital"
              ? "1px solid #C2DFE3"
              : "none",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[5px] font-black uppercase tracking-wider text-[#5C6B73]">
            Patient Information
          </span>

          <span className="text-[5px] font-bold text-[#9DB4C0]">
            16 Sep 2026
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <MiniDetail label="Name" value="Ahmad" />
          <MiniDetail label="Age" value="32" />
          <MiniDetail label="Gender" value="Male" />
          <MiniDetail label="ID" value="1024" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: accent }}
          >
            <span className="font-serif text-sm">
              ℞
            </span>
          </div>

          <span className="text-[9px] font-black text-[#253237]">
            Rx
          </span>
        </div>

        <div className="mt-2 overflow-hidden rounded-lg border border-[#E0FBFC]">
          <div className="grid grid-cols-[20px_1fr_45px] bg-[#F7FBFB] px-2 py-1.5 text-[5px] font-black uppercase text-[#5C6B73]">
            <span>#</span>
            <span>Medicine</span>
            <span>Dose</span>
          </div>

          {["Amoxicillin 500mg", "Paracetamol 500mg"].map(
            (medicine, index) => (
              <div
                key={medicine}
                className="grid grid-cols-[20px_1fr_45px] border-t border-[#E0FBFC] px-2 py-2"
              >
                <span
                  className="text-[5px] font-black"
                  style={{ color: accent }}
                >
                  0{index + 1}
                </span>

                <span className="text-[5px] font-black text-[#253237]">
                  {medicine}
                </span>

                <span className="text-[5px] font-bold text-[#5C6B73]">
                  1×3
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-[#E0FBFC] pt-2">
        <div className="text-[5px] font-black text-[#253237]">
          Dr. Sarah Ahmad
        </div>

        <div className="mt-1 text-[4px] font-semibold text-[#5C6B73]">
          General Physician
        </div>
      </div>

      <div className="mt-3 border-t border-[#E0FBFC] pt-2 text-[4px] font-semibold text-[#5C6B73]">
        Kabul, Afghanistan • Hospital Street
      </div>
    </div>
  );
}

function MiniDetail({ label, value }) {
  return (
    <div>
      <p className="text-[4px] font-black uppercase text-[#9DB4C0]">
        {label}
      </p>

      <p className="mt-0.5 text-[5px] font-black text-[#253237]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TOKEN DATA
========================================================= */

function getCustomPreviewValue(token) {
  const values = {
    hospitalName: "CITY MEDICAL CENTER",
    hospitalAddress: "Kabul, Afghanistan • Hospital Street",
    hospitalPhone:
      "+93 700 111 111 • +93 700 222 222",
    doctorName: "Dr. Sarah Ahmad",
    doctorPhone: "+93 700 333 333",
    specialty: "General Physician",
    patientName: "Ahmad Rahimi",
    patientAge: "32",
    patientGender: "Male",
    patientPhone: "+93 700 000 000",
    patientId: "PT-1024",
    date: "16 Sep 2026",
    medicines:
      "01  Amoxicillin 500mg    1 × 3 daily\n02  Paracetamol 500mg    1 × 2 daily\n03  Cetirizine 10mg       1 × 1 nightly",
    notes: "Take medicines as directed.",
  };

  return values[token] ?? "";
}

function replaceCustomTokens(text) {
  if (!text) return "";

  return text.replace(
    /\{\{([^}]+)\}\}/g,
    (_, token) =>
      getCustomPreviewValue(token.trim())
  );
}

/* =========================================================
   EXACT CUSTOM CANVAS
========================================================= */

function ExactCustomCanvas({
  template,
  sample = true,
  className = "",
}) {
  const canvasWidth =
    template?.canvas?.width || 794;

  const canvasHeight =
    template?.canvas?.height || 1123;

  const elements = Array.isArray(
    template?.elements
  )
    ? template.elements
    : [];

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-white ${className}`}
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}
    >
      {elements.map((element, index) => {
        const style = {
          position: "absolute",
          left: element.x || 0,
          top: element.y || 0,
          width: element.width || 100,
          height: element.height || 50,
          zIndex: index + 1,
        };

        if (element.type === "text") {
          return (
            <div
              key={element.id || index}
              style={{
                ...style,
                fontFamily:
                  element.fontFamily ||
                  "Arial",
                fontSize:
                  element.fontSize || 16,
                fontWeight:
                  element.fontWeight || 500,
                fontStyle:
                  element.fontStyle || "normal",
                color:
                  element.color || "#253237",
                textAlign:
                  element.textAlign || "left",
                lineHeight: 1.2,
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {sample
                ? replaceCustomTokens(
                    element.text
                  )
                : element.text}
            </div>
          );
        }

        if (element.type === "line") {
          return (
            <div
              key={element.id || index}
              style={{
                ...style,
                backgroundColor:
                  element.color || "#00A896",
              }}
            />
          );
        }

        if (element.type === "shape") {
          return (
            <div
              key={element.id || index}
              style={{
                ...style,
                backgroundColor:
                  element.backgroundColor ||
                  "transparent",
                borderColor:
                  element.borderColor ||
                  "#00A896",
                borderWidth:
                  element.borderWidth || 0,
                borderStyle: "solid",
                borderRadius:
                  element.shape === "circle"
                    ? "9999px"
                    : element.shape === "square"
                      ? "4px"
                      : "10px",
              }}
            />
          );
        }

        if (element.type === "image") {
          return (
            <img
              key={element.id || index}
              src={element.src}
              alt=""
              draggable={false}
              style={{
                ...style,
                objectFit:
                  element.objectFit || "contain",
              }}
            />
          );
        }

        if (element.type === "icon") {
          const Icon =
            customPreviewIcons[
              element.icon
            ] || FileText;

          return (
            <div
              key={element.id || index}
              style={{
                ...style,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  element.color || "#00A896",
              }}
            >
              <Icon
                size={element.size || 48}
                strokeWidth={1.5}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/* =========================================================
   PREVIEW MODAL
========================================================= */

function PreviewModal({
  template,
  onClose,
  onUse,
}) {
  const isCustom =
    template.layout === "custom" ||
    template.type === "Custom";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#253237]/70 p-4 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E0FBFC] px-5 py-4 sm:px-7">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#9DB4C0]">
              {isCustom
                ? "My Template"
                : "Template Preview"}
            </p>

            <h2 className="mt-1 text-lg font-black text-[#253237]">
              {template.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0FBFC] text-[#253237] transition hover:bg-[#C2DFE3]"
          >
            <X size={17} />
          </button>
        </div>

        {/* PREVIEW */}
        <div className="flex-1 overflow-auto bg-[#E0FBFC]/50 p-4 sm:p-7">
          {isCustom ? (
            <FullCustomPrescription
              template={template}
            />
          ) : (
            <FullPrescription
              style={template.style}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-3 border-t border-[#E0FBFC] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-[9px] font-semibold text-[#5C6B73]">
            Selecting this template saves it for your
            New Prescription page.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#E0FBFC] px-5 py-3 text-[8px] font-black uppercase tracking-wider text-[#253237] transition hover:bg-[#C2DFE3]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onUse}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#253237] px-5 py-3 text-[8px] font-black uppercase tracking-wider text-[#E0FBFC] transition hover:bg-[#05668D]"
            >
              <Check
                size={13}
                strokeWidth={3}
              />
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FULL CUSTOM
========================================================= */

function FullCustomPrescription({
  template,
}) {
  return (
    <div className="flex justify-center">
      <div className="overflow-auto rounded-2xl bg-[#D8E8EA] p-4 shadow-inner sm:p-8">
        <ExactCustomCanvas
          template={template}
          sample
          className="shadow-2xl"
        />
      </div>
    </div>
  );
}

/* =========================================================
   FULL NORMAL PRESCRIPTION
========================================================= */

function FullPrescription({ style }) {
  const isModern = style === "modern";
  const isHospital = style === "hospital";
  const isMinimal = style === "minimal";

  const accent = isHospital
    ? "#00A896"
    : isModern
      ? "#05668D"
      : isMinimal
        ? "#02C39A"
        : "#253237";

  return (
    <div className="mx-auto max-w-4xl rounded-[18px] bg-white p-5 shadow-xl sm:p-8">
      {/* HOSPITAL HEADER */}
      <div
        className={
          isModern
            ? "rounded-2xl bg-[#05668D] p-6 text-white"
            : isHospital
              ? "border-b-4 border-[#00A896] pb-5"
              : isMinimal
                ? "border-b border-[#E0FBFC] pb-5"
                : "border-b-2 border-[#253237] pb-5"
        }
      >
        <div className="flex items-center justify-between gap-5">
          <div>
            <h1
              className={`text-xl font-black sm:text-2xl ${
                isModern
                  ? "text-white"
                  : "text-[#253237]"
              }`}
            >
              CITY MEDICAL CENTER
            </h1>

            <p
              className={`mt-1 text-[9px] font-bold ${
                isModern
                  ? "text-white/70"
                  : "text-[#5C6B73]"
              }`}
            >
              Hospital • Clinic • Medical Services
            </p>

            <p
              className={`mt-2 text-[8px] font-semibold ${
                isModern
                  ? "text-white/70"
                  : "text-[#5C6B73]"
              }`}
            >
              Kabul, Afghanistan • +93 700 000 000
            </p>
          </div>

          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isModern
                ? "rgba(255,255,255,.15)"
                : `${accent}12`,
              color: isModern ? "#fff" : accent,
            }}
          >
            <Stethoscope size={28} />
          </div>
        </div>
      </div>

      {/* PATIENT */}
      <div
        className={`mt-6 ${
          isModern
            ? "rounded-2xl bg-[#E0FBFC] p-5"
            : isHospital
              ? "rounded-xl border border-[#C2DFE3] p-5"
              : "rounded-xl bg-[#F7FBFB] p-5"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#5C6B73]">
            Patient Information
          </p>

          <p className="text-[8px] font-bold text-[#9DB4C0]">
            16 Sep 2026
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
          <Detail label="Name" value="Ahmad Rahimi" />
          <Detail label="Age" value="32 Years" />
          <Detail label="Gender" value="Male" />
          <Detail label="Patient ID" value="PT-1024" />
          <Detail label="Phone" value="+93 700 000 000" />
          <Detail label="Address" value="Kabul" />
          <Detail label="Blood Group" value="O+" />
          <Detail label="Date" value="16 Sep 2026" />
        </div>
      </div>

      {/* RX */}
      <div className="mt-7">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-serif text-lg font-black text-white"
            style={{
              backgroundColor: accent,
            }}
          >
            ℞
          </div>

          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#9DB4C0]">
              Prescription
            </p>

            <h2 className="text-lg font-black text-[#253237]">
              Rx
            </h2>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-[#E0FBFC]">
          <div className="grid grid-cols-[35px_1fr_100px] gap-3 bg-[#F7FBFB] px-4 py-3 text-[7px] font-black uppercase tracking-wider text-[#5C6B73]">
            <span>#</span>
            <span>Medicine</span>
            <span>Dosage</span>
          </div>

          <FullMedicine
            number="01"
            name="Amoxicillin 500mg"
            dose="1 × 3 daily"
            accent={accent}
          />

          <FullMedicine
            number="02"
            name="Paracetamol 500mg"
            dose="1 × 2 daily"
            accent={accent}
          />

          <FullMedicine
            number="03"
            name="Cetirizine 10mg"
            dose="1 × 1 nightly"
            accent={accent}
          />
        </div>
      </div>

      {/* DOCTOR */}
      <div className="mt-8 border-t border-[#E0FBFC] pt-5">
        <p className="text-[7px] font-black uppercase tracking-wider text-[#9DB4C0]">
          Prescribed by
        </p>

        <p className="mt-1 text-sm font-black text-[#253237]">
          Dr. Sarah Ahmad
        </p>

        <p className="mt-1 text-[8px] font-semibold text-[#5C6B73]">
          General Physician • License #AF-1024
        </p>
      </div>

      {/* FOOTER */}
      <div className="mt-7 border-t border-[#E0FBFC] pt-4">
        <div className="flex flex-col gap-2 text-[7px] font-semibold text-[#5C6B73] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Kabul, Afghanistan • Hospital Street
          </span>

          <span>
            Hospital: +93 700 111 111 • +93 700 222 222
          </span>

          <span>
            Doctor: +93 700 333 333
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[7px] font-black uppercase tracking-wider text-[#9DB4C0]">
        {label}
      </p>

      <p className="mt-1 text-[9px] font-black text-[#253237]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FULL MEDICINE
========================================================= */

function FullMedicine({
  number,
  name,
  dose,
  accent,
}) {
  return (
    <div className="grid grid-cols-[35px_1fr_100px] items-center gap-3 border-t border-[#E0FBFC] px-4 py-4">
      <span
        className="text-[8px] font-black"
        style={{ color: accent }}
      >
        {number}
      </span>

      <span className="text-[9px] font-black text-[#253237]">
        {name}
      </span>

      <span className="text-[8px] font-bold text-[#5C6B73]">
        {dose}
      </span>
    </div>
  );
}

export default Templates;