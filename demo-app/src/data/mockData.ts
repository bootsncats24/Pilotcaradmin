// Mock data for demo - Expanded with full relationships

export const vehicles = [
  { id: "V-001", name: "Pilot Car 1", make: "Ford", model: "Explorer", year: 2018, plate: "PC-4729", isDefault: true },
  { id: "V-002", name: "Pilot Car 2", make: "Toyota", model: "RAV4", year: 2021, plate: "PC-1938", isDefault: false }
];

export const customers = [
  { id: "C-001", name: "High Desert Transport LLC", phone: "(760) 555-0123", email: "dispatch@highdeserttransport.com" },
  { id: "C-002", name: "OC Heavy Haul", phone: "(714) 555-0456", email: "operations@ocheavyhaul.com" },
  { id: "C-003", name: "West Valley Logistics", phone: "(818) 555-0789", email: "info@westvalleylogistics.com" },
  { id: "C-004", name: "Golden State Modular Movers", phone: "(310) 555-0321", email: "contact@goldenstatemovers.com" },
  { id: "C-005", name: "Sierra Oversize Carriers", phone: "(559) 555-0654", email: "dispatch@sierraoversize.com" }
];

export const destinations = [
  { id: "D-001", name: "Barstow, CA", address: "Barstow, CA", distance: 0 },
  { id: "D-002", name: "Palm Springs, CA", address: "Palm Springs, CA", distance: 120 },
  { id: "D-003", name: "Riverside, CA", address: "Riverside, CA", distance: 60 },
  { id: "D-004", name: "San Diego, CA", address: "San Diego, CA", distance: 120 },
  { id: "D-005", name: "Victorville, CA", address: "Victorville, CA", distance: 50 },
  { id: "D-006", name: "Bakersfield, CA", address: "Bakersfield, CA", distance: 150 },
  { id: "D-007", name: "Anaheim, CA", address: "Anaheim, CA", distance: 40 },
  { id: "D-008", name: "Long Beach, CA", address: "Long Beach, CA", distance: 30 },
  { id: "D-009", name: "Palm Desert, CA", address: "Palm Desert, CA", distance: 110 },
  { id: "D-010", name: "Needles, CA", address: "Needles, CA", distance: 180 },
  { id: "D-011", name: "Corona, CA", address: "Corona, CA", distance: 45 },
  { id: "D-012", name: "Ontario, CA", address: "Ontario, CA", distance: 35 }
];

export const categories = [
  { id: 1, name: "Fuel", description: "Gasoline and fuel expenses", is_system: true, color: "#ef4444" },
  { id: 2, name: "Lodging", description: "Hotel and accommodation expenses", is_system: true, color: "#3b82f6" },
  { id: 3, name: "Meals", description: "Food and dining expenses", is_system: true, color: "#10b981" },
  { id: 4, name: "Supplies", description: "General supplies and materials", is_system: true, color: "#f59e0b" },
  { id: 5, name: "Auto Membership", description: "AAA and other auto memberships", is_system: true, color: "#8b5cf6" },
  { id: 6, name: "Personal", description: "Personal expenses", is_system: true, color: "#6b7280" }
];

export const runs = [
  { id: "R-4001", customerId: "C-001", status: "Completed", startDate: "2026-01-12", endDate: "2026-01-12", rateType: "By Mile", estimatedTotal: 530, pickup: "Barstow, CA", delivery: "Palm Springs, CA", loadedMiles: 212, deadheadMiles: 118, ratePerMile: 2.50 },
  { id: "R-4002", customerId: "C-002", status: "Completed", startDate: "2026-01-18", endDate: "2026-01-18", rateType: "Mini Run", estimatedTotal: 250, pickup: "Riverside, CA", delivery: "San Diego, CA", loadedMiles: 88, deadheadMiles: 44 },
  { id: "R-4003", customerId: "C-003", status: "Completed", startDate: "2026-01-22", endDate: "2026-01-22", rateType: "By Mile", estimatedTotal: 436.80, pickup: "Victorville, CA", delivery: "Bakersfield, CA", loadedMiles: 168, deadheadMiles: 72, ratePerMile: 2.60 },
  { id: "R-4004", customerId: "C-004", status: "Completed", startDate: "2026-01-30", endDate: "2026-01-30", rateType: "Mini Run", estimatedTotal: 250, pickup: "Anaheim, CA", delivery: "Long Beach, CA", loadedMiles: 46, deadheadMiles: 60 },
  { id: "R-4005", customerId: "C-005", status: "Completed", startDate: "2026-02-04", endDate: "2026-02-05", rateType: "By Mile", estimatedTotal: 662.60, pickup: "Palm Desert, CA", delivery: "Needles, CA", loadedMiles: 184, deadheadMiles: 92, ratePerMile: 2.65, overnight: 175 },
  { id: "R-4006", customerId: "C-001", status: "Scheduled", startDate: "2026-02-08", endDate: "2026-02-08", rateType: "Mini Run", estimatedTotal: 250, pickup: "Corona, CA", delivery: "Ontario, CA", loadedMiles: 32, deadheadMiles: 18 }
];

export const invoices = [
  {
    id: "INV-2001",
    invoiceNumber: "2026-001",
    runId: "R-4001",
    customerName: "High Desert Transport LLC",
    pickup: "Barstow, CA",
    delivery: "Palm Springs, CA",
    runDate: "2026-01-12",
    billingType: "By Mile",
    loadedMiles: 212,
    deadheadMiles: 118,
    ratePerMile: 2.50,
    loadedTotal: 530.00,
    overnight: 0,
    extras: 0,
    total: 530.00,
    status: "Paid",
    issueDate: "2026-01-12",
    paidDate: "2026-01-20"
  },
  {
    id: "INV-2002",
    invoiceNumber: "2026-002",
    runId: "R-4002",
    customerName: "OC Heavy Haul",
    pickup: "Riverside, CA",
    delivery: "San Diego, CA",
    runDate: "2026-01-18",
    billingType: "Mini Run",
    loadedMiles: 88,
    deadheadMiles: 44,
    flatRate: 250,
    total: 250,
    status: "Paid",
    issueDate: "2026-01-18",
    paidDate: "2026-01-25"
  },
  {
    id: "INV-2003",
    invoiceNumber: "2026-003",
    runId: "R-4003",
    customerName: "West Valley Logistics",
    pickup: "Victorville, CA",
    delivery: "Bakersfield, CA",
    runDate: "2026-01-22",
    billingType: "By Mile",
    loadedMiles: 168,
    deadheadMiles: 72,
    ratePerMile: 2.60,
    loadedTotal: 436.80,
    overnight: 0,
    extras: 0,
    total: 436.80,
    status: "Paid",
    issueDate: "2026-01-22",
    paidDate: "2026-02-02"
  },
  {
    id: "INV-2004",
    invoiceNumber: "2026-004",
    runId: "R-4004",
    customerName: "Golden State Modular Movers",
    pickup: "Anaheim, CA",
    delivery: "Long Beach, CA",
    runDate: "2026-01-30",
    billingType: "Mini Run",
    loadedMiles: 46,
    deadheadMiles: 60,
    flatRate: 250,
    total: 250,
    status: "Overdue",
    issueDate: "2026-01-30",
    paidDate: undefined
  },
  {
    id: "INV-2005",
    invoiceNumber: "2026-005",
    runId: "R-4005",
    customerName: "Sierra Oversize Carriers",
    pickup: "Palm Desert, CA",
    delivery: "Needles, CA",
    runDate: "2026-02-04",
    billingType: "By Mile",
    loadedMiles: 184,
    deadheadMiles: 92,
    ratePerMile: 2.65,
    loadedTotal: 487.60,
    overnight: 175,
    extras: 0,
    total: 662.60,
    status: "Sent",
    issueDate: "2026-02-04",
    paidDate: undefined
  },
  {
    id: "INV-2006",
    invoiceNumber: "2026-006",
    runId: "R-4006",
    customerName: "High Desert Transport LLC",
    pickup: "Corona, CA",
    delivery: "Ontario, CA",
    runDate: "2026-02-08",
    billingType: "Mini Run",
    loadedMiles: 32,
    deadheadMiles: 18,
    flatRate: 250,
    total: 250,
    status: "Draft",
    issueDate: "2026-02-08",
    paidDate: undefined
  }
];

export const mileage = [
  // Business miles for runs
  { id: "M-6001", date: "2026-01-12", vehicleId: "V-001", miles: 330, classification: "Business", runId: "R-4001" }, // 212 loaded + 118 deadhead
  { id: "M-6002", date: "2026-01-18", vehicleId: "V-001", miles: 132, classification: "Business", runId: "R-4002" }, // 88 loaded + 44 deadhead
  { id: "M-6003", date: "2026-01-22", vehicleId: "V-001", miles: 240, classification: "Business", runId: "R-4003" }, // 168 loaded + 72 deadhead
  { id: "M-6004", date: "2026-01-30", vehicleId: "V-001", miles: 106, classification: "Business", runId: "R-4004" }, // 46 loaded + 60 deadhead (Mini Run)
  { id: "M-6005", date: "2026-02-04", vehicleId: "V-001", miles: 276, classification: "Business", runId: "R-4005" }, // 184 loaded + 92 deadhead
  { id: "M-6006", date: "2026-02-08", vehicleId: "V-001", miles: 50, classification: "Business", runId: "R-4006" }, // 32 loaded + 18 deadhead (Mini Run)
  // Additional business miles
  { id: "M-6007", date: "2026-01-15", vehicleId: "V-001", miles: 45, classification: "Business", runId: null },
  { id: "M-6008", date: "2026-01-20", vehicleId: "V-001", miles: 28, classification: "Personal", runId: null },
  { id: "M-6009", date: "2026-01-25", vehicleId: "V-001", miles: 156, classification: "Business", runId: null },
  { id: "M-6010", date: "2026-02-01", vehicleId: "V-001", miles: 92, classification: "Business", runId: null },
  { id: "M-6011", date: "2026-02-09", vehicleId: "V-001", miles: 67, classification: "Personal", runId: null },
  { id: "M-6012", date: "2026-02-10", vehicleId: "V-001", miles: 203, classification: "Business", runId: null },
  { id: "M-6013", date: "2026-02-12", vehicleId: "V-001", miles: 134, classification: "Business", runId: null },
  { id: "M-6014", date: "2026-01-16", vehicleId: "V-002", miles: 89, classification: "Business", runId: null },
  { id: "M-6015", date: "2026-01-18", vehicleId: "V-002", miles: 112, classification: "Business", runId: null },
  { id: "M-6016", date: "2026-01-24", vehicleId: "V-002", miles: 178, classification: "Business", runId: null },
  { id: "M-6017", date: "2026-01-26", vehicleId: "V-002", miles: 56, classification: "Personal", runId: null },
  { id: "M-6018", date: "2026-01-28", vehicleId: "V-002", miles: 145, classification: "Business", runId: null },
  { id: "M-6019", date: "2026-02-05", vehicleId: "V-002", miles: 112, classification: "Business", runId: null },
  { id: "M-6020", date: "2026-02-10", vehicleId: "V-002", miles: 78, classification: "Business", runId: null }
];

export const expenses = [
  { id: "T-8001", date: "2025-12-12", vendor: "Chevron", amount: 82.33, category: "Fuel", runId: "R-4001" },
  { id: "T-8002", date: "2025-12-18", vendor: "Chevron", amount: 95.21, category: "Fuel", runId: "R-4002" },
  { id: "T-8003", date: "2026-01-06", vendor: "Hampton Inn", amount: 134.00, category: "Lodging", runId: "R-4004" },
  { id: "T-8004", date: "2026-01-06", vendor: "Del Taco", amount: 17.85, category: "Meals", runId: "R-4004" },
  { id: "T-8005", date: "2026-01-22", vendor: "Shell", amount: 74.22, category: "Fuel", runId: "R-4006" },
  { id: "T-8006", date: "2026-01-31", vendor: "AAA", amount: 12.99, category: "Auto Membership" },
  { id: "T-8007", date: "2026-02-02", vendor: "Walmart", amount: 41.19, category: "Supplies" },
  { id: "T-8008", date: "2026-02-08", vendor: "Stater Bros", amount: 68.00, category: "Personal" }
];

export const bills = [
  { id: "B-9001", name: "Commercial Auto Insurance", amount: 152, frequency: "Monthly", dueDate: "2026-02-28" },
  { id: "B-9002", name: "Vehicle Payment", amount: 618, frequency: "Monthly", dueDate: "2026-02-20" },
  { id: "B-9003", name: "Phone Plan", amount: 78, frequency: "Monthly", dueDate: "2026-02-16" },
  { id: "B-9004", name: "Fuel Card Fee", amount: 10, frequency: "Monthly", dueDate: "2026-02-15" },
  { id: "B-9005", name: "Web Hosting", amount: 20, frequency: "Monthly", dueDate: "2026-02-12" }
];

// Helper function to show demo message
export function showDemoMessage() {
  alert("This is a demo. Saving, syncing, and OCR are available in the full app.");
}
