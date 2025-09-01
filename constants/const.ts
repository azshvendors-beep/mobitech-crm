import { z } from "zod";

export const BANK_NAMES = [
  "AIRTEL PAYMENTS BANK",
  "AU SMALL FINANCE BANK",
  "AXIS BANK",
  "BANDHAN BANK",
  "BANK OF BARODA",
  "BANK OF INDIA",
  "BANK OF MAHARASHTRA",
  "CANARA BANK",
  "CATHOLIC SYRIAN BANK",
  "CENTRAL BANK OF INDIA",
  "CITY UNION BANK",
  "CSB BANK",
  "DCB BANK",
  "DHANLAXMI BANK",
  "EQUITAS SMALL FINANCE BANK",
  "FEDERAL BANK",
  "HDFC BANK",
  "ICICI BANK",
  "IDBI BANK",
  "IDFC FIRST BANK",
  "INDIA POST PAYMENTS BANK",
  "INDIAN BANK",
  "INDIAN OVERSEAS BANK",
  "INDUSIND BANK",
  "JANA SMALL FINANCE BANK",
  "KARNATAKA BANK",
  "KARUR VYSYA BANK",
  "KOTAK MAHINDRA BANK",
  "LAKSHMI VILAS BANK",
  "MEHSANA URBAN CO-OPERATIVE BANK",
  "NKGSB CO-OPERATIVE BANK",
  "PAYTM PAYMENTS BANK",
  "PUNJAB & SIND BANK",
  "PUNJAB NATIONAL BANK",
  "RBL BANK",
  "SARASWAT CO-OPERATIVE BANK",
  "SHAMRAO VITHAL CO-OPERATIVE BANK",
  "SOUTH INDIAN BANK",
  "STATE BANK OF INDIA",
  "SURYODAY SMALL FINANCE BANK",
  "TAMILNAD MERCANTILE BANK",
  "THE GUJARAT STATE CO-OPERATIVE BANK",
  "THE HALOL MERCANTILE CO-OPERATIVE BANK",
  "THE HOWRAH DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE JALGAON DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE KARNATAKA STATE CO-OPERATIVE APEX BANK",
  "THE MADURAI DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE MAGADH CENTRAL CO-OPERATIVE BANK",
  "THE MAHENDRAGARH CENTRAL CO-OPERATIVE BANK",
  "THE MAHOBA URBAN CO-OPERATIVE BANK",
  "THE MATTANCHERRY SARVAJANIK CO-OPERATIVE BANK",
  "THE MEENACHIL EAST URBAN CO-OPERATIVE BANK",
  "THE MUMBAI DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE MUZAFFARPUR CENTRAL CO-OPERATIVE BANK",
  "THE NAGPUR DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE NANDED DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE NATIONAL CO-OPERATIVE BANK",
  "THE NAVAL DOCKYARD CO-OPERATIVE BANK",
  "THE NAWANSHAHR CENTRAL CO-OPERATIVE BANK",
  "THE NILAMBUR CO-OPERATIVE URBAN BANK",
  "THE NILGIRIS DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE RAJASTHAN STATE CO-OPERATIVE BANK",
  "THE TAMILNADU STATE APEX CO-OPERATIVE BANK",
  "THE THIRUVANNAMALAI DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE VIRUDHUNAGAR DISTRICT CENTRAL CO-OPERATIVE BANK",
  "THE VISAKHAPATNAM CO-OPERATIVE BANK",
  "THE WEST BENGAL STATE CO-OPERATIVE BANK",
  "UCO BANK",
  "UJJIVAN SMALL FINANCE BANK",
  "UNION BANK OF INDIA",
  "VASAI JANATA SAHAKARI BANK",
  "YES BANK",
] as const;

export const ROLE_TYPES = [
  "Technician",
  "Field Executive",
  "Sales Executive",
  "Store Manager",
] as const;

export const employeeSchema = z.object({
  type: z.literal("Employee"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  phoneVerified: z.boolean(),
  storeId: z.string().optional(),
  profilePicture: z.any().nullable(),
  roleType: z.enum(ROLE_TYPES),
  aadharNumber: z.string().regex(/^\d{12}$/, "Invalid Aadhar number"),
  bankDetails: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("bank"),
      bankName: z.enum(BANK_NAMES),
      ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
      accountNumber: z.string().min(9).max(18, "Invalid account number"),
    }),
    z.object({
      type: z.literal("upi"),
      upiId: z.string().regex(/^[\w\.\-]{3,}@[\w\.\-]{3,}$/, "Invalid UPI ID"),
    }),
  ]),
  documents: z.object({
    aadharFront: z.any().nullable(),
    aadharBack: z.any().nullable(),
    qualification: z.any().nullable().optional(),
    vehicleFront: z.any().nullable().optional(),
    vehicleBack: z.any().nullable().optional(),
  }),
  // Add new fields for Other Details
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  salary: z.number().min(0, "Salary must be a positive number"),
  payoutDate: z.number().min(1).max(30),
});

export const storeSchema = z.object({
  type: z.literal("Exchange Store"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  address: z.object({
    city: z.string().min(2, "City is required"),
    pinCode: z.string().regex(/^\d{6}$/, "Invalid PIN code"),
    state: z.string().min(2, "State is required"),
    country: z.string().optional(),
    streetAddress: z.string().min(5, "Street address is required"),
  }),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  ownerPhone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  ownerEmail: z.string().email("Invalid email address"),
});

const imeiRegex = /^[0-9]{15}$/;
export const variantSchema = z
  .object({
    variant: z.string().min(1, "Please select a variant"),
    imei1: z.string().regex(imeiRegex, "IMEI 1 must be a 15-digit number"),
    imei2: z
      .string()
      .min(1, "IMEI 2 is required")
      .refine((val) => !val || imeiRegex.test(val), {
        message: "IMEI 2 must be a 15-digit number",
      }),
    deviceFrontImage: z.string().min(1, "Device front image is required"),
    deviceBackImage: z.string().min(1, "Device back image is required"),
    diagnosticsProcess: z.enum(["app", "manual"]),
    qcReport: z
      .string()
      .optional()
      .refine(
        (val) => {
          return true;
        },
        {
          message: "Please select a QC report",
        }
      ),
    repairRequired: z.enum(["yes", "no"]),
    repairStatus: z.enum(["pending", "completed"]).optional(),
    accessories: z.enum([
      "only_charger",
      "only_box",
      "box_and_charger",
      "not_available",
    ]),
    deviceAge: z.enum([
      "below_3_months",
      "3_to_6_months",
      "6_to_11_months",
      "above_11_months",
    ]),
    warrantyType: z
      .enum([
        "brand_warranty",
        "3_month_xtracover",
        "not_applicable",
        "5_days_checking",
      ])
      .optional(),
    hasGstBill: z.enum(["available", "not_available"]),
    gstInvoice: z.string().optional(),
    boxImeiMatch: z.enum(["yes", "not_available"]),

    customerName: z.string().min(1, "Customer name is required"),
    mobileNumber: z
      .string()
      .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"),
    addressProofType: z.enum(["aadhar", "voter_id"]),
    aadharNumber: z
      .string()
      .regex(/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhar number")
      .optional(),
    address: z.string().min(20, "Address is required"),
    aadharFrontImage: z.string().optional(),
    aadharBackImage: z.string().optional(),
    epicNumber: z.string().optional(),
    voterIdFrontImage: z.string().optional(),
    voterIdBackImage: z.string().optional(),
    isAadharVerified: z.boolean().optional(),
    voterIdVerified: z.boolean().optional(),
    customerSignature: z.string().min(1, "Customer signature is required"),
    deviceReset: z.enum(["done", "not_done"]),
    deviceStartScreenImage: z.string().optional(),
    customerProofImage: z.string().optional(),
    customerDeclaration: z.string().optional(),
    cashPaymentReceiptImage: z.string().optional(),

    manualQcReport: z.any().optional(),
    // Manual Diagnostics fields (step 1)
    screenTouch: z.string().min(1, "Screen Touch Calibration is required"),
    screenSpot: z.string().min(1, "Screen Display Spot is required"),
    screenLines: z.string().min(1, "Screen Display Lines is required"),
    screenPhysical: z.string().min(1, "Screen Physical Condition is required"),
    screenDiscolor: z.string().min(1, "Screen Discoloration is required"),
    screenBubble: z.string().min(1, "Screen Bubble or Paint is required"),
    // Manual Diagnostics fields (step 3)
    physicalScratch: z
      .string()
      .min(1, "Physical Condition (Scratch) is required"),
    physicalDent: z.string().min(1, "Physical Condition (Dent) is required"),
    physicalPanel: z.string().min(1, "Physical Condition (Panel) is required"),
    physicalBent: z.string().min(1, "Physical Condition (Bent) is required"),
    remarks: z.string().min(1, "Remarks are required"),
    phoneVerified: z
      .boolean()
      .refine((val) => val === true, { message: "Phone must be verified" }),
    repairParts: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
        })
      )
      .optional(),
    repairDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.repairRequired === "yes" && !data.repairStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select repair status",
        path: ["repairStatus"],
      });
    }
    if (data.addressProofType === "aadhar") {
      if (!data.aadharFrontImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Aadhar front image is required",
          path: ["aadharFrontImage"],
        });
      }
      if (!data.aadharBackImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Aadhar back image is required",
          path: ["aadharBackImage"],
        });
      }
      if (!data.isAadharVerified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Aadhar verification is required",
          path: ["isAadharVerified"],
        });
      }
    }
    if (data.addressProofType === "voter_id") {
      if (!data.voterIdFrontImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Voter ID front image is required",
          path: ["voterIdFrontImage"],
        });
      }
      if (!data.voterIdBackImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Voter ID back image is required",
          path: ["voterIdBackImage"],
        });
      }
      if (!data.voterIdVerified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Voter ID verification is required",
          path: ["voterIdVerified"],
        });
      }
    }
    if (data.deviceReset === "done" && !data.deviceStartScreenImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Device start screen image is required after reset",
        path: ["deviceStartScreenImage"],
      });
    }
  });

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const PART_OPTIONS = [
  "Back Panel",
  "Battery",
  "OCA Glass",
  "Combo (Folder)",
  "MIddle Frame",
  "Touch Screen",
  "CHarging port",
  "Camera Lens",
  "Frame Housing",
  "Fingerprint Flex Cable",
  "Front Camera",
  "Back Camera",
  "Power button flex",
  "Back Skin",
  "Chargin Board",
  "Power bottom",
  "Sim Tray",
  "Volume flex",
  "Microphone replace",
  "Ringer (speaker)",
  "Outer Button",
  "OCA Paper",
  "Fingerprint",
  "IC Work",
];

export const createRandomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function getTokenInfo(payload: any) {
  if (!payload.iat || !payload.exp) {
    return null;
  }

  const issuedAt = new Date(payload.iat * 1000);
  const expiresAt = new Date(payload.exp * 1000);
  const now = new Date();

  const timeLeft = expiresAt.getTime() - now.getTime();
  const isExpired = timeLeft <= 0;

  return {
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    timeLeftMs: Math.max(0, timeLeft),
    timeLeftHours: Math.max(0, timeLeft / (1000 * 60 * 60)),
    timeLeftDays: Math.max(0, timeLeft / (1000 * 60 * 60 * 24)),
    isExpired,
    isValid: !isExpired,
  };
}
