import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Trash2,
  Save,
  Check,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Medicines() {
  const navigate = useNavigate();
  const location = useLocation();

  const patient = location.state?.patient;

  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  /*
   * These are the prescription defaults saved for the medicine.
   *
   * The doctor can change every one of these before adding
   * the medicine to the prescription.
   */
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const [addedMedicines, setAddedMedicines] = useState([]);

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [savedDefaults, setSavedDefaults] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Search medicines
  // --------------------------------------------------

  useEffect(() => {
    async function searchMedicines() {
      if (!search.trim()) {
        setMedicines([]);
        return;
      }

      setLoading(true);
      setError("");

      const searchValue = search.trim();

      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .or(
          `name.ilike.%${searchValue}%,generic_name.ilike.%${searchValue}%`
        )
        .order("name", { ascending: true })
        .limit(10);

      if (error) {
        setError(error.message);
        setMedicines([]);
        setLoading(false);
        return;
      }

      setMedicines(data || []);
      setLoading(false);
    }

    const timer = setTimeout(() => {
      searchMedicines();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // --------------------------------------------------
  // No patient
  // --------------------------------------------------

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FileText
            size={42}
            className="mx-auto text-slate-300"
          />

          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            No patient selected
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please select a patient before creating a prescription.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/new-prescription")
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Patient
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Get saved value from medicine
  // --------------------------------------------------

  function getMedicineValue(
    medicine,
    possibleKeys
  ) {
    for (const key of possibleKeys) {
      const value = medicine?.[key];

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return String(value);
      }
    }

    return "";
  }

  // --------------------------------------------------
  // Select medicine
  // --------------------------------------------------

  function handleSelectMedicine(medicine) {
    setSelectedMedicine(medicine);

    setSearch("");
    setMedicines([]);
    setError("");
    setSavedDefaults(false);

    /*
     * IMPORTANT:
     *
     * We are NOT inventing medication information here.
     *
     * We only take information already stored on the
     * medicine record.
     *
     * Multiple possible column names are supported so
     * this works with different versions of your table.
     */

    setStrength(
      getMedicineValue(medicine, [
        "strength",
        "default_strength",
      ])
    );

    setForm(
      getMedicineValue(medicine, [
        "form",
        "dosage_form",
        "default_form",
      ])
    );

    setDosage(
      getMedicineValue(medicine, [
        "dosage",
        "default_dosage",
        "dose",
        "default_dose",
      ])
    );

    setFrequency(
      getMedicineValue(medicine, [
        "frequency",
        "default_frequency",
      ])
    );

    setDuration(
      getMedicineValue(medicine, [
        "duration",
        "default_duration",
      ])
    );

    setInstructions(
      getMedicineValue(medicine, [
        "instructions",
        "default_instructions",
        "sig",
        "default_sig",
      ])
    );
  }

  // --------------------------------------------------
  // Change medicine
  // --------------------------------------------------

  function handleChangeMedicine() {
    setSelectedMedicine(null);

    setStrength("");
    setForm("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setInstructions("");

    setSavedDefaults(false);
    setError("");
  }

  // --------------------------------------------------
  // Save defaults back to medicine library
  // --------------------------------------------------

  async function handleSaveMedicineDefaults() {
    if (!selectedMedicine?.id) {
      setError("Please select a medicine first.");
      return;
    }

    setSavingDefaults(true);
    setSavedDefaults(false);
    setError("");

    /*
     * These values are saved on the medicine record.
     *
     * Your Supabase medicines table needs these columns:
     *
     * strength
     * form
     * dosage
     * frequency
     * duration
     * instructions
     */

    const { data, error } = await supabase
      .from("medicines")
      .update({
        strength: strength.trim(),
        form: form.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        duration: duration.trim(),
        instructions: instructions.trim(),
      })
      .eq("id", selectedMedicine.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Could not save medicine defaults:",
        error
      );

      setError(
        `Could not save medicine defaults: ${error.message}`
      );

      setSavingDefaults(false);
      return;
    }

    setSelectedMedicine(data || {
      ...selectedMedicine,
      strength: strength.trim(),
      form: form.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim(),
    });

    setSavedDefaults(true);
    setSavingDefaults(false);
  }

  // --------------------------------------------------
  // Add medicine to prescription
  // --------------------------------------------------

  function handleAddMedicine() {
    setError("");

    if (!selectedMedicine) {
      setError("Please select a medicine first.");
      return;
    }

    if (!dosage.trim()) {
      setError("Please enter the dosage.");
      return;
    }

    if (!frequency.trim()) {
      setError("Please enter the frequency.");
      return;
    }

    if (!duration.trim()) {
      setError("Please enter the duration.");
      return;
    }

    const medicineItem = {
      id: crypto.randomUUID(),

      medicine_id: selectedMedicine.id,

      medicine_name:
        selectedMedicine.name || "",

      generic_name:
        selectedMedicine.generic_name || "",

      /*
       * These are the values currently shown
       * in the editable fields.
       */
      strength: strength.trim(),
      form: form.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim(),
    };

    setAddedMedicines((current) => [
      ...current,
      medicineItem,
    ]);

    /*
     * Reset only the prescription editor.
     */
    setSelectedMedicine(null);

    setStrength("");
    setForm("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setInstructions("");

    setSavedDefaults(false);
  }

  // --------------------------------------------------
  // Remove medicine
  // --------------------------------------------------

  function handleRemoveMedicine(id) {
    setAddedMedicines((current) =>
      current.filter(
        (medicine) => medicine.id !== id
      )
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={() =>
              navigate("/new-prescription", {
                state: { patient },
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Create Prescription
            </h1>

            <p className="text-sm text-slate-500">
              Create and review the prescription before printing.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-8 px-6 py-8 xl:grid-cols-[430px_1fr]">
        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <section className="space-y-5">
          {/* Patient */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Patient
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {patient.full_name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  ID: {patient.patient_id}

                  {patient.age !== null &&
                    patient.age !== undefined &&
                    ` • Age: ${patient.age}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/new-prescription", {
                    state: { patient },
                  })
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Change
              </button>
            </div>
          </div>

          {/* Medicine editor */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Add Medicine
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a medicine and its saved prescription information will be filled automatically.
              </p>
            </div>

            {!selectedMedicine ? (
              <>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Medicine
                </label>

                <div className="relative">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search medicine..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {loading && (
                  <p className="mt-3 text-sm text-slate-500">
                    Searching...
                  </p>
                )}

                {error && (
                  <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {medicines.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    {medicines.map((medicine) => (
                      <button
                        key={medicine.id}
                        type="button"
                        onClick={() =>
                          handleSelectMedicine(
                            medicine
                          )
                        }
                        className="w-full border-b border-slate-100 p-4 text-left transition last:border-b-0 hover:bg-slate-50"
                      >
                        <p className="font-semibold text-slate-900">
                          {medicine.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {medicine.generic_name ||
                            "Generic name unavailable"}

                          {medicine.strength &&
                            ` • ${medicine.strength}`}

                          {medicine.form &&
                            ` • ${medicine.form}`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {search.trim() &&
                  !loading &&
                  medicines.length === 0 &&
                  !error && (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-5 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No medicine found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Try another name.
                      </p>
                    </div>
                  )}
              </>
            ) : (
              <>
                {/* Selected medicine */}

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Selected
                      </p>

                      <h3 className="mt-1 font-bold text-slate-900">
                        {selectedMedicine.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        {selectedMedicine.generic_name}

                        {strength &&
                          ` • ${strength}`}

                        {form &&
                          ` • ${form}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleChangeMedicine}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Prescription details */}

                <div className="mt-5 space-y-4">
                  {/* Strength */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Strength
                    </label>

                    <input
                      type="text"
                      value={strength}
                      onChange={(e) =>
                        setStrength(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 500 mg"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Form */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Form
                    </label>

                    <input
                      type="text"
                      value={form}
                      onChange={(e) =>
                        setForm(e.target.value)
                      }
                      placeholder="e.g. Tablet"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Dosage */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Dose
                    </label>

                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) =>
                        setDosage(e.target.value)
                      }
                      placeholder="e.g. 1 tablet"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Frequency */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Frequency
                    </label>

                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) =>
                        setFrequency(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 3 times daily"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Duration */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Duration
                    </label>

                    <input
                      type="text"
                      value={duration}
                      onChange={(e) =>
                        setDuration(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 1 week"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Instructions */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Instructions
                    </label>

                    <textarea
                      value={instructions}
                      onChange={(e) =>
                        setInstructions(
                          e.target.value
                        )
                      }
                      placeholder="e.g. After food"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Save defaults */}

                  <button
                    type="button"
                    onClick={
                      handleSaveMedicineDefaults
                    }
                    disabled={savingDefaults}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savedDefaults ? (
                      <>
                        <Check size={18} />
                        Defaults Saved
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save as Medicine Defaults
                      </>
                    )}
                  </button>

                  {/* Add */}

                  <button
                    type="button"
                    onClick={
                      handleAddMedicine
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus size={19} />
                    Add to Prescription
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Added medicines */}

          {addedMedicines.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="font-bold text-slate-900">
                  Added Medicines
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {addedMedicines.length} medicine
                  {addedMedicines.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="space-y-3">
                {addedMedicines.map(
                  (medicine, index) => (
                    <div
                      key={medicine.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-600">
                              {index + 1}
                            </span>

                            <h3 className="font-semibold text-slate-900">
                              {
                                medicine.medicine_name
                              }
                            </h3>
                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            {medicine.strength &&
                              `${medicine.strength} • `}

                            {medicine.dosage} •{" "}
                            {medicine.frequency} •{" "}
                            {medicine.duration}
                          </p>

                          {medicine.instructions && (
                            <p className="mt-1 text-xs text-slate-400">
                              {
                                medicine.instructions
                              }
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMedicine(
                              medicine.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Notes */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Prescription Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          )}
        </section>

        {/* ==================================================
            RIGHT SIDE - LIVE PRESCRIPTION
        ================================================== */}

        <section className="flex justify-center">
          <div className="w-full max-w-[800px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Prescription Preview
                </h2>

                <p className="text-sm text-slate-500">
                  Live preview
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                A4
              </span>
            </div>

            {/* Prescription paper */}

            <div className="min-h-[1050px] bg-white p-10 shadow-xl ring-1 ring-slate-200">
              {/* Hospital / Doctor Header */}

              <div className="border-b-2 border-slate-900 pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
                      Hospital / Clinic Name
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                      Doctor Name
                    </p>

                    <p className="text-sm text-slate-500">
                      Medical Specialty
                    </p>
                  </div>

                  <div className="text-right text-sm text-slate-500">
                    <p>
                      Phone: +93 XXX XXX XXX
                    </p>

                    <p className="mt-1">
                      Address: Clinic Address
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient */}

              <div className="mt-6 rounded-lg border border-slate-200 p-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div>
                    <span className="font-semibold">
                      Patient Name:
                    </span>{" "}
                    {patient.full_name}
                  </div>

                  <div>
                    <span className="font-semibold">
                      Age:
                    </span>{" "}
                    {patient.age ?? "—"}
                  </div>

                  <div>
                    <span className="font-semibold">
                      Patient ID:
                    </span>{" "}
                    {patient.patient_id}
                  </div>

                  <div>
                    <span className="font-semibold">
                      Date:
                    </span>{" "}
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Rx */}

              <div className="mt-10">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-4xl font-serif font-bold italic">
                    Rx
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {addedMedicines.length ===
                0 ? (
                  <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200">
                    <div className="text-center">
                      <FileText
                        size={40}
                        className="mx-auto text-slate-200"
                      />

                      <p className="mt-3 font-medium text-slate-400">
                        Medicines will appear
                        here
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add medicines from the
                        editor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-7">
                    {addedMedicines.map(
                      (medicine, index) => (
                        <div
                          key={medicine.id}
                          className="flex gap-4"
                        >
                          <div className="text-lg font-semibold text-slate-500">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">
                              {
                                medicine.medicine_name
                              }

                              {medicine.strength &&
                                ` ${medicine.strength}`}
                            </h3>

                            {medicine.generic_name && (
                              <p className="mt-1 text-sm italic text-slate-500">
                                {
                                  medicine.generic_name
                                }
                              </p>
                            )}

                            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Dose
                                </p>

                                <p className="mt-1 font-medium text-slate-700">
                                  {
                                    medicine.dosage
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Frequency
                                </p>

                                <p className="mt-1 font-medium text-slate-700">
                                  {
                                    medicine.frequency
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Duration
                                </p>

                                <p className="mt-1 font-medium text-slate-700">
                                  {
                                    medicine.duration
                                  }
                                </p>
                              </div>
                            </div>

                            {medicine.instructions && (
                              <p className="mt-3 text-sm text-slate-600">
                                <span className="font-semibold">
                                  Instructions:
                                </span>{" "}
                                {
                                  medicine.instructions
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}

              {notes && (
                <div className="mt-12 border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Notes
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {notes}
                  </p>
                </div>
              )}

              {/* Signature */}

              <div className="mt-24 flex justify-end">
                <div className="w-56 text-center">
                  <div className="mb-3 border-b border-slate-400" />

                  <p className="text-sm font-semibold text-slate-800">
                    Doctor Signature
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Doctor Name
                  </p>
                </div>
              </div>

              {/* Footer */}

              <div className="mt-16 border-t border-slate-200 pt-4 text-center">
                <p className="text-xs text-slate-400">
                  This prescription was generated electronically.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Medicines;