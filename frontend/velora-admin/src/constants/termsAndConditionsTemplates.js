/**
 * Standard Terms & Conditions, Material Specs, Warranty & Bank Details Template
 * Extracted and modeled from official Interior BOQ Contract (Pages 5 & 6)
 */

export const DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE = {
  id: "standard_interior_boq",
  title: "Standard Interior Turnkey Contract & 12-Year Warranty",
  bankDetails: {
    accountHolder: "NETTLE CREEK INTERIORS",
    accountNumber: "50200073374185",
    ifsc: "HDFC0000223",
    branch: "PASHAN",
    accountType: "CURRENT"
  },
  paymentPlan: [
    {
      milestone: "1st Advance (Booking)",
      percent: 50,
      description: "50% advance before Starting work"
    },
    {
      milestone: "2nd Stage (Production Clearance)",
      percent: 30,
      description: "Upon factory production and carcass layout commencement"
    },
    {
      milestone: "3rd Stage (Delivery & Installation)",
      percent: 17.5,
      description: "Upon site delivery of modular units and hardware fittings"
    },
    {
      milestone: "Final Handover",
      percent: 2.5,
      description: "Complete Payment to be done before handover of the Flat"
    }
  ],
  termsList: [
    {
      title: "Preliminary Quote",
      text: "This quotation is preliminary and subject to change. A final BOQ will be provided upon completion of the entire home design. There may be a difference of 5-10% between the preliminary and final BOQ."
    },
    {
      title: "Advance Payment",
      text: "50% advance before Starting work."
    },
    {
      title: "Payment Breakover",
      text: "Payment Breakover: 50 – 30 – 17.5 – 2.5."
    },
    {
      title: "Handover Clearance",
      text: "Complete Payment to be done before handover of the Flat."
    },
    {
      title: "Validity of Quote",
      text: "The provided quotation is valid for a period of three months from the date of issuance. After this period, rates may be subject to change based on market fluctuations."
    },
    {
      title: "Scope of Work",
      text: "This BOQ covers the items specified and agreed upon at the time of this quotation. Any additional items or modifications requested after agreement may result in extra charges. Any work not explicitly outlined in the provided quotation will be considered out of scope and will be subject to additional charges based on mutual agreement. Any items or modifications discussed verbally or in writing prior to this quotation, but not explicitly included, should be communicated in writing for inclusion. Failure to do so may result in additional charges or modifications to the project scope, subject to mutual agreement."
    },
    {
      title: "Design Approval",
      text: "The client's approval of the 3D designs does not signify inclusion of additional items not mentioned in the BOQ unless mutually agreed upon in writing and incorporated into an updated scope of work."
    },
    {
      title: "Project Duration",
      text: "(50 Days) The estimated project duration provided in this quote is subject to change based on factors including scope alterations, material availability, and unforeseen site conditions. Client-requested changes for an accelerated project timeline must be mutually agreed upon. Any necessary adjustments to working hours or methods to meet this revised schedule will be decided by the service provider. Additional costs due to these changes may apply and require mutual written agreement."
    },
    {
      title: "Design Fees",
      text: "Design fees are encompassed within the provided quotation and are included in the overall project cost. These fees cover the design phase of the project."
    },
    {
      title: "Payment Terms",
      text: "Upon receipt of a payment request, the payment should be made within 48 hours. Failure to adhere to payment timelines may result in delays or suspension of project execution."
    },
    {
      title: "Cost Variation",
      text: "Any fluctuations in material costs, taxes, or government regulations during the project may result in a cost variation, subject to client approval."
    },
    {
      title: "Refund Policy",
      text: "Payments made for design and execution are non-refundable in the event of project cancellation termination, regardless of circumstances."
    },
    {
      title: "Revisions",
      text: "This Quotation includes up to five revisions per room. Additional revisions or iterations in 2D or 3D designs will incur extra charges."
    },
    {
      title: "Material Specifications",
      text: "The materials specified are subject to availability. In case of unavailability, equivalent or better-quality alternatives will be proposed after consultation."
    },
    {
      title: "Installation and Handover",
      text: "Installation will commence after the approval of design layouts and completion of material procurement. Final handover will be upon complete installation, deep cleaning and client walkthrough for approval."
    },
    {
      title: "Worker Rest Day",
      text: "Friday's OFF For The Workers."
    }
  ],
  note: "Debris removal / Deep cleaning charges shall be charged at actuals. (Borne by the client)",
  materialDetails: [
    {
      title: "External Laminates",
      text: "Laminates offered within this quote range up to a maximum of 1mm thickness, available in both Matte or Glossy finish, with a maximum cost limit of 2000 for selection."
    },
    {
      title: "Internal Laminates",
      text: "Provided laminate options of 1mm thickness, offering a variety of choices to suit preferences."
    },
    {
      title: "Handles",
      text: "Clients can select handles from a range of choices, up to a maximum value of 250."
    },
    {
      title: "Hardware",
      text: "Utilization of a combination of Telescopic channels and close hinges sourced from renowned brands such as Hettich, Bose, Godrej, ebco, Onyx, or Hafele."
    },
    {
      title: "Paint",
      text: "Application of Asian Paints accompanied by Birla Lambi/Putti, comprising one coat of Primer followed by two paint coats for a high-quality finish."
    },
    {
      title: "Wires and Switches",
      text: "Use of Polycab wires in conjunction with Legrand Switches to ensure reliable and safe electrical fittings."
    }
  ],
  warrantyDetails: [
    "We provide a warranty for the interior work completed on your project, ensuring its quality and durability.",
    "The warranty period extends for twelve (12) year from the date of substantial completion.",
    "Our warranty covers any defects in materials and workmanship related to the interior work as outlined in the project specifications and agreed upon by both parties.",
    "During the warranty period, we will promptly address and rectify issues arising from faulty materials or workmanship at no additional cost to you.",
    "The contractor reserves the right to either repair or replace the defective items, as deemed necessary, to fulfill the warranty obligations.",
    "To avail the warranty, you are required to notify us in writing with photos of any defects or deficiencies discovered during the warranty period within a reasonable time after their discovery.",
    "Please note that the warranty excludes damages resulting from normal wear and tear, accidental or intentional damage, negligence, misuse, improper maintenance, and acts of nature.",
    "The warranty specifically applies to the interior work mentioned in the project specifications and agreed upon by both parties, and it does not extend to any other parts of the project or additional work performed by other contractors or subcontractors."
  ]
};

/**
 * Calculates milestone amounts based on the Grand Total of the BOQ
 */
export const calculateMilestones = (grandTotal, paymentPlan = DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE.paymentPlan) => {
  const total = Number(grandTotal) || 0;
  return paymentPlan.map((p) => {
    const amount = Math.round(total * (p.percent / 100));
    return {
      ...p,
      amount
    };
  });
};

/**
 * Loads custom template from localStorage or falls back to default
 */
export const getActiveTermsTemplate = () => {
  try {
    const custom = localStorage.getItem("velora_custom_tc_template");
    if (custom) {
      return JSON.parse(custom);
    }
  } catch (e) {
    console.error("Error loading custom T&C template:", e);
  }
  return DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE;
};

/**
 * Saves custom template overrides into localStorage
 */
export const saveActiveTermsTemplate = (template) => {
  try {
    localStorage.setItem("velora_custom_tc_template", JSON.stringify(template));
    return true;
  } catch (e) {
    console.error("Error saving custom T&C template:", e);
    return false;
  }
};
