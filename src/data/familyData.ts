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
  { id: "100", name: "ناصر سعدون الخنيني", gender: "M", father_id: null, birth_year: "", death_year: "", spouses: "", notes: "أول من حمل لقب الخنيني" },
  { id: "101", name: "زيد بن ناصر", gender: "M", father_id: "100", birth_year: "", death_year: "١٣٤٠", spouses: "نورة عبدالله النافع", notes: "" },
  { id: "102", name: "لطيفة بنت ناصر", gender: "F", father_id: "100", birth_year: "", death_year: "", spouses: "", notes: "" },
  // أبناء زيد بن ناصر
  { id: "200", name: "محمد بن زيد", gender: "M", father_id: "101", birth_year: "١٣١٣", death_year: "١٣٨٩", spouses: "لولوة العصيمي، مزنة البداح", notes: "" },
  { id: "300", name: "ناصر بن زيد", gender: "M", father_id: "101", birth_year: "١٣٠٠", death_year: "١٤٠١", spouses: "سلطانة البداح، نورة العامر، منيرة العصيمي، رقية العبيد، سبيكة الجوير، حصة البدر", notes: "" },
  // أبناء محمد بن زيد (من لولوة العصيمي)
  { id: "201", name: "عبدالله بن محمد", gender: "M", father_id: "200", birth_year: "١٣٥٣", death_year: "١٤٣١", spouses: "", notes: "والدته: لولوة العصيمي" },
  { id: "202", name: "عايد بن محمد", gender: "M", father_id: "200", birth_year: "١٣٦٠", death_year: "١٣٧٠", spouses: "", notes: "توفي طفلاً - والدته: لولوة العصيمي" },
  { id: "203", name: "زيد بن محمد", gender: "M", father_id: "200", birth_year: "١٣٦٤", death_year: "١٤٣٦", spouses: "", notes: "والدته: لولوة العصيمي" },
  // أبناء محمد بن زيد (من مزنة البداح)
  { id: "204", name: "فهد بن محمد", gender: "M", father_id: "200", birth_year: "١٣٧٤", death_year: "", spouses: "نورة ناصر زيد", notes: "والدته: مزنة البداح" },
  { id: "205", name: "نورة بنت محمد", gender: "F", father_id: "200", birth_year: "١٣٧٥", death_year: "", spouses: "سعود ناصر زيد", notes: "والدتها: مزنة البداح" },
  { id: "206", name: "ناصر بن محمد", gender: "M", father_id: "200", birth_year: "١٣٧٧", death_year: "", spouses: "", notes: "والدته: مزنة البداح" },
  { id: "207", name: "سليمان بن محمد", gender: "M", father_id: "200", birth_year: "١٣٨١", death_year: "", spouses: "", notes: "والدته: مزنة البداح" },
  { id: "208", name: "راشد بن محمد", gender: "M", father_id: "200", birth_year: "١٣٨٥", death_year: "", spouses: "", notes: "والدته: مزنة البداح" },
  { id: "209", name: "علي بن محمد", gender: "M", father_id: "200", birth_year: "١٣٨٩", death_year: "", spouses: "", notes: "والدته: مزنة البداح" },
  // أبناء ناصر بن زيد (من نورة العامر)
  { id: "301", name: "زيد بن ناصر", gender: "M", father_id: "300", birth_year: "١٣٣٩", death_year: "١٤٢١", spouses: "منيرة عبدالعزيز زيد", notes: "والدته: نورة العامر" },
  { id: "302", name: "حصة بنت ناصر", gender: "F", father_id: "300", birth_year: "١٣٤٢", death_year: "١٣٧٢", spouses: "", notes: "والدتها: نورة العامر" },
  { id: "303", name: "علي بن ناصر", gender: "M", father_id: "300", birth_year: "١٣٤٦", death_year: "١٤٢٥", spouses: "", notes: "والدته: نورة العامر" },
  // أبناء ناصر بن زيد (من منيرة العصيمي)
  { id: "304", name: "عبدالله بن ناصر", gender: "M", father_id: "300", birth_year: "١٣٤٨", death_year: "١٣٧٣", spouses: "", notes: "والدته: منيرة العصيمي" },
  { id: "305", name: "عبدالكريم بن ناصر", gender: "M", father_id: "300", birth_year: "١٣٤٩", death_year: "١٣٥١", spouses: "", notes: "والدته: منيرة العصيمي" },
  { id: "306", name: "مزنة بنت ناصر", gender: "F", father_id: "300", birth_year: "١٣٥٠", death_year: "١٤٣٢", spouses: "", notes: "والدتها: منيرة العصيمي" },
  { id: "307", name: "صالح بن ناصر", gender: "M", father_id: "300", birth_year: "١٣٥١", death_year: "١٤٤٥", spouses: "", notes: "والدته: منيرة العصيمي" },
  // أبناء ناصر بن زيد (من حصة البدر)
  { id: "308", name: "أحمد بن ناصر", gender: "M", father_id: "300", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً - والدته: حصة البدر" },
  { id: "309", name: "لولوة بنت ناصر", gender: "F", father_id: "300", birth_year: "", death_year: "", spouses: "", notes: "توفيت طفلة - والدتها: حصة البدر" },
  { id: "310", name: "سعود بن ناصر", gender: "M", father_id: "300", birth_year: "١٣٧٢", death_year: "", spouses: "نورة محمد زيد", notes: "والدته: حصة البدر" },
  { id: "311", name: "نورة بنت ناصر", gender: "F", father_id: "300", birth_year: "", death_year: "", spouses: "فهد محمد زيد", notes: "والدتها: حصة البدر" },
  { id: "312", name: "إبراهيم بن ناصر", gender: "M", father_id: "300", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً - والدته: حصة البدر" },
];
