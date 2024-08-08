
export const proStatuses = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Denied", value: "denied" },
    { label: "Expired", value: "expired" },
  ];

export const defaultDiscountLevels = [
    { label: "Friends", value: "friends" },
    { label: "Industry", value: "industry" },
    { label: "G&O", value: "guide" },
    { label: "Retailer", value: "retailer" }
  ];

export const defaultFieldsConfig = [
  {
    name: "Gender",
    key: "gender",
    helpText: "Gender helps us recommend the right gear for you.",
    type: "select",
    options: [
      { label: "Male", key:"male" },
      { label: "Female", key:"female" },
      { label: "Prefer not to say", key:"prefer-not" }
    ],
    required: true
  },
  {
    name: "Employer",
    key: "employer",
    helpText: "Employer is required to verify your employment.",
    type: "text",
    required: true
  }
]

// Depricated

export const discountLevels = [
  { label: "Friends", value: "friends" },
  { label: "Industry", value: "industry" },
  { label: "G&O", value: "guide" },
  { label: "Retailer", value: "retailer" }
];

export const employerTypes = [
    { label: "Please Select...", value: false, disabled: true },
    { label: "Industry", value: "industry" },
    { label: "G&O", value: "guide" },
    { label: "Retailer", value: "retailer" }
  ];

export const genders = [
    { label: "Please Select...", value: false, disabled: true },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Prefer not to say", value: "none" }
  ];