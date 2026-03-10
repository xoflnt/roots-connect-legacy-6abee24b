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
  { id: "1", name: "زيد الناصر الخنيني", gender: "M", father_id: null, birth_year: "", death_year: "١٣٤٠", spouses: "لطيفة، نورة عبدالله النافع", notes: "الجد الأكبر للمشجرة الحالية" },
  { id: "2", name: "محمد", gender: "M", father_id: "1", birth_year: "١٣١٣", death_year: "١٣٨٩", spouses: "لولوة مقرن العصيمي، مزنة عبدالعزيز البداح", notes: "" },
  { id: "3", name: "ناصر", gender: "M", father_id: "1", birth_year: "١٣٠٠", death_year: "١٤٠١", spouses: "سلطانة البداح، نورة العمر، منيرة العصيمي، رقية العبيد، سبيلة الوزير، حصة البدر", notes: "" },
  { id: "4", name: "عبدالعزيز", gender: "M", father_id: "1", birth_year: "١٣٠٨", death_year: "١٤٠٢", spouses: "نورة عبدالرحمن الحمد، شريفة سليمان العلوي", notes: "" },
  { id: "5", name: "منيرة", gender: "F", father_id: "1", birth_year: "١٢٩٧", death_year: "١٣٩١", spouses: "تزوجت مرتين (الأبناء: محمد، بشرى، علي)", notes: "" },
  { id: "6", name: "عايد", gender: "M", father_id: "1", birth_year: "١٣٢٧", death_year: "١٣٦٠", spouses: "نورة الشميمري، حصة النصار", notes: "" },
  { id: "7", name: "عبدالله", gender: "M", father_id: "2", birth_year: "", death_year: "", spouses: "منيرة التويجري القشلة", notes: "" },
  { id: "8", name: "سليمان", gender: "M", father_id: "2", birth_year: "", death_year: "", spouses: "هيلة ناصر الطريفي", notes: "" },
  { id: "9", name: "ناصر", gender: "M", father_id: "8", birth_year: "", death_year: "", spouses: "الجوهرة سعود العبدالقادر", notes: "" },
  { id: "10", name: "راشد", gender: "M", father_id: "8", birth_year: "", death_year: "", spouses: "مريم عبدالمحسن", notes: "" },
  { id: "11", name: "علي", gender: "M", father_id: "8", birth_year: "", death_year: "", spouses: "مها سليمان الرومي", notes: "" },
  { id: "12", name: "عبدالله", gender: "M", father_id: "11", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "13", name: "سليمان", gender: "M", father_id: "4", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "14", name: "عبدالرحمن", gender: "M", father_id: "4", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "15", name: "عبدالله", gender: "M", father_id: "4", birth_year: "", death_year: "", spouses: "سلمى سليمان", notes: "" },
  { id: "16", name: "صالح", gender: "M", father_id: "3", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "17", name: "عبدالكريم", gender: "M", father_id: "3", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "18", name: "إبراهيم", gender: "M", father_id: "3", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "19", name: "سعود", gender: "M", father_id: "3", birth_year: "", death_year: "", spouses: "", notes: "" },
];
