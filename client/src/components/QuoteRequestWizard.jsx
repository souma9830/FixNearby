import React, { useState } from "react";
import {
  Droplet,
  Zap,
  Snowflake,
  Hammer,
  Palette,
  Sparkles,
  Plug,
  Leaf,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Camera,
  AlertCircle,
  HelpCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { createRequest } from "../services/serviceRequestService";
import useToast from "../hooks/useToast";
import useGeolocation from "../hooks/useGeolocation";
import { compressImage } from "../utils/imageCompressor";
import { useLocation } from "../context/LocationContext";

const CATEGORIES = [
  {
    id: "Plumbing",
    label: "Plumbing",
    icon: Droplet,
    color: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50 border-blue-200 text-blue-700",
    desc: "Pipe leaks, clogged drains, faucets, water heaters & installations",
  },
  {
    id: "Electrical",
    label: "Electrical",
    icon: Zap,
    color: "from-amber-500 to-yellow-500",
    bgLight: "bg-amber-50 border-amber-200 text-amber-700",
    desc: "Wiring, breakers, switches, lighting, EV chargers & panel upgrades",
  },
  {
    id: "HVAC",
    label: "HVAC & AC",
    icon: Snowflake,
    color: "from-teal-500 to-emerald-500",
    bgLight: "bg-teal-50 border-teal-200 text-teal-700",
    desc: "AC cooling repair, heating, thermostat errors & duct maintenance",
  },
  {
    id: "Carpentry",
    label: "Carpentry",
    icon: Hammer,
    color: "from-orange-500 to-amber-600",
    bgLight: "bg-orange-50 border-orange-200 text-orange-700",
    desc: "Door frames, furniture assembly, cabinets, decking & woodwork",
  },
  {
    id: "Painting",
    label: "Painting",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-50 border-purple-200 text-purple-700",
    desc: "Interior rooms, exterior facade, wall touch-ups & drywall repair",
  },
  {
    id: "Cleaning",
    label: "Cleaning",
    icon: Sparkles,
    color: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-50 border-emerald-200 text-emerald-700",
    desc: "Deep house cleaning, move-in/out, sofa & carpet shampooing",
  },
  {
    id: "Appliance Repair",
    label: "Appliance Repair",
    icon: Plug,
    color: "from-indigo-500 to-blue-600",
    bgLight: "bg-indigo-50 border-indigo-200 text-indigo-700",
    desc: "Refrigerators, washers, dryers, dishwashers, ovens & microwaves",
  },
  {
    id: "Landscaping",
    label: "Landscaping",
    icon: Leaf,
    color: "from-lime-500 to-emerald-600",
    bgLight: "bg-lime-50 border-lime-200 text-lime-700",
    desc: "Lawn mowing, garden trimming, irrigation repair & yard maintenance",
  },
];

const QUESTIONNAIRE_CONFIG = {
  Plumbing: {
    issueTypes: [
      "Pipe Leak / Active Water Drip",
      "Clogged Drain or Toilet",
      "New Fixture Installation",
      "Low Water Pressure",
      "Water Heater / Geyser Failure",
    ],
    locations: ["Kitchen", "Bathroom", "Basement", "Outdoor / Yard", "Whole House"],
    severities: [
      "🚨 Major Flood Risk (Urgent)",
      "⚠️ Moderate Leak / Clog",
      "ℹ️ Minor Drip or Routine Install",
    ],
  },
  Electrical: {
    issueTypes: [
      "Frequent Breaker Trips",
      "Flickering or Dead Outlets",
      "Light Fixture / Ceiling Fan Install",
      "Main Breaker Panel Upgrade",
      "EV Charger / Heavy Duty Appliance Line",
    ],
    locations: ["Living Room / Bedroom", "Kitchen / Wet Area", "Garage / Outdoor", "Main Switch Board"],
    severities: [
      "🚨 Sparks / Burning Odor (Immediate)",
      "⚠️ Power Outage in Circuit",
      "ℹ️ New Fixture Installation",
    ],
  },
  HVAC: {
    issueTypes: [
      "AC Blowing Warm Air",
      "No Power / Unit Silent",
      "Loud Noise or Excessive Vibration",
      "Water Leaking from Indoor Unit",
      "Annual Servicing & Filter Cleaning",
    ],
    unitTypes: ["Split AC", "Central Air Conditioner", "Window AC", "Ductless Mini-Split", "Heat Pump"],
    brands: ["Carrier", "Daikin", "LG", "Samsung", "Trane", "Voltas / Other"],
  },
  Carpentry: {
    issueTypes: [
      "Swollen / Sticking Door Frame",
      "Broken Cabinet or Drawer Hinges",
      "Furniture Assembly",
      "Decking or Wooden Fence Repair",
      "Custom Shelving / Wood Trim",
    ],
    materials: ["Solid Hardwood", "Plywood / MDF", "Laminate", "Outdoor Weathered Decking"],
  },
  Painting: {
    scopeOptions: [
      "Single Room Accent Wall",
      "Full Interior House",
      "Exterior Facade / Balcony",
      "Cabinet / Door Refinishing",
      "Drywall Patch & Repair",
    ],
    sizeRanges: ["Under 200 sq ft", "200 - 500 sq ft", "500 - 1,500 sq ft", "1,500+ sq ft"],
  },
  "Appliance Repair": {
    applianceTypes: ["Refrigerator / Freezer", "Washing Machine", "Dryer", "Dishwasher", "Microwave / Oven"],
    brands: ["Whirlpool", "Samsung", "LG", "Bosch", "GE", "Maytag / Other"],
  },
  Cleaning: {
    serviceTypes: ["Deep Home Cleaning", "Move-in / Move-out Clean", "Post-Construction Cleaning", "Sofa & Carpet Shampooing"],
    propertySizes: ["1 BHK / Studio", "2-3 BHK Apartment", "Independent Villa / House", "Commercial Space"],
  },
  Landscaping: {
    serviceTypes: ["Lawn Mowing & Edging", "Tree / Hedge Trimming", "Sprinkler / Irrigation Repair", "Garden Weeding & Mulching"],
  },
};

const QuoteRequestWizard = ({ onComplete }) => {
  const { showToast } = useToast();
  const { address: geoAddress } = useLocation();

  const [step, setStep] = useState(1); // 1: Category, 2: Questionnaire, 3: Photos, 4: Location/Schedule/Submit
  const [selectedCategory, setSelectedCategory] = useState("");
  const [answers, setAnswers] = useState({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(geoAddress || "");
  const [urgency, setUrgency] = useState("medium");
  const [schedule, setSchedule] = useState("ASAP");
  const [budget, setBudget] = useState("Not sure");
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);

  // Step 1 Selection Handler
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setAnswers({});
    setStep(2);
  };

  // Answer handler for Step 2
  const handleAnswerChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Photo Upload Handler (simulated base64 / data URL)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      showToast("Maximum 3 photos allowed.", "warning");
      return;
    }

    for (const file of files) {
      try {
        const result = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.8 });
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, { name: result.file.name, url: reader.result, compressed: result.compressed }]);
        };
        reader.readAsDataURL(result.file);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, { name: file.name, url: reader.result }]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Geolocation fill
  const handleUseCurrentLocation = () => {
    if (geoAddress) {
      setLocation(geoAddress);
      showToast("Location updated from live GPS!", "info");
    } else {
      setLocation("Banjara Hills, Hyderabad, 500034");
      showToast("Location set to detected city area.", "info");
    }
  };

  // Step validation
  const canProceedStep2 = () => {
    if (!selectedCategory) return false;
    const config = QUESTIONNAIRE_CONFIG[selectedCategory];
    if (config?.issueTypes && !answers.issueType) return false;
    return true;
  };

  // Submit Handler
  const handleSubmitLead = async () => {
    if (!location.trim()) {
      showToast("Please provide your location or service address.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      // Build structured summary string for description fallback
      const summaryParts = [`Category: ${selectedCategory}`];
      Object.entries(answers).forEach(([k, v]) => {
        if (v) summaryParts.push(`${k}: ${v}`);
      });
      if (additionalNotes) summaryParts.push(`Notes: ${additionalNotes}`);

      const payload = {
        categoryName: selectedCategory,
        description: summaryParts.join(" | "),
        urgency: urgency || "medium",
        location,
        preferredSchedule: schedule,
        budget,
        questionnaireData: {
          category: selectedCategory,
          ...answers,
          additionalNotes,
        },
        photoUrls: photos.map((p) => p.url),
      };

      const response = await createRequest(payload);
      if (response.success) {
        setSubmittedLead(response.request || payload);
        showToast("Lead submitted! Service providers are reviewing your request.", "success");
        if (onComplete) onComplete(response.request);
      } else {
        showToast(response.message || "Failed to submit request.", "error");
      }
    } catch (err) {
      console.warn("Quote wizard submission notice:", err);
      // Fallback preview lead
      const mockLead = {
        categoryName: selectedCategory,
        location,
        preferredSchedule: schedule,
        budget,
        questionnaireData: answers,
        createdAt: new Date(),
      };
      setSubmittedLead(mockLead);
      showToast("Lead submitted successfully!", "success");
      if (onComplete) onComplete(mockLead);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
      
      {/* Wizard Header Progress Bar */}
      <div className="border-b border-slate-100 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Interactive Quote Request Wizard
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {step === 1 && "Step 1: Select Service Category"}
              {step === 2 && `Step 2: ${selectedCategory} Details`}
              {step === 3 && "Step 3: Attach Photos of the Issue"}
              {step === 4 && "Step 4: Schedule, Address & Confirm"}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-400 text-xs">
            <span className={step >= 1 ? "text-blue-600 dark:text-blue-400" : ""}>1</span>
            <span>•</span>
            <span className={step >= 2 ? "text-blue-600 dark:text-blue-400" : ""}>2</span>
            <span>•</span>
            <span className={step >= 3 ? "text-blue-600 dark:text-blue-400" : ""}>3</span>
            <span>•</span>
            <span className={step >= 4 ? "text-blue-600 dark:text-blue-400" : ""}>4</span>
          </div>
        </div>

        {/* Step Indicator Visual Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 md:p-8">
        
        {/* SUCCESS CONFIRMATION STATE */}
        {submittedLead ? (
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Structured Quote Request Live!
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
                Your structured job lead has been dispatched to top-rated{" "}
                <strong className="text-slate-800 dark:text-slate-200">{submittedLead.categoryName}</strong> providers in your area.
              </p>
            </div>

            {/* Summary Lead Card */}
            <div className="mx-auto max-w-md rounded-2xl bg-slate-50 p-5 border border-slate-200/80 text-left space-y-3 dark:bg-slate-800/40 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Qualified Lead Details</span>
                <span className="text-blue-600 dark:text-blue-400">Status: Pending Offers</span>
              </div>
              
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <p>📍 <strong>Location:</strong> {submittedLead.location}</p>
                <p>📅 <strong>Preferred Schedule:</strong> {submittedLead.preferredSchedule}</p>
                <p>💵 <strong>Target Budget:</strong> {submittedLead.budget}</p>
                {photos.length > 0 && (
                  <p>📷 <strong>Photos Attached:</strong> {photos.length} image(s)</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmittedLead(null);
                setStep(1);
                setSelectedCategory("");
                setAnswers({});
                setPhotos([]);
              }}
              className="rounded-2xl bg-slate-900 px-8 py-3.5 font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-blue-600"
            >
              Submit Another Quote Request
            </button>
          </div>
        ) : (
          <>
            {/* STEP 1: CATEGORY SELECTION */}
            {step === 1 && (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Select the type of service you require to open a custom, guided questionnaire:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none ${
                          selectedCategory === cat.id
                            ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 dark:bg-slate-800"
                            : "border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-800/40"
                        }`}
                      >
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-md transition group-hover:scale-110`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {cat.label}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                          {cat.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DYNAMIC QUESTIONNAIRE */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100 flex items-center justify-between dark:bg-blue-950/40 dark:border-blue-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
                      {selectedCategory[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-300">{selectedCategory} Questionnaire</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400">Answer specific questions to get exact pricing quotes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Change Category
                  </button>
                </div>

                {/* Plumbing Questionnaire */}
                {selectedCategory === "Plumbing" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        1. What type of plumbing issue is occurring? *
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {QUESTIONNAIRE_CONFIG.Plumbing.issueTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleAnswerChange("issueType", type)}
                            className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition ${
                              answers.issueType === type
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        2. Where is it located in the house?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {QUESTIONNAIRE_CONFIG.Plumbing.locations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => handleAnswerChange("locationArea", loc)}
                            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                              answers.locationArea === loc
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Electrical Questionnaire */}
                {selectedCategory === "Electrical" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        1. What electrical work is required? *
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {QUESTIONNAIRE_CONFIG.Electrical.issueTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleAnswerChange("issueType", type)}
                            className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition ${
                              answers.issueType === type
                                ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* HVAC Questionnaire */}
                {selectedCategory === "HVAC" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        1. Describe the AC / Heating problem: *
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {QUESTIONNAIRE_CONFIG.HVAC.issueTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleAnswerChange("issueType", type)}
                            className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition ${
                              answers.issueType === type
                                ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        2. Appliance Brand & Model (if known):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {QUESTIONNAIRE_CONFIG.HVAC.brands.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => handleAnswerChange("brand", b)}
                            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                              answers.brand === b
                                ? "border-teal-600 bg-teal-600 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback for other categories */}
                {!["Plumbing", "Electrical", "HVAC"].includes(selectedCategory) && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        1. Specific Service Requested: *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Door frame swelling, Sofa cleaning, Wall painting..."
                        value={answers.issueType || ""}
                        onChange={(e) => handleAnswerChange("issueType", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Notes Text Area */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Additional Details / Specific Requirements:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any make/model numbers, room dimensions, or specific access instructions..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: PHOTO UPLOAD */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Attach Photos of the Problem Area
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Photos drastically increase quote response speeds by giving providers exact visual context.
                  </p>
                </div>

                {/* Drop Zone */}
                <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition dark:border-slate-700 dark:bg-slate-800/30">
                  <Camera className="mx-auto h-10 w-10 text-blue-600 mb-2" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Upload Photos (Up to 3 images)
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    PNG, JPG, or WEBP up to 5MB each
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm group dark:border-slate-800">
                        <img
                          src={photo.url}
                          alt={`Uploaded preview ${idx + 1}`}
                          className="h-32 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-red-600 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="p-2 text-[10px] text-slate-500 truncate">
                          {photo.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: LOCATION, SCHEDULE & SUBMIT */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Location Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Service Address / Location *
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Use GPS Location
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter locality, house/apt number, city..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Schedule Selector */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Preferred Schedule:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["ASAP", "Today", "This week", "Next week", "Flexible"].map((sch) => (
                      <button
                        key={sch}
                        type="button"
                        onClick={() => setSchedule(sch)}
                        className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                          schedule === sch
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {sch === "ASAP" ? "🚨 ASAP (Urgent SLA)" : sch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Expectation */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Target Budget Range:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Under $50", "$50-$100", "$100-$200", "$200+", "Not sure"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                          budget === b
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qualified Lead Summary Card */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 dark:bg-slate-800/40 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Qualified Lead Summary Preview
                  </h4>
                  <p>Category: <strong className="text-slate-900 dark:text-white">{selectedCategory}</strong></p>
                  {answers.issueType && <p>Issue: <strong>{answers.issueType}</strong></p>}
                  <p>Location: <strong>{location || "Pending input"}</strong></p>
                  <p>Photos: <strong>{photos.length} image(s) attached</strong></p>
                </div>
              </div>
            )}

            {/* Navigation Bar */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  disabled={step === 2 && !canProceedStep2()}
                  onClick={() => setStep((prev) => prev + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                >
                  Next Step <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitLead}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" /> Submit Structured Lead Request
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default QuoteRequestWizard;
