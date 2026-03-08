import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calculator,
  CheckCircle2,
  Factory,
  Home,
  Info,
  Layers,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useActor } from "../hooks/useActor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaterialData {
  name: string;
  unit: string;
  quantity_per_sqft: number;
  unit_price: number;
  total_cost_for_project: number;
}

interface EstimateResult {
  standard_cost: number;
  premium_cost: number;
  luxury_cost: number;
  materials: MaterialData[];
  isFallback?: boolean;
}

type PropertyType = "residential" | "commercial" | "industrial";

// ─── All Indian Cities ────────────────────────────────────────────────────────

const ALL_INDIAN_CITIES = [
  "Agartala",
  "Agra",
  "Ahmedabad",
  "Ahmednagar",
  "Ajmer",
  "Akbarpur",
  "Akola",
  "Aligarh",
  "Allahabad",
  "Alwar",
  "Amravati",
  "Amritsar",
  "Ambattur",
  "Asansol",
  "Aurangabad",
  "Avadi",
  "Aizawl",
  "Bangalore",
  "Bareilly",
  "Bardhaman",
  "Bathinda",
  "Bellary",
  "Bhagalpur",
  "Bhatpara",
  "Bhilai",
  "Bhilwara",
  "Bhimavaram",
  "Bhiwandi",
  "Bhopal",
  "Bhubanewar",
  "Bijapur",
  "Bikaner",
  "Bilaspur",
  "Bokaro Steel City",
  "Brahmapur",
  "Chandigarh",
  "Chandrapur",
  "Chennai",
  "Coimbatore",
  "Cuttack",
  "Dadra",
  "Daman",
  "Davangere",
  "Dehradun",
  "Delhi",
  "Dhanbad",
  "Dhule",
  "Dindori",
  "Dispur",
  "Diu",
  "Durgapur",
  "Faridabad",
  "Firozabad",
  "Gangtok",
  "Gaya",
  "Ghaziabad",
  "Gopalpur",
  "Gorakhpur",
  "Gulbarga",
  "Guntur",
  "Guwahati",
  "Gwalior",
  "Howrah",
  "Hubballi-Dharwad",
  "Hyderabad",
  "Ichalkaranji",
  "Imphal",
  "Indore",
  "Itanagar",
  "Jabalpur",
  "Jaipur",
  "Jalgaon",
  "Jalandhar",
  "Jammu",
  "Jamnagar",
  "Jamshedpur",
  "Jhansi",
  "Jodhpur",
  "Junagadh",
  "Kadapa",
  "Kalyan-Dombivali",
  "Kamarhati",
  "Kanpur",
  "Karimnagar",
  "Karnal",
  "Kavaratti",
  "Kharagpur",
  "Kochi",
  "Kohima",
  "Kolhapur",
  "Kolkata",
  "Kollam",
  "Korba",
  "Kota",
  "Kozhikode",
  "Kulti",
  "Kurnool",
  "Latur",
  "Loni",
  "Lucknow",
  "Ludhiana",
  "Madurai",
  "Malegaon",
  "Mangaluru",
  "Mathura",
  "Meerut",
  "Modinagar",
  "Moradabad",
  "Mumbai",
  "Muzaffarnagar",
  "Muzaffarpur",
  "Mysuru",
  "Nagpur",
  "Nagercoil",
  "Nanded",
  "Nashik",
  "Navi Mumbai",
  "Nellore",
  "Nizamabad",
  "Noida",
  "Panaji",
  "Panihati",
  "Panipat",
  "Parbhani",
  "Patna",
  "Patiala",
  "Pimpri-Chinchwad",
  "Pondicherry",
  "Port Blair",
  "Pune",
  "Raipur",
  "Rajahmundry",
  "Rajkot",
  "Rajpur Sonarpur",
  "Rampur",
  "Ranchi",
  "Rohtak",
  "Rourkela",
  "Saharanpur",
  "Salem",
  "Sambalpur",
  "Satara",
  "Shahjahanpur",
  "Shambhajinagar",
  "Shillong",
  "Shimoga",
  "Silvassa",
  "Siliguri",
  "Solapur",
  "South Dumdum",
  "Srinagar",
  "Surat",
  "Thane",
  "Thiruvananthapuram",
  "Thrissur",
  "Tirunelveli",
  "Tiruchirappalli",
  "Tiruppur",
  "Tumkur",
  "Ujjain",
  "Ulhasnagar",
  "Vadodara",
  "Varanasi",
  "Vasai-Virar",
  "Vijayawada",
  "Visakhapatnam",
  "Warangal",
].sort();

// ─── Fallback Data Generator ──────────────────────────────────────────────────

const CITY_COST_MULTIPLIERS: Record<string, number> = {
  Mumbai: 1.45,
  Delhi: 1.35,
  Bangalore: 1.3,
  Hyderabad: 1.2,
  Chennai: 1.25,
  Kolkata: 1.1,
  Pune: 1.22,
  Ahmedabad: 1.05,
  Surat: 1.08,
  Noida: 1.18,
  "Navi Mumbai": 1.4,
  Thane: 1.35,
  Gurgaon: 1.3,
  Chandigarh: 1.15,
  Kochi: 1.18,
  Coimbatore: 1.12,
};

function getCityMultiplier(city: string): number {
  return CITY_COST_MULTIPLIERS[city] ?? 1.0;
}

const PROPERTY_TYPE_MULTIPLIERS: Record<
  PropertyType,
  { standard: number; premium: number; luxury: number }
> = {
  residential: { standard: 1800, premium: 2800, luxury: 4500 },
  commercial: { standard: 2200, premium: 3500, luxury: 5500 },
  industrial: { standard: 1600, premium: 2500, luxury: 4000 },
};

const BASE_MATERIALS: Array<{
  name: string;
  unit: string;
  qty_per_sqft: number;
  base_unit_price: number;
}> = [
  {
    name: "Cement",
    unit: "bags (50kg)",
    qty_per_sqft: 0.4,
    base_unit_price: 390,
  },
  {
    name: "River Sand",
    unit: "cubic ft",
    qty_per_sqft: 1.2,
    base_unit_price: 65,
  },
  {
    name: "Aggregate/Gravel",
    unit: "cubic ft",
    qty_per_sqft: 2.1,
    base_unit_price: 48,
  },
  {
    name: "Steel/TMT Bars",
    unit: "kg",
    qty_per_sqft: 4.5,
    base_unit_price: 68,
  },
  {
    name: "Bricks/Blocks",
    unit: "pieces",
    qty_per_sqft: 8.0,
    base_unit_price: 9,
  },
  {
    name: "Electrical Wiring",
    unit: "meters",
    qty_per_sqft: 2.5,
    base_unit_price: 45,
  },
  {
    name: "Plumbing Pipes",
    unit: "meters",
    qty_per_sqft: 0.8,
    base_unit_price: 185,
  },
  {
    name: "Tiles/Flooring",
    unit: "sq ft",
    qty_per_sqft: 1.1,
    base_unit_price: 85,
  },
  {
    name: "Paint (Interior)",
    unit: "liters",
    qty_per_sqft: 0.35,
    base_unit_price: 140,
  },
  {
    name: "Wood/Timber",
    unit: "cubic ft",
    qty_per_sqft: 0.12,
    base_unit_price: 1800,
  },
  {
    name: "Doors & Windows",
    unit: "units",
    qty_per_sqft: 0.015,
    base_unit_price: 12000,
  },
  {
    name: "Waterproofing",
    unit: "sq ft",
    qty_per_sqft: 0.3,
    base_unit_price: 35,
  },
  {
    name: "Glass Panels",
    unit: "sq ft",
    qty_per_sqft: 0.08,
    base_unit_price: 220,
  },
  {
    name: "Reinforcement Mesh",
    unit: "kg",
    qty_per_sqft: 0.5,
    base_unit_price: 72,
  },
  {
    name: "POP/Plaster",
    unit: "sq ft",
    qty_per_sqft: 2.0,
    base_unit_price: 22,
  },
  {
    name: "Labor Charges",
    unit: "sq ft",
    qty_per_sqft: 1.0,
    base_unit_price: 450,
  },
];

function generateFallbackEstimate(
  city: string,
  propertyType: PropertyType,
  sqft: number,
): EstimateResult {
  const cityMultiplier = getCityMultiplier(city);
  const tiers = PROPERTY_TYPE_MULTIPLIERS[propertyType];

  const materials: MaterialData[] = BASE_MATERIALS.map((m) => {
    const adjustedPrice = Math.round(m.base_unit_price * cityMultiplier);
    const quantity = Number.parseFloat((m.qty_per_sqft * sqft).toFixed(2));
    return {
      name: m.name,
      unit: m.unit,
      quantity_per_sqft: m.qty_per_sqft,
      unit_price: adjustedPrice,
      total_cost_for_project: Math.round(quantity * adjustedPrice),
    };
  });

  return {
    standard_cost: Math.round(tiers.standard * cityMultiplier),
    premium_cost: Math.round(tiers.premium * cityMultiplier),
    luxury_cost: Math.round(tiers.luxury * cityMultiplier),
    materials,
    isFallback: true,
  };
}

function parseGeminiResponse(
  raw: string,
  city: string,
  propertyType: PropertyType,
  sqft: number,
): EstimateResult {
  try {
    // Try to find JSON in the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]) as {
      standard_cost?: number;
      premium_cost?: number;
      luxury_cost?: number;
      materials?: Array<{
        name?: string;
        unit?: string;
        quantity_per_sqft?: number;
        unit_price?: number;
        total_cost_for_project?: number;
      }>;
    };

    if (
      !parsed.standard_cost ||
      !parsed.premium_cost ||
      !parsed.luxury_cost ||
      !parsed.materials?.length
    ) {
      throw new Error("Invalid structure");
    }

    const materials: MaterialData[] = parsed.materials.map((m) => ({
      name: m.name ?? "Unknown",
      unit: m.unit ?? "units",
      quantity_per_sqft: m.quantity_per_sqft ?? 0,
      unit_price: m.unit_price ?? 0,
      total_cost_for_project: m.total_cost_for_project ?? 0,
    }));

    return {
      standard_cost: parsed.standard_cost,
      premium_cost: parsed.premium_cost,
      luxury_cost: parsed.luxury_cost,
      materials,
    };
  } catch {
    return generateFallbackEstimate(city, propertyType, sqft);
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

function formatINRFull(val: number): string {
  return `₹${val.toLocaleString("en-IN")}`;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-gold-dim/40 rounded-md p-3 shadow-gold text-xs">
      <p className="text-gold-bright font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-foreground/70">{p.name}:</span>
          <span className="text-foreground font-medium">
            {formatINR(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConstructionCostPage() {
  const { actor } = useActor();

  // Form state
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [propertyType, setPropertyType] = useState<PropertyType>("residential");
  const [sqft, setSqft] = useState("");
  const [floors, setFloors] = useState("1");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Results state
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCities = ALL_INDIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(cityQuery.toLowerCase()),
  );

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCityQuery(city);
    setShowCityDropdown(false);
  };

  const handleEstimate = async () => {
    if (!selectedCity) {
      setError("Please select a city.");
      return;
    }
    const sqftNum = Number.parseInt(sqft, 10);
    if (!sqft || Number.isNaN(sqftNum) || sqftNum < 100) {
      setError("Please enter a valid area (minimum 100 sq ft).");
      return;
    }
    const floorsVal = Number.parseInt(floors, 10);
    if (!floors || Number.isNaN(floorsVal) || floorsVal < 1 || floorsVal > 50) {
      setError("Please enter a valid number of floors (1–50).");
      return;
    }

    setError(null);
    setEstimate(null);
    setIsLoading(true);

    const effectiveSqft = sqftNum * floorsVal;

    try {
      let result: EstimateResult;

      if (actor) {
        try {
          const rawResponse = await actor.getConstructionEstimate(
            selectedCity,
            propertyType,
            BigInt(effectiveSqft),
            "AIzaSyC-placeholder-use-env",
          );
          result = parseGeminiResponse(
            rawResponse,
            selectedCity,
            propertyType,
            effectiveSqft,
          );
        } catch {
          result = generateFallbackEstimate(
            selectedCity,
            propertyType,
            effectiveSqft,
          );
        }
      } else {
        result = generateFallbackEstimate(
          selectedCity,
          propertyType,
          effectiveSqft,
        );
      }

      setEstimate(result);
    } catch {
      setError("Failed to generate estimate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sqftNum = Number.parseInt(sqft, 10) || 0;
  const floorsNum = Math.max(1, Number.parseInt(floors, 10) || 1);

  // Effective total area = sqft per floor × number of floors
  const effectiveTotalSqft = sqftNum * floorsNum;

  // Prepare chart data (top 8 materials by total cost)
  const chartData = estimate
    ? [...estimate.materials]
        .sort((a, b) => b.total_cost_for_project - a.total_cost_for_project)
        .slice(0, 8)
        .map((m) => ({
          name: m.name.replace(/\//g, "/").split(" ")[0],
          fullName: m.name,
          Standard: Math.round(m.total_cost_for_project * 0.8),
          Premium: m.total_cost_for_project,
          Luxury: Math.round(m.total_cost_for_project * 1.6),
        }))
    : [];

  const totalMaterialCost = estimate
    ? estimate.materials.reduce((sum, m) => sum + m.total_cost_for_project, 0)
    : 0;

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      {/* Hero Header */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="absolute inset-0 bg-deco-pattern opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-dim" />
              <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                AI-Powered Tool
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-dim" />
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Construction{" "}
              <span className="text-gold-bright">Cost Estimator</span>
            </h1>
            <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
              Get AI-powered construction cost estimates with live Indian market
              prices for any city. Standard, Premium & Luxury tiers with
              detailed material breakdowns.
            </p>
          </motion.div>

          {/* ─── INPUT FORM ─── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card
              className="card-gold-border bg-card max-w-4xl mx-auto"
              data-ocid="cost-estimator.panel"
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="font-display text-xl text-foreground flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-gold-mid" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* City Selector */}
                  <div className="md:col-span-1">
                    <Label className="text-foreground/80 text-sm font-medium mb-2 block">
                      <MapPin className="w-3.5 h-3.5 inline mr-1 text-gold-mid" />
                      City / Location
                    </Label>
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <input
                          type="text"
                          value={cityQuery}
                          onChange={(e) => {
                            setCityQuery(e.target.value);
                            setSelectedCity("");
                            setShowCityDropdown(true);
                          }}
                          onFocus={() => setShowCityDropdown(true)}
                          onBlur={() =>
                            setTimeout(() => setShowCityDropdown(false), 200)
                          }
                          placeholder="Search city..."
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-input border border-border rounded-md text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-gold-mid/40 focus:border-gold-mid/60 transition-all"
                          data-ocid="cost-estimator.search_input"
                        />
                      </div>
                      <AnimatePresence>
                        {showCityDropdown && filteredCities.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-gold-dim/30 rounded-md shadow-gold-lg max-h-56 overflow-y-auto"
                            data-ocid="cost-estimator.dropdown_menu"
                          >
                            {filteredCities.map((city) => (
                              <button
                                key={city}
                                type="button"
                                onMouseDown={() => handleCitySelect(city)}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gold-mid/10 hover:text-gold-bright ${
                                  selectedCity === city
                                    ? "bg-gold-mid/15 text-gold-bright"
                                    : "text-foreground/80"
                                }`}
                              >
                                {city}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {selectedCity && (
                      <p className="text-gold-dim text-xs mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {selectedCity} selected
                      </p>
                    )}
                  </div>

                  {/* Property Type */}
                  <div className="md:col-span-1">
                    <Label className="text-foreground/80 text-sm font-medium mb-3 block">
                      <Building2 className="w-3.5 h-3.5 inline mr-1 text-gold-mid" />
                      Property Type
                    </Label>
                    <RadioGroup
                      value={propertyType}
                      onValueChange={(v) => setPropertyType(v as PropertyType)}
                      className="space-y-2"
                      data-ocid="cost-estimator.radio"
                    >
                      {[
                        {
                          value: "residential",
                          label: "Residential",
                          icon: Home,
                        },
                        {
                          value: "commercial",
                          label: "Commercial",
                          icon: Building2,
                        },
                        {
                          value: "industrial",
                          label: "Industrial",
                          icon: Factory,
                        },
                      ].map(({ value, label, icon: Icon }) => (
                        <div key={value} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={value}
                            id={`ptype-${value}`}
                            className="border-gold-dim/60 text-gold-mid focus:ring-gold-mid/40"
                            data-ocid="cost-estimator.radio"
                          />
                          <label
                            htmlFor={`ptype-${value}`}
                            className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer hover:text-foreground transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-gold-mid" />
                            {label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Area Input */}
                  <div className="md:col-span-1">
                    <Label
                      htmlFor="sqft-input"
                      className="text-foreground/80 text-sm font-medium mb-2 block"
                    >
                      Area (Square Feet)
                    </Label>
                    <div className="relative">
                      <input
                        id="sqft-input"
                        type="number"
                        min="100"
                        max="1000000"
                        value={sqft}
                        onChange={(e) => setSqft(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full px-3 py-2.5 text-sm bg-input border border-border rounded-md text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-gold-mid/40 focus:border-gold-mid/60 transition-all"
                        data-ocid="cost-estimator.input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/40">
                        sq ft
                      </span>
                    </div>
                    {sqftNum > 0 && (
                      <p className="text-foreground/50 text-xs mt-1.5">
                        ≈ {(sqftNum / 10.764).toFixed(1)} sq meters
                      </p>
                    )}
                  </div>

                  {/* Number of Floors */}
                  <div className="md:col-span-1">
                    <Label
                      htmlFor="floors-input"
                      className="text-foreground/80 text-sm font-medium mb-2 block"
                    >
                      <Layers className="w-3.5 h-3.5 inline mr-1 text-gold-mid" />
                      Number of Floors
                    </Label>
                    <div className="relative">
                      <input
                        id="floors-input"
                        type="number"
                        min="1"
                        max="50"
                        value={floors}
                        onChange={(e) => setFloors(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full px-3 py-2.5 text-sm bg-input border border-border rounded-md text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-gold-mid/40 focus:border-gold-mid/60 transition-all"
                        data-ocid="cost-estimator.input"
                      />
                    </div>
                    <p className="text-foreground/50 text-xs mt-1.5">
                      ≈ {floorsNum} floor(s) total
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                    data-ocid="cost-estimator.error_state"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <div className="mt-6 flex items-center gap-4">
                  <Button
                    onClick={handleEstimate}
                    disabled={isLoading}
                    className="btn-gold px-8 py-5 text-base rounded-sm font-semibold"
                    data-ocid="cost-estimator.primary_button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Analyzing prices for {selectedCity || "your city"}...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Get AI Estimate
                      </>
                    )}
                  </Button>
                  <p className="text-foreground/40 text-xs flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    AI-estimated from current Indian market rates
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ─── LOADING ─── */}
      <AnimatePresence>
        {isLoading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
            data-ocid="cost-estimator.loading_state"
          >
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-gold-dim/20 border-t-gold-mid animate-spin" />
                <Calculator className="absolute inset-0 m-auto w-8 h-8 text-gold-mid" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium text-lg">
                  Analyzing prices for{" "}
                  <span className="text-gold-bright">{selectedCity}</span>
                  {" · "}
                  <span className="text-gold-mid">{floorsNum} floor(s)</span>
                </p>
                <p className="text-foreground/50 text-sm mt-1">
                  Fetching live construction cost data via AI...
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── RESULTS ─── */}
      <AnimatePresence>
        {estimate && !isLoading && (
          <motion.section
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
            data-ocid="cost-estimator.section"
          >
            {/* Fallback Notice */}
            {estimate.isFallback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 p-3 rounded-md bg-gold-mid/10 border border-gold-dim/30 text-foreground/70 text-sm"
                data-ocid="cost-estimator.toast"
              >
                <Info className="w-4 h-4 text-gold-mid shrink-0" />
                Showing estimated data based on market averages. Live AI data
                temporarily unavailable.
              </motion.div>
            )}

            {/* Summary Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                  Estimate for{" "}
                  <span className="text-gold-bright">{selectedCity}</span>
                </h2>
                <Badge className="bg-gold-mid/20 text-gold-bright border-gold-dim/40 capitalize">
                  {propertyType}
                </Badge>
                <Badge className="bg-muted text-foreground/60 border-border">
                  {sqftNum.toLocaleString("en-IN")} sq ft
                </Badge>
                <Badge className="bg-muted text-foreground/60 border-border flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {floorsNum} Floor(s)
                </Badge>
              </div>
              <div className="gold-divider" />
            </div>

            {/* ─── 3 TIER PRICE CARDS ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {[
                {
                  tier: "Standard",
                  cost_per_sqft: estimate.standard_cost,
                  accent: "from-emerald-900/30 to-emerald-950/10",
                  border: "border-emerald-500/30",
                  badgeColor:
                    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  labelColor: "text-emerald-400",
                  icon: "🏗️",
                  desc: "Basic finishes, standard materials",
                },
                {
                  tier: "Premium",
                  cost_per_sqft: estimate.premium_cost,
                  accent: "from-gold-dim/20 to-card",
                  border: "border-gold-dim/50",
                  badgeColor:
                    "bg-gold-mid/20 text-gold-bright border-gold-dim/40",
                  labelColor: "text-gold-bright",
                  icon: "🏛️",
                  desc: "Quality finishes, branded materials",
                },
                {
                  tier: "Luxury",
                  cost_per_sqft: estimate.luxury_cost,
                  accent: "from-purple-900/30 to-purple-950/10",
                  border: "border-purple-500/30",
                  badgeColor:
                    "bg-purple-500/20 text-purple-300 border-purple-500/30",
                  labelColor: "text-purple-300",
                  icon: "🏰",
                  desc: "Premium finishes, imported materials",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.tier}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  data-ocid={`cost-estimator.item.${idx + 1}`}
                >
                  <Card
                    className={`bg-gradient-to-b ${item.accent} border ${item.border} h-full`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">{item.icon}</span>
                        <Badge
                          className={`text-xs font-semibold ${item.badgeColor}`}
                        >
                          {item.tier}
                        </Badge>
                      </div>
                      <p className="text-foreground/50 text-xs mb-3">
                        {item.desc}
                      </p>
                      <p
                        className={`font-display text-3xl font-bold ${item.labelColor} mb-1`}
                      >
                        {formatINR(item.cost_per_sqft * effectiveTotalSqft)}
                      </p>
                      <p className="text-foreground/60 text-sm">
                        Total Estimated Cost
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/50">Per sq ft</span>
                          <span className={`font-semibold ${item.labelColor}`}>
                            ₹{item.cost_per_sqft.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex flex-col text-sm mt-1 gap-0.5">
                          <span className="text-foreground/50">Area</span>
                          <span className="text-foreground/70 text-xs text-right">
                            {sqftNum.toLocaleString("en-IN")} sq ft ×{" "}
                            {floorsNum} floor(s) ={" "}
                            {effectiveTotalSqft.toLocaleString("en-IN")} sq ft
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* ─── TWO COLUMN LAYOUT ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* LEFT: Chart */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card
                  className="card-gold-border bg-card h-full"
                  data-ocid="cost-estimator.card"
                >
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-gold-mid" />
                      Raw Material Cost Breakdown
                      <span className="text-foreground/40 text-sm font-normal ml-auto">
                        Top 8 materials
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-6">
                    <ResponsiveContainer width="100%" height={380}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 16, left: 8, bottom: 60 }}
                        data-ocid="cost-estimator.chart_point"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(0.28 0.04 240 / 0.4)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "oklch(0.65 0.03 240)", fontSize: 11 }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                          height={60}
                          axisLine={{ stroke: "oklch(0.28 0.04 240)" }}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => formatINR(v as number)}
                          tick={{ fill: "oklch(0.65 0.03 240)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={72}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend
                          wrapperStyle={{
                            fontSize: 12,
                            color: "oklch(0.65 0.03 240)",
                          }}
                        />
                        <Bar
                          dataKey="Standard"
                          fill="oklch(0.55 0.14 145)"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={28}
                        />
                        <Bar
                          dataKey="Premium"
                          fill="oklch(0.74 0.12 75)"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={28}
                        />
                        <Bar
                          dataKey="Luxury"
                          fill="oklch(0.62 0.18 300)"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* RIGHT: Material Table */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card
                  className="card-gold-border bg-card h-full"
                  data-ocid="cost-estimator.table"
                >
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-gold-mid" />
                      Material Quantity & Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="overflow-x-auto">
                      <table
                        className="w-full text-sm"
                        data-ocid="cost-estimator.table"
                      >
                        <thead>
                          <tr className="border-b border-gold-dim/20">
                            <th className="text-left py-3 px-4 text-gold-mid font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                              Material
                            </th>
                            <th className="text-right py-3 px-3 text-gold-mid font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                              Unit
                            </th>
                            <th className="text-right py-3 px-3 text-gold-mid font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                              Quantity
                            </th>
                            <th className="text-right py-3 px-3 text-gold-mid font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                              Per Unit
                            </th>
                            <th className="text-right py-3 px-4 text-gold-mid font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                              Total Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {estimate.materials.map((m, idx) => (
                            <tr
                              key={m.name}
                              className="border-b border-border/40 hover:bg-gold-mid/3 transition-colors"
                              data-ocid={`cost-estimator.row.${idx + 1}`}
                            >
                              <td className="py-3 px-4 text-foreground/80 font-medium text-xs whitespace-nowrap">
                                {m.name}
                              </td>
                              <td className="py-3 px-3 text-foreground/50 text-xs text-right whitespace-nowrap">
                                {m.unit}
                              </td>
                              <td className="py-3 px-3 text-foreground/70 text-xs text-right tabular-nums">
                                {(
                                  m.quantity_per_sqft * effectiveTotalSqft
                                ).toFixed(1)}
                              </td>
                              <td className="py-3 px-3 text-foreground/70 text-xs text-right tabular-nums whitespace-nowrap">
                                {formatINRFull(m.unit_price)}
                              </td>
                              <td className="py-3 px-4 text-foreground font-semibold text-xs text-right tabular-nums whitespace-nowrap">
                                {formatINR(m.total_cost_for_project)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gold-mid/10 border-t-2 border-gold-dim/50">
                            <td
                              colSpan={4}
                              className="py-4 px-4 text-gold-bright font-bold text-sm"
                            >
                              Grand Total (Materials)
                            </td>
                            <td className="py-4 px-4 text-gold-bright font-bold text-sm text-right tabular-nums whitespace-nowrap">
                              {formatINR(totalMaterialCost)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Bottom Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                {
                  label: "Materials (Standard)",
                  value: formatINR(totalMaterialCost * 0.8),
                  sub: "Raw material cost",
                },
                {
                  label: "Labor & Overhead",
                  value: formatINR(
                    estimate.standard_cost * effectiveTotalSqft * 0.25,
                  ),
                  sub: "Approx 25% of project",
                },
                {
                  label: "Contingency (10%)",
                  value: formatINR(
                    estimate.standard_cost * effectiveTotalSqft * 0.1,
                  ),
                  sub: "Buffer for unforeseen costs",
                },
              ].map((item, _idx) => (
                <Card
                  key={item.label}
                  className="card-gold-border bg-card"
                  data-ocid="cost-estimator.card"
                >
                  <CardContent className="p-5">
                    <p className="text-foreground/50 text-xs mb-1">
                      {item.label}
                    </p>
                    <p className="text-gold-bright font-display text-xl font-bold">
                      {item.value}
                    </p>
                    <p className="text-foreground/40 text-xs mt-1">
                      {item.sub}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Disclaimer */}
            <p className="text-center text-foreground/30 text-xs mt-8 max-w-2xl mx-auto">
              * Estimates are indicative based on current market rates and AI
              analysis. Actual costs may vary based on site conditions, material
              availability, and contractor rates. Consult a qualified civil
              engineer for precise quotations.
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Empty state when no results yet */}
      {!estimate && !isLoading && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
          data-ocid="cost-estimator.empty_state"
        >
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gold-mid/10 border border-gold-dim/20 flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-10 h-10 text-gold-mid/60" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground/60 mb-2">
              Ready to estimate
            </h3>
            <p className="text-foreground/40 text-sm max-w-md mx-auto">
              Select your city, property type, and area above, then click "Get
              AI Estimate" to see detailed construction cost breakdown.
            </p>
          </div>
        </motion.section>
      )}
    </main>
  );
}
