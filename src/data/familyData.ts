export interface FamilyMember {
  [key: string]: unknown;
  id: string;
  name: string;
  gender: "M" | "F";
  father_id: string | null;
  mother: string;
  birth_year: string;
  death_year: string;
  spouses: string;
  notes: string;
}

export const familyMembers: FamilyMember[] = [
  { id: "100", name: "ناصر سعدون الخنيني", gender: "M", father_id: null, mother: "", birth_year: "", death_year: "", spouses: "", notes: "أول من حمل لقب الخنيني" },
  { id: "101", name: "زيد بن ناصر", gender: "M", father_id: "100", mother: "", birth_year: "", death_year: "١٣٤٠", spouses: "نورة عبدالله النافع", notes: "" },
  { id: "102", name: "لطيفة بنت ناصر", gender: "F", father_id: "100", mother: "", birth_year: "", death_year: "", spouses: "", notes: "" },

  // --- فرع محمد بن زيد ---
  { id: "200", name: "محمد بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣١٣", death_year: "١٣٨٩", spouses: "لولوة العصيمي، مزنة البداح", notes: "" },
  { id: "201", name: "عبدالله بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٥٣", death_year: "١٤٣١", spouses: "", notes: "" },
  { id: "202", name: "عايد بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٦٠", death_year: "١٣٧٠", spouses: "", notes: "توفي طفلاً" },
  { id: "203", name: "زيد بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٦٤", death_year: "١٤٣٦", spouses: "", notes: "" },
  { id: "204", name: "فهد بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٤", death_year: "", spouses: "نورة ناصر زيد", notes: "" },
  { id: "205", name: "نورة بنت محمد", gender: "F", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٥", death_year: "", spouses: "سعود ناصر زيد", notes: "" },
  { id: "206", name: "ناصر بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٧", death_year: "", spouses: "", notes: "" },
  { id: "207", name: "سليمان بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨١", death_year: "", spouses: "", notes: "" },
  { id: "208", name: "راشد بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨٥", death_year: "", spouses: "", notes: "" },
  { id: "209", name: "علي بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨٩", death_year: "", spouses: "", notes: "" },

  // --- فرع ناصر بن زيد ---
  { id: "300", name: "ناصر بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٠٠", death_year: "١٤٠١", spouses: "سلطانة البداح، نورة العامر، منيرة العصيمي، رقية العبيد، سبيكة الجوير، حصة البدر", notes: "" },
  { id: "301", name: "زيد بن ناصر", gender: "M", father_id: "300", mother: "نورة العامر", birth_year: "١٣٣٩", death_year: "١٤٢١", spouses: "منيرة عبدالعزيز زيد", notes: "" },
  { id: "302", name: "حصة بنت ناصر", gender: "F", father_id: "300", mother: "نورة العامر", birth_year: "١٣٤٢", death_year: "١٣٧٢", spouses: "", notes: "" },
  { id: "303", name: "علي بن ناصر", gender: "M", father_id: "300", mother: "نورة العامر", birth_year: "١٣٤٦", death_year: "١٤٢٥", spouses: "", notes: "" },
  { id: "304", name: "عبدالله بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٤٨", death_year: "١٣٧٣", spouses: "", notes: "" },
  { id: "305", name: "عبدالكريم بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٤٩", death_year: "١٣٥١", spouses: "", notes: "" },
  { id: "306", name: "مزنة بنت ناصر", gender: "F", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٥٠", death_year: "١٤٣٢", spouses: "", notes: "" },
  { id: "307", name: "صالح بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٥١", death_year: "١٤٤٥", spouses: "", notes: "" },
  { id: "310", name: "سعود بن ناصر", gender: "M", father_id: "300", mother: "حصة البدر", birth_year: "١٣٧٢", death_year: "", spouses: "نورة محمد زيد", notes: "" },
  { id: "311", name: "نورة بنت ناصر", gender: "F", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "فهد محمد زيد", notes: "" },

  // --- فرع عبدالعزيز بن زيد ---
  { id: "400", name: "عبدالعزيز بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٠٨", death_year: "١٤٠٢", spouses: "نورة الحمد، شريفة العليوي", notes: "" },
  { id: "401", name: "منيرة بنت عبدالعزيز", gender: "F", father_id: "400", mother: "نورة الحمد", birth_year: "١٣٤٦", death_year: "١٤٢٣", spouses: "زيد ناصر زيد", notes: "" },
  { id: "402", name: "عبدالله بن عبدالعزيز", gender: "M", father_id: "400", mother: "نورة الحمد", birth_year: "١٣٥٥", death_year: "", spouses: "", notes: "" },
  { id: "403", name: "سليمان بن عبدالعزيز", gender: "M", father_id: "400", mother: "نورة الحمد", birth_year: "١٣٦٤", death_year: "١٤٣٤", spouses: "", notes: "" },
  { id: "404", name: "عبدالرحمن بن عبدالعزيز", gender: "M", father_id: "400", mother: "نورة الحمد", birth_year: "", death_year: "", spouses: "", notes: "توفي عمره ١٢ سنة" },
  { id: "405", name: "ابن (غير معروف)", gender: "M", father_id: "400", mother: "نورة الحمد", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً" },

  // --- فرع منيرة بنت زيد ---
  { id: "500", name: "منيرة بنت زيد", gender: "F", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٢٩٧", death_year: "١٣٩١", spouses: "عبدالعزيز القطنان، حمود العامر", notes: "" },
  { id: "501", name: "محمد بن عبدالعزيز", gender: "M", father_id: "500", mother: "عبدالعزيز القطنان", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً - والده: عبدالعزيز العبدالكريم القطنان" },
  { id: "502", name: "بشرى", gender: "F", father_id: "500", mother: "حمود العامر", birth_year: "", death_year: "", spouses: "", notes: "توفيت طفلة - والدها: حمود المرزوق العامر" },
  { id: "503", name: "مقبل", gender: "M", father_id: "500", mother: "حمود العامر", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً - والده: حمود المرزوق العامر" },
  { id: "504", name: "لولوه بنت عبدالعزيز", gender: "F", father_id: "500", mother: "عبدالعزيز القطنان", birth_year: "١٣٢٥", death_year: "١٤٠٧", spouses: "", notes: "والدها: عبدالعزيز العبدالكريم القطنان" },
  { id: "505", name: "مزنة بنت حمود", gender: "F", father_id: "500", mother: "حمود العامر", birth_year: "١٣٣٧", death_year: "١٤٣٦", spouses: "", notes: "والدها: حمود المرزوق العامر" },
  { id: "506", name: "سبيكة بنت حمود", gender: "F", father_id: "500", mother: "حمود العامر", birth_year: "١٣٤٠", death_year: "١٤٣١", spouses: "", notes: "والدها: حمود المرزوق العامر" },
  { id: "507", name: "أحمد بن حمود", gender: "M", father_id: "500", mother: "حمود العامر", birth_year: "١٣٤٣", death_year: "١٣٥٣", spouses: "", notes: "توفي عمره ١٠ سنوات - والده: حمود المرزوق العامر" },

  // --- فرع عايد بن زيد ---
  { id: "600", name: "عايد بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٢٧", death_year: "١٣٦٠", spouses: "نورة المهنا، بنت الناصر (الاسم غير معروف)", notes: "" },
];
