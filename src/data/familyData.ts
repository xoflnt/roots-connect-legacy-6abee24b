export interface FamilyMember {
  [key: string]: unknown;
  id: string;
  name: string;
  gender: "M" | "F";
  father_id: string | null;
  birth_year: string;
  death_year: string;
  spouses: string;
  notes: string;
}

export const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "زيد الناصر الخنيني",
    gender: "M",
    father_id: null,
    birth_year: "",
    death_year: "١٣٤٠",
    spouses: "لطيفة، نورة عبدالله النافع",
    notes: "الجد الأكبر للمشجرة الحالية",
  },
  {
    id: "2",
    name: "محمد",
    gender: "M",
    father_id: "1",
    birth_year: "١٣١٣",
    death_year: "١٣٨٩",
    spouses: "لولوة مقرن العصيمي، مزنة عبدالعزيز البداح",
    notes: "",
  },
  {
    id: "3",
    name: "ناصر",
    gender: "M",
    father_id: "1",
    birth_year: "١٣٠٠",
    death_year: "١٤٠١",
    spouses: "سلطانة البداح، نورة العمر، منيرة العصيمي، رقية العبيد، سبيلة الوزير، حصة البدر",
    notes: "",
  },
  {
    id: "4",
    name: "عبدالعزيز",
    gender: "M",
    father_id: "1",
    birth_year: "١٣٠٨",
    death_year: "١٤٠٢",
    spouses: "نورة عبدالرحمن الحمد، شريفة سليمان العلوي",
    notes: "",
  },
  {
    id: "5",
    name: "منيرة",
    gender: "F",
    father_id: "1",
    birth_year: "١٢٩٧",
    death_year: "١٣٩١",
    spouses: "تزوجت مرتين (الأبناء: محمد، بشرى، علي)",
    notes: "",
  },
  {
    id: "6",
    name: "عايد",
    gender: "M",
    father_id: "1",
    birth_year: "١٣٢٧",
    death_year: "١٣٦٠",
    spouses: "نورة الشميمري، حصة النصار",
    notes: "",
  },
];
