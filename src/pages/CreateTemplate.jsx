import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Bold,
  Check,
  Circle,
  Copy,
  Droplets,
  Eraser,
  FileImage,
  FileText,
  HeartPulse,
  ImagePlus,
  Layers,
  Minus,
  Palette,
  Pill,
  Plus,
  RectangleHorizontal,
  Square,
  Stethoscope,
  Syringe,
  Trash2,
  Type,
  Upload,
  UserRound,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CUSTOM_TEMPLATES_KEY = "rxflow-custom-templates";

const fonts = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Tahoma",
];

const colors = [
  "#253237",
  "#05668D",
  "#028090",
  "#00A896",
  "#02C39A",
  "#F0F3BD",
  "#DC2626",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#5C6B73",
  "#111827",
  "#FFFFFF",
];

const shapeOptions = [
  { type: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
  { type: "square", label: "Square", icon: Square },
  { type: "circle", label: "Circle", icon: Circle },
  { type: "line", label: "Line", icon: Minus },
];

const iconOptions = [
  { id: "HeartPulse", name: "Heart Pulse", icon: HeartPulse },
  { id: "Stethoscope", name: "Stethoscope", icon: Stethoscope },
  { id: "Pill", name: "Pill", icon: Pill },
  { id: "Syringe", name: "Syringe", icon: Syringe },
  { id: "UserRound", name: "User", icon: UserRound },
  { id: "Droplets", name: "Droplets", icon: Droplets },
  { id: "FileText", name: "File", icon: FileText },
  { id: "FileImage", name: "Image", icon: FileImage },
];

function CreateTemplate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [templateName, setTemplateName] = useState(
    "My Custom Template"
  );

  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(65);
  const [showImageUrl, setShowImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [elements, setElements] = useState([
    {
      id: crypto.randomUUID(),
      type: "text",
      x: 90,
      y: 70,
      width: 420,
      height: 55,
      text: "{{hospitalName}}",
      fontFamily: "Arial",
      fontSize: 26,
      fontWeight: 800,
      fontStyle: "normal",
      color: "#253237",
      textAlign: "left",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      x: 90,
      y: 130,
      width: 500,
      height: 35,
      text: "{{doctorName}} · {{specialty}}",
      fontFamily: "Arial",
      fontSize: 14,
      fontWeight: 600,
      fontStyle: "normal",
      color: "#5C6B73",
      textAlign: "left",
    },
    {
      id: crypto.randomUUID(),
      type: "line",
      x: 90,
      y: 180,
      width: 620,
      height: 2,
      color: "#00A896",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      x: 90,
      y: 225,
      width: 620,
      height: 45,
      text:
        "Patient: {{patientName}}    Age: {{patientAge}}    Gender: {{patientGender}}    Phone: {{patientPhone}}    ID: {{patientId}}    Date: {{date}}",
      fontFamily: "Arial",
      fontSize: 11,
      fontWeight: 600,
      fontStyle: "normal",
      color: "#253237",
      textAlign: "left",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      x: 90,
      y: 310,
      width: 120,
      height: 60,
      text: "Rx",
      fontFamily: "Georgia",
      fontSize: 40,
      fontWeight: 700,
      fontStyle: "italic",
      color: "#00A896",
      textAlign: "left",
    },
  ]);

  const selectedElement = elements.find(
    (element) => element.id === selectedId
  );

  function updateElement(id, changes) {
    setElements((current) =>
      current.map((element) =>
        element.id === id
          ? { ...element, ...changes }
          : element
      )
    );
  }

  function addText(text = "New Text") {
    const element = {
      id: crypto.randomUUID(),
      type: "text",
      x: 100,
      y: 400 + elements.length * 20,
      width: 500,
      height: 55,
      text,
      fontFamily: "Arial",
      fontSize: 16,
      fontWeight: 500,
      fontStyle: "normal",
      color: "#253237",
      textAlign: "left",
    };

    setElements((current) => [...current, element]);
    setSelectedId(element.id);
  }

  function addShape(type) {
    let element;

    if (type === "circle") {
      element = {
        id: crypto.randomUUID(),
        type: "shape",
        shape: "circle",
        x: 150,
        y: 450,
        width: 100,
        height: 100,
        backgroundColor: "#E0FBFC",
        borderColor: "#00A896",
        borderWidth: 2,
      };
    } else if (type === "line") {
      element = {
        id: crypto.randomUUID(),
        type: "line",
        x: 120,
        y: 450,
        width: 350,
        height: 2,
        color: "#00A896",
      };
    } else if (type === "rectangle") {
      element = {
        id: crypto.randomUUID(),
        type: "shape",
        shape: "rectangle",
        x: 140,
        y: 450,
        width: 280,
        height: 100,
        backgroundColor: "#E0FBFC",
        borderColor: "#00A896",
        borderWidth: 2,
      };
    } else {
      element = {
        id: crypto.randomUUID(),
        type: "shape",
        shape: "square",
        x: 160,
        y: 450,
        width: 110,
        height: 110,
        backgroundColor: "#E0FBFC",
        borderColor: "#00A896",
        borderWidth: 2,
      };
    }

    setElements((current) => [...current, element]);
    setSelectedId(element.id);
  }

  function addIcon(iconId) {
    const element = {
      id: crypto.randomUUID(),
      type: "icon",
      x: 150,
      y: 450,
      width: 70,
      height: 70,
      color: "#00A896",
      size: 64,
      icon: iconId,
    };

    setElements((current) => [...current, element]);
    setSelectedId(element.id);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const element = {
        id: crypto.randomUUID(),
        type: "image",
        x: 150,
        y: 450,
        width: 160,
        height: 110,
        src: reader.result,
        objectFit: "contain",
      };

      setElements((current) => [...current, element]);
      setSelectedId(element.id);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function addImageFromUrl() {
    const url = imageUrl.trim();

    if (!url) return;

    const element = {
      id: crypto.randomUUID(),
      type: "image",
      x: 150,
      y: 450,
      width: 160,
      height: 110,
      src: url,
      objectFit: "contain",
    };

    setElements((current) => [...current, element]);
    setSelectedId(element.id);
    setImageUrl("");
    setShowImageUrl(false);
  }

  function deleteSelected() {
    if (!selectedId) return;

    setElements((current) =>
      current.filter((element) => element.id !== selectedId)
    );

    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selectedElement) return;

    const copy = {
      ...selectedElement,
      id: crypto.randomUUID(),
      x: selectedElement.x + 25,
      y: selectedElement.y + 25,
    };

    setElements((current) => [...current, copy]);
    setSelectedId(copy.id);
  }

  function moveLayer(direction) {
    if (!selectedId) return;

    setElements((current) => {
      const index = current.findIndex(
        (element) => element.id === selectedId
      );

      if (index === -1) return current;

      const next = [...current];

      if (
        direction === "up" &&
        index < next.length - 1
      ) {
        [next[index], next[index + 1]] = [
          next[index + 1],
          next[index],
        ];
      }

      if (
        direction === "down" &&
        index > 0
      ) {
        [next[index], next[index - 1]] = [
          next[index - 1],
          next[index],
        ];
      }

      return next;
    });
  }

  function handleDragStart(event, element) {
    event.stopPropagation();

    setSelectedId(element.id);

    const startX = event.clientX;
    const startY = event.clientY;

    const originalX = element.x;
    const originalY = element.y;

    function handleMove(moveEvent) {
      const deltaX =
        (moveEvent.clientX - startX) / (zoom / 100);

      const deltaY =
        (moveEvent.clientY - startY) / (zoom / 100);

      updateElement(element.id, {
        x: Math.max(0, originalX + deltaX),
        y: Math.max(0, originalY + deltaY),
      });
    }

    function handleUp() {
      window.removeEventListener(
        "mousemove",
        handleMove
      );

      window.removeEventListener(
        "mouseup",
        handleUp
      );
    }

    window.addEventListener(
      "mousemove",
      handleMove
    );

    window.addEventListener(
      "mouseup",
      handleUp
    );
  }

  function saveTemplate() {
    try {
      const existing = JSON.parse(
        localStorage.getItem(CUSTOM_TEMPLATES_KEY) || "[]"
      );

      const template = {
        id: crypto.randomUUID(),
        name:
          templateName.trim() || "My Custom Template",
        layout: "custom",
        type: "Custom",
        description:
          "Custom prescription template",
        color: "#00A896",
        accent: "#00A896",
        version: 2,
        elements,
        canvas: {
          width: 794,
          height: 1123,
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        CUSTOM_TEMPLATES_KEY,
        JSON.stringify([
          ...existing,
          template,
        ])
      );

      alert("Template saved successfully.");
      navigate("/templates");
    } catch (error) {
      console.error(error);
      alert("Could not save the template.");
    }
  }

  function clearCanvas() {
    const confirmed = window.confirm(
      "Clear all elements from this template?"
    );

    if (!confirmed) return;

    setElements([]);
    setSelectedId(null);
  }

  function renderIcon(element) {
    const item = iconOptions.find(
      (icon) => icon.id === element.icon
    );

    if (!item) {
      return (
        <FileText
          size={element.size || 48}
          strokeWidth={1.5}
        />
      );
    }

    const Icon = item.icon;

    return (
      <Icon
        size={element.size || 48}
        strokeWidth={1.5}
      />
    );
  }

  function renderElement(element, index) {
    const isSelected = element.id === selectedId;

    return (
      <div
        key={element.id}
        onMouseDown={(event) =>
          handleDragStart(event, element)
        }
        className={`absolute cursor-move ${
          isSelected
            ? "ring-2 ring-[#05668D] ring-offset-2"
            : ""
        }`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          zIndex: index + 1,
        }}
      >
        {element.type === "text" && (
          <div
            className="h-full w-full whitespace-pre-wrap break-words"
            style={{
              fontFamily: element.fontFamily,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              color: element.color,
              textAlign: element.textAlign,
              lineHeight: 1.2,
            }}
          >
            {element.text}
          </div>
        )}

        {element.type === "line" && (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: element.color,
            }}
          />
        )}

        {element.type === "shape" && (
          <div
            className="h-full w-full"
            style={{
              backgroundColor:
                element.backgroundColor,
              borderColor:
                element.borderColor,
              borderWidth:
                element.borderWidth || 0,
              borderStyle: "solid",
              borderRadius:
                element.shape === "circle"
                  ? "9999px"
                  : element.shape === "square"
                    ? "12px"
                    : "8px",
            }}
          />
        )}

        {element.type === "image" && (
          <img
            src={element.src}
            alt=""
            draggable={false}
            className="h-full w-full"
            style={{
              objectFit:
                element.objectFit || "contain",
            }}
          />
        )}

        {element.type === "icon" && (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              color: element.color,
            }}
          >
            {renderIcon(element)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#E7F2F3] text-[#253237]">
      <header className="z-50 flex h-[68px] shrink-0 items-center justify-between border-b border-[#C2DFE3] bg-white px-4 shadow-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/templates")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#5C6B73] transition hover:bg-[#E0FBFC] hover:text-[#05668D]"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#9DB4C0]">
              RxFlow · Template Builder
            </p>

            <input
              value={templateName}
              onChange={(event) =>
                setTemplateName(event.target.value)
              }
              className="mt-0.5 w-56 max-w-full bg-transparent text-sm font-black text-[#253237] outline-none"
              aria-label="Template name"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCanvas}
            className="hidden items-center gap-2 rounded-lg border border-[#C2DFE3] bg-white px-3 py-2 text-[10px] font-black text-[#5C6B73] transition hover:bg-[#E0FBFC] sm:flex"
          >
            <Eraser size={14} />
            Clear
          </button>

          <button
            type="button"
            onClick={saveTemplate}
            className="flex items-center gap-2 rounded-lg bg-[#253237] px-4 py-2.5 text-[10px] font-black text-white transition hover:bg-[#05668D]"
          >
            <Check size={15} />
            Save Template
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[230px] shrink-0 overflow-y-auto border-r border-[#C2DFE3] bg-white p-4">
          <ToolSection title="Add">
            <div className="grid grid-cols-2 gap-2">
              <ToolButton
                icon={<Type size={16} />}
                label="Text"
                onClick={() => addText("New Text")}
              />

              <ToolButton
                icon={<Bold size={16} />}
                label="Heading"
                onClick={() =>
                  addText("{{hospitalName}}")
                }
              />

              <ToolButton
                icon={<ImagePlus size={16} />}
                label="Image"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              />

              <ToolButton
                icon={<Upload size={16} />}
                label="Image URL"
                onClick={() => setShowImageUrl(true)}
              />
            </div>
          </ToolSection>

          <ToolSection title="Shapes">
            <div className="grid grid-cols-2 gap-2">
              {shapeOptions.map(
                ({ type, label, icon: Icon }) => (
                  <ToolButton
                    key={type}
                    icon={<Icon size={16} />}
                    label={label}
                    onClick={() => addShape(type)}
                  />
                )
              )}
            </div>
          </ToolSection>

          <ToolSection title="Icons">
            <div className="grid grid-cols-2 gap-2">
              {iconOptions.map(
                ({ id, name, icon: Icon }) => (
                  <ToolButton
                    key={id}
                    icon={<Icon size={16} />}
                    label={name}
                    onClick={() => addIcon(id)}
                  />
                )
              )}
            </div>
          </ToolSection>

          <ToolSection title="Quick Elements">
            <div className="space-y-2">
              <QuickButton
                label="Patient Information"
                onClick={() =>
                  addText(
                    "Patient: {{patientName}}    Age: {{patientAge}}    Gender: {{patientGender}}    Phone: {{patientPhone}}    ID: {{patientId}}    Date: {{date}}"
                  )
                }
              />

              <QuickButton
                label="Prescription"
                onClick={() =>
                  addText("{{medicines}}")
                }
              />

              <QuickButton
                label="Doctor Signature"
                onClick={() =>
                  addText(
                    "{{doctorName}}\n{{specialty}}\nDoctor Signature"
                  )
                }
              />

              <QuickButton
                label="Hospital Contact"
                onClick={() =>
                  addText(
                    "{{hospitalName}}\n{{hospitalAddress}}\n{{hospitalPhone}}"
                  )
                }
              />
            </div>
          </ToolSection>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </aside>

        <main className="relative min-w-0 flex-1 overflow-auto bg-[#D8E8EA]">
          <div className="sticky top-0 z-30 flex h-14 items-center justify-center border-b border-[#C2DFE3] bg-white/90 backdrop-blur-xl">
            <div className="flex items-center gap-1 rounded-xl border border-[#C2DFE3] bg-white p-1 shadow-sm">
              <CanvasButton
                icon={<ZoomOut size={15} />}
                onClick={() =>
                  setZoom((current) =>
                    Math.max(35, current - 10)
                  )
                }
              />

              <span className="min-w-[52px] text-center text-[10px] font-black text-[#5C6B73]">
                {zoom}%
              </span>

              <CanvasButton
                icon={<ZoomIn size={15} />}
                onClick={() =>
                  setZoom((current) =>
                    Math.min(100, current + 10)
                  )
                }
              />
            </div>
          </div>

          <div className="flex min-h-full justify-center px-8 py-10">
            <div
              className="relative"
              style={{
                width: 794 * (zoom / 100),
                height: 1123 * (zoom / 100),
              }}
            >
              <div
                className="relative origin-top-left overflow-hidden bg-white shadow-[0_25px_70px_rgba(37,50,55,0.18)]"
                style={{
                  width: 794,
                  height: 1123,
                  transform: `scale(${zoom / 100})`,
                }}
                onMouseDown={() =>
                  setSelectedId(null)
                }
              >
                <div className="pointer-events-none absolute bottom-10 left-10 right-10 top-10 border border-dashed border-[#C2DFE3]/60" />

                {elements.map(renderElement)}
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden w-[270px] shrink-0 overflow-y-auto border-l border-[#C2DFE3] bg-white p-4 xl:block">
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#9DB4C0]">
              Inspector
            </p>
            <h2 className="mt-1 text-sm font-black text-[#253237]">
              {selectedElement
                ? "Edit Element"
                : "Select an element"}
            </h2>
          </div>

          {!selectedElement ? (
            <div className="rounded-2xl border border-[#C2DFE3] bg-[#F7FBFB] p-4 text-xs leading-5 text-[#5C6B73]">
              Click an element on the prescription to edit it.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <SmallAction
                  icon={<Copy size={14} />}
                  label="Duplicate"
                  onClick={duplicateSelected}
                />

                <SmallAction
                  icon={<Trash2 size={14} />}
                  label="Delete"
                  danger
                  onClick={deleteSelected}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <SmallAction
                  icon={<ArrowUp size={14} />}
                  label="Layer Up"
                  onClick={() => moveLayer("up")}
                />

                <SmallAction
                  icon={<ArrowDown size={14} />}
                  label="Layer Down"
                  onClick={() => moveLayer("down")}
                />
              </div>

              <InspectorSection title="Position">
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="X"
                    value={selectedElement.x}
                    onChange={(value) =>
                      updateElement(selectedId, {
                        x: value,
                      })
                    }
                  />

                  <NumberField
                    label="Y"
                    value={selectedElement.y}
                    onChange={(value) =>
                      updateElement(selectedId, {
                        y: value,
                      })
                    }
                  />

                  <NumberField
                    label="Width"
                    value={selectedElement.width}
                    onChange={(value) =>
                      updateElement(selectedId, {
                        width: value,
                      })
                    }
                  />

                  <NumberField
                    label="Height"
                    value={selectedElement.height}
                    onChange={(value) =>
                      updateElement(selectedId, {
                        height: value,
                      })
                    }
                  />
                </div>
              </InspectorSection>

              {selectedElement.type === "text" && (
                <>
                  <InspectorSection title="Text">
                    <textarea
                      value={selectedElement.text || ""}
                      onChange={(event) =>
                        updateElement(selectedId, {
                          text: event.target.value,
                        })
                      }
                      className="min-h-[100px] w-full resize-none rounded-xl border border-[#C2DFE3] bg-[#F7FBFB] p-3 text-xs font-semibold text-[#253237] outline-none focus:border-[#00A896]"
                    />
                  </InspectorSection>

                  <InspectorSection title="Typography">
                    <select
                      value={
                        selectedElement.fontFamily ||
                        "Arial"
                      }
                      onChange={(event) =>
                        updateElement(selectedId, {
                          fontFamily: event.target.value,
                        })
                      }
                      className="mb-2 w-full rounded-xl border border-[#C2DFE3] bg-white px-3 py-2 text-xs font-semibold outline-none"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <NumberField
                        label="Size"
                        value={
                          selectedElement.fontSize || 16
                        }
                        onChange={(value) =>
                          updateElement(selectedId, {
                            fontSize: value,
                          })
                        }
                      />

                      <NumberField
                        label="Weight"
                        value={
                          selectedElement.fontWeight || 500
                        }
                        onChange={(value) =>
                          updateElement(selectedId, {
                            fontWeight: value,
                          })
                        }
                      />
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <SmallToggle
                        active={
                          selectedElement.fontWeight >= 700
                        }
                        label="Bold"
                        onClick={() =>
                          updateElement(selectedId, {
                            fontWeight:
                              selectedElement.fontWeight >=
                              700
                                ? 500
                                : 700,
                          })
                        }
                      />

                      <SmallToggle
                        active={
                          selectedElement.fontStyle ===
                          "italic"
                        }
                        label="Italic"
                        onClick={() =>
                          updateElement(selectedId, {
                            fontStyle:
                              selectedElement.fontStyle ===
                              "italic"
                                ? "normal"
                                : "italic",
                          })
                        }
                      />

                      <SmallToggle
                        active={
                          selectedElement.textAlign ===
                          "center"
                        }
                        label="Center"
                        onClick={() =>
                          updateElement(selectedId, {
                            textAlign:
                              selectedElement.textAlign ===
                              "center"
                                ? "left"
                                : "center",
                          })
                        }
                      />
                    </div>
                  </InspectorSection>

                  <InspectorSection title="Color">
                    <ColorPicker
                      value={selectedElement.color}
                      onChange={(value) =>
                        updateElement(selectedId, {
                          color: value,
                        })
                      }
                    />
                  </InspectorSection>
                </>
              )}

              {selectedElement.type === "line" && (
                <InspectorSection title="Line Color">
                  <ColorPicker
                    value={selectedElement.color}
                    onChange={(value) =>
                      updateElement(selectedId, {
                        color: value,
                      })
                    }
                  />
                </InspectorSection>
              )}

              {selectedElement.type === "shape" && (
                <InspectorSection title="Shape">
                  <ColorPicker
                    value={
                      selectedElement.backgroundColor
                    }
                    onChange={(value) =>
                      updateElement(selectedId, {
                        backgroundColor: value,
                      })
                    }
                  />

                  <div className="mt-3">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-[#9DB4C0]">
                      Border
                    </p>

                    <ColorPicker
                      value={
                        selectedElement.borderColor
                      }
                      onChange={(value) =>
                        updateElement(selectedId, {
                          borderColor: value,
                        })
                      }
                    />
                  </div>
                </InspectorSection>
              )}

              {selectedElement.type === "icon" && (
                <InspectorSection title="Icon">
                  <ColorPicker
                    value={selectedElement.color}
                    onChange={(value) =>
                      updateElement(selectedId, {
                        color: value,
                      })
                    }
                  />

                  <div className="mt-3">
                    <NumberField
                      label="Size"
                      value={
                        selectedElement.size || 48
                      }
                      onChange={(value) =>
                        updateElement(selectedId, {
                          size: value,
                        })
                      }
                    />
                  </div>
                </InspectorSection>
              )}

              {selectedElement.type === "image" && (
                <InspectorSection title="Image">
                  <select
                    value={
                      selectedElement.objectFit ||
                      "contain"
                    }
                    onChange={(event) =>
                      updateElement(selectedId, {
                        objectFit: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#C2DFE3] bg-white px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="contain">
                      Contain
                    </option>
                    <option value="cover">
                      Cover
                    </option>
                    <option value="fill">
                      Fill
                    </option>
                  </select>
                </InspectorSection>
              )}
            </div>
          )}
        </aside>
      </div>

      {showImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#253237]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#9DB4C0]">
                  Add Image
                </p>
                <h2 className="text-lg font-black text-[#253237]">
                  Image URL
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowImageUrl(false)}
                className="rounded-xl p-2 text-[#5C6B73] hover:bg-[#E0FBFC]"
              >
                <X size={18} />
              </button>
            </div>

            <input
              autoFocus
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(event.target.value)
              }
              placeholder="https://..."
              className="w-full rounded-xl border border-[#C2DFE3] bg-[#F7FBFB] px-4 py-3 text-sm outline-none focus:border-[#00A896]"
            />

            <button
              type="button"
              onClick={addImageFromUrl}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#05668D] px-4 py-3 text-xs font-black text-white transition hover:bg-[#028090]"
            >
              <Plus size={16} />
              Add Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolSection({ title, children }) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-[#00A896]" />
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#9DB4C0]">
          {title}
        </p>
      </div>

      {children}
    </section>
  );
}

function ToolButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl border border-[#C2DFE3] bg-[#F7FBFB] px-2 py-2 text-[#5C6B73] transition hover:-translate-y-0.5 hover:border-[#00A896] hover:bg-[#E0FBFC] hover:text-[#05668D]"
    >
      {icon}
      <span className="text-[9px] font-black">
        {label}
      </span>
    </button>
  );
}

function QuickButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-[#C2DFE3] bg-[#F7FBFB] px-3 py-2.5 text-left text-[10px] font-black text-[#253237] transition hover:border-[#00A896] hover:bg-[#E0FBFC]"
    >
      {label}
    </button>
  );
}

function CanvasButton({ icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C6B73] transition hover:bg-[#E0FBFC] hover:text-[#05668D]"
    >
      {icon}
    </button>
  );
}

function SmallAction({
  icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[9px] font-black transition ${
        danger
          ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-[#C2DFE3] bg-[#F7FBFB] text-[#5C6B73] hover:border-[#00A896] hover:bg-[#E0FBFC] hover:text-[#05668D]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InspectorSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-[#C2DFE3] bg-[#F7FBFB] p-3">
      <div className="mb-3 flex items-center gap-2">
        <Palette size={13} className="text-[#00A896]" />
        <p className="text-[9px] font-black uppercase tracking-wider text-[#5C6B73]">
          {title}
        </p>
      </div>

      {children}
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[8px] font-black uppercase tracking-wider text-[#9DB4C0]">
        {label}
      </span>

      <input
        type="number"
        value={Math.round(value || 0)}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full rounded-lg border border-[#C2DFE3] bg-white px-2 py-2 text-xs font-bold text-[#253237] outline-none focus:border-[#00A896]"
      />
    </label>
  );
}

function SmallToggle({
  active,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-1 py-2 text-[8px] font-black transition ${
        active
          ? "border-[#00A896] bg-[#00A896] text-white"
          : "border-[#C2DFE3] bg-white text-[#5C6B73]"
      }`}
    >
      {label}
    </button>
  );
}

function ColorPicker({
  value,
  onChange,
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`h-7 w-7 rounded-lg border-2 transition hover:scale-110 ${
            value === color
              ? "border-[#05668D] ring-2 ring-[#05668D]/20"
              : "border-white"
          }`}
          style={{
            backgroundColor: color,
          }}
          title={color}
        />
      ))}
    </div>
  );
}

export default CreateTemplate;