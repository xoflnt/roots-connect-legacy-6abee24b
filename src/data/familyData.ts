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
  // الجد الأول
  { id: "100", name: "ناصر سعدون الخنيني", gender: "M", father_id: null, mother: "", birth_year: "", death_year: "", spouses: "", notes: "أول من حمل لقب الخنيني (محمد بن سلامة)" },

  // أبناء ناصر سعدون
  { id: "101", name: "زيد بن ناصر", gender: "M", father_id: "100", mother: "", birth_year: "", death_year: "١٣٤٠", spouses: "نورة عبدالله النافع", notes: "توفي بحدود العام ١٣٤٠هـ" },
  { id: "102", name: "لطيفة بنت ناصر", gender: "F", father_id: "100", mother: "", birth_year: "", death_year: "", spouses: "", notes: "" },

  // أبناء زيد بن ناصر (من نورة عبدالله النافع)
  { id: "103", name: "عايد بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٢٧ تقريباً", death_year: "١٣٦٠", spouses: "حصة خضر، شريفة سليمان العليوي", notes: "" },
  { id: "104", name: "منيرة بنت زيد", gender: "F", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٢٩٧", death_year: "١٣٩١", spouses: "", notes: "" },
  { id: "105", name: "عبدالعزيز بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٠٨", death_year: "١٤٠٢/١٠/٨", spouses: "نورة أحمد المرزوق العامر، لولو خزعل دخيل العصيمي، مزنة أحمد البداح، منيرة خزعل دخيل، حصة إبراهيم البدر، نورة عبدالرحمن عبدالله الحمد", notes: "" },
  { id: "200", name: "محمد بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣١٣", death_year: "١٣٨٩/١٢/١٢", spouses: "لولوة العصيمي، مزنة البداح", notes: "" },
  { id: "300", name: "ناصر بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٠٠", death_year: "١٤٠١/٤/٥", spouses: "سلطانة البداح، نورة العامر، منيرة العصيمي، رقية العبيد، سبيكة الجوير، حصة البدر", notes: "" },

  // أبناء عايد بن زيد (من حصة خضر)
  { id: "1030", name: "لطيفة بنت عايد", gender: "F", father_id: "103", mother: "حصة خضر", birth_year: "", death_year: "", spouses: "", notes: "توفيت صغيرة" },

  // أبناء محمد بن زيد (من لولوة العصيمي)
  { id: "201", name: "عبدالله بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٥٣", death_year: "١٤٣١/٥/٢٢", spouses: "", notes: "" },
  { id: "202", name: "عايد بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٦٠", death_year: "١٣٧٠", spouses: "", notes: "توفي طفلاً" },
  { id: "203", name: "زيد بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٣٧", death_year: "١٤٣٦/٢/١٦", spouses: "", notes: "" },

  // أبناء محمد بن زيد (من مزنة البداح)
  { id: "204", name: "فهد بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٤", death_year: "", spouses: "نورة ناصر زيد", notes: "" },
  { id: "205", name: "نورة بنت محمد", gender: "F", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٥", death_year: "", spouses: "سعود ناصر زيد", notes: "" },
  { id: "206", name: "ناصر بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٧", death_year: "", spouses: "", notes: "" },
  { id: "207", name: "سليمان بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨١", death_year: "", spouses: "", notes: "" },
  { id: "208", name: "راشد بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨٥", death_year: "", spouses: "", notes: "" },
  { id: "209", name: "علي بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨٩", death_year: "", spouses: "", notes: "" },

  // أبناء ناصر بن زيد (من نورة العامر)
  { id: "301", name: "زيد بن ناصر", gender: "M", father_id: "300", mother: "نورة العامر", birth_year: "١٣٣٩ تقريباً", death_year: "١٤٢١/١٠/٨", spouses: "منيرة عبدالعزيز زيد", notes: "" },
  { id: "302", name: "حصة بنت ناصر", gender: "F", father_id: "300", mother: "نورة العامر", birth_year: "١٣٤٢ تقريباً", death_year: "١٣٧٢ تقريباً", spouses: "", notes: "" },
  { id: "303", name: "علي بن ناصر", gender: "M", father_id: "300", mother: "نورة العامر", birth_year: "١٣٤٦", death_year: "١٤٢٥/١٢/١٢", spouses: "", notes: "" },

  // أبناء ناصر بن زيد (من منيرة العصيمي)
  { id: "304", name: "عبدالله بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٤٨", death_year: "١٣٧٣ تقريباً", spouses: "", notes: "" },
  { id: "305", name: "عبدالكريم بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٤٩", death_year: "١٣٥١ تقريباً", spouses: "", notes: "" },
  { id: "306", name: "مزنة بنت ناصر", gender: "F", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٥٠", death_year: "١٤٣٢/٢/٤", spouses: "", notes: "" },
  { id: "307", name: "صالح بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٥١", death_year: "١٤٤٥/٦/٢٢", spouses: "", notes: "" },

  // أبناء ناصر بن زيد (من رقية العبيد)
  { id: "313", name: "لطيفة بنت ناصر", gender: "F", father_id: "300", mother: "رقية العبيد", birth_year: "", death_year: "١٣٥٥ تقريباً", spouses: "", notes: "توفيت طفلة" },

  // أبناء ناصر بن زيد (من سبيكة الجوير)
  { id: "314", name: "طفل ١ بن ناصر", gender: "M", father_id: "300", mother: "سبيكة الجوير", birth_year: "", death_year: "", spouses: "", notes: "توفي صغيراً" },
  { id: "315", name: "طفل ٢ بن ناصر", gender: "M", father_id: "300", mother: "سبيكة الجوير", birth_year: "", death_year: "", spouses: "", notes: "توفي صغيراً" },
  { id: "316", name: "طفل ٣ بن ناصر", gender: "M", father_id: "300", mother: "سبيكة الجوير", birth_year: "", death_year: "", spouses: "", notes: "توفي صغيراً" },

  // أبناء ناصر بن زيد (من حصة البدر)
  { id: "308", name: "أحمد بن ناصر", gender: "M", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً" },
  { id: "309", name: "لولوة بنت ناصر", gender: "F", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "", notes: "توفيت طفلة" },
  { id: "310", name: "سعود بن ناصر", gender: "M", father_id: "300", mother: "حصة البدر", birth_year: "١٣٧٢", death_year: "", spouses: "نورة محمد زيد", notes: "" },
  { id: "311", name: "نورة بنت ناصر", gender: "F", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "فهد محمد زيد", notes: "" },
  { id: "312", name: "إبراهيم بن ناصر", gender: "M", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً" },

  // أبناء عبدالعزيز بن زيد (من نورة أحمد المرزوق العامر)
  { id: "400", name: "فهد بن عبدالعزيز", gender: "M", father_id: "105", mother: "نورة أحمد المرزوق العامر", birth_year: "١٣٤٠", death_year: "١٤٣١", spouses: "", notes: "" },
  { id: "401", name: "نورة بنت عبدالعزيز", gender: "F", father_id: "105", mother: "نورة أحمد المرزوق العامر", birth_year: "١٣٤٢ تقريباً", death_year: "١٣٧٢ تقريباً", spouses: "تركي السديري", notes: "" },
  { id: "402", name: "عبدالله بن عبدالعزيز", gender: "M", father_id: "105", mother: "نورة أحمد المرزوق العامر", birth_year: "١٣٤٣", death_year: "١٣٥٣", spouses: "", notes: "" },
  { id: "403", name: "عبدالكريم بن عبدالعزيز", gender: "M", father_id: "105", mother: "نورة أحمد المرزوق العامر", birth_year: "١٣٤٩", death_year: "١٣٥١", spouses: "", notes: "توفي صغيراً" },
  { id: "404", name: "أحمد بن عبدالعزيز", gender: "M", father_id: "105", mother: "نورة أحمد المرزوق العامر", birth_year: "", death_year: "", spouses: "", notes: "توفي وعمره ١٠ سنوات تقريباً" },

  // أبناء عبدالعزيز بن زيد (من لولو خزعل دخيل العصيمي)
  { id: "405", name: "حصة بنت عبدالعزيز", gender: "F", father_id: "105", mother: "لولو خزعل دخيل العصيمي", birth_year: "١٣٥٥", death_year: "١٣٥٥", spouses: "", notes: "توفيت طفلة" },
  { id: "406", name: "عايد بن عبدالعزيز", gender: "M", father_id: "105", mother: "لولو خزعل دخيل العصيمي", birth_year: "١٣٦٠ تقريباً", death_year: "١٣٧٠ تقريباً", spouses: "", notes: "" },
  { id: "407", name: "لولوه بنت عبدالعزيز", gender: "F", father_id: "105", mother: "لولو خزعل دخيل العصيمي", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "408", name: "الجوهرة بنت عبدالعزيز", gender: "F", father_id: "105", mother: "لولو خزعل دخيل العصيمي", birth_year: "", death_year: "", spouses: "", notes: "" },
  { id: "409", name: "سارة بنت عبدالعزيز", gender: "F", father_id: "105", mother: "لولو خزعل دخيل العصيمي", birth_year: "", death_year: "", spouses: "", notes: "" },

  // أبناء عبدالعزيز بن زيد (من حصة إبراهيم البدر)
  { id: "410", name: "عبدالله بن عبدالعزيز", gender: "M", father_id: "105", mother: "حصة إبراهيم البدر", birth_year: "١٣٦٤", death_year: "١٤٣٤/٣/١٠", spouses: "", notes: "" },
];
