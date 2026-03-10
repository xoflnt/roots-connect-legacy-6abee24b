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
  // أبناء ناصر الإضافيين (عبر زيد)
  { id: "103", name: "منيرة بنت زيد", gender: "F", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٢٩٧", death_year: "١٣٩١", spouses: "عبدالعزيز علي العبدالكريم القطنان، حمود أحمد المرزوق العامر", notes: "أبناؤها من خارج العائلة: محمد (توفي طفلاً) من زوجها الأول، بُشرى ومقبل (توفوا أطفالاً) من زوجها الثاني. لولوه (١٣٢٥-١٤٠٧) من القطنان. مزنة (١٣٣٧-١٤٣٦/٢/١٦)، سبيكة (١٣٤٠-١٤٣١)، أحمد (١٣٤٣-١٣٥٣) من العامر" },
  { id: "104", name: "عايد بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٢٧", death_year: "١٣٦٠", spouses: "نورة المهنا، من عائلة النصار", notes: "" },
  // أبناء زيد بن ناصر
  { id: "200", name: "محمد بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣١٣", death_year: "١٣٨٩", spouses: "لولوة العصيمي، مزنة البداح", notes: "" },
  { id: "300", name: "ناصر بن زيد", gender: "M", father_id: "101", mother: "نورة عبدالله النافع", birth_year: "١٣٠٠", death_year: "١٤٠١", spouses: "سلطانة البداح، نورة العامر، منيرة العصيمي، رقية العبيد، سبيكة الجوير، حصة البدر", notes: "" },
  // أبناء محمد بن زيد (من لولوة العصيمي)
  { id: "201", name: "عبدالله بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٥٣", death_year: "١٤٣١", spouses: "", notes: "" },
  { id: "202", name: "عايد بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٦٠", death_year: "١٣٧٠", spouses: "", notes: "توفي طفلاً" },
  { id: "203", name: "زيد بن محمد", gender: "M", father_id: "200", mother: "لولوة العصيمي", birth_year: "١٣٦٤", death_year: "١٤٣٦", spouses: "", notes: "" },
  // أبناء محمد بن زيد (من مزنة البداح)
  { id: "204", name: "فهد بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٤", death_year: "", spouses: "نورة ناصر زيد", notes: "" },
  { id: "205", name: "نورة بنت محمد", gender: "F", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٥", death_year: "", spouses: "سعود ناصر زيد", notes: "" },
  { id: "206", name: "ناصر بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٧٧", death_year: "", spouses: "", notes: "" },
  { id: "207", name: "سليمان بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨١", death_year: "", spouses: "", notes: "" },
  { id: "208", name: "راشد بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨٥", death_year: "", spouses: "", notes: "" },
  { id: "209", name: "علي بن محمد", gender: "M", father_id: "200", mother: "مزنة البداح", birth_year: "١٣٨٩", death_year: "", spouses: "", notes: "" },
  // أبناء ناصر بن زيد (من نورة العامر)
  { id: "301", name: "زيد بن ناصر", gender: "M", father_id: "300", mother: "نورة العامر", birth_year: "١٣٣٩", death_year: "١٤٢١", spouses: "منيرة بنت عبدالعزيز زيد", notes: "" },
  { id: "302", name: "حصة بنت ناصر", gender: "F", father_id: "300", mother: "نورة العامر", birth_year: "١٣٤٢", death_year: "١٣٧٢", spouses: "", notes: "" },
  { id: "303", name: "علي بن ناصر", gender: "M", father_id: "300", mother: "نورة العامر", birth_year: "١٣٤٦", death_year: "١٤٢٥", spouses: "", notes: "" },
  // أبناء ناصر بن زيد (من منيرة العصيمي)
  { id: "304", name: "عبدالله بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٤٨", death_year: "١٣٧٣", spouses: "", notes: "" },
  { id: "305", name: "عبدالكريم بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٤٩", death_year: "١٣٥١", spouses: "", notes: "" },
  { id: "306", name: "مزنة بنت ناصر", gender: "F", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٥٠", death_year: "١٤٣٢", spouses: "", notes: "" },
  { id: "307", name: "صالح بن ناصر", gender: "M", father_id: "300", mother: "منيرة العصيمي", birth_year: "١٣٥١", death_year: "١٤٤٥", spouses: "", notes: "" },
  // أبناء ناصر بن زيد (من حصة البدر)
  { id: "308", name: "أحمد بن ناصر", gender: "M", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً" },
  { id: "309", name: "لولوة بنت ناصر", gender: "F", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "", notes: "توفيت طفلة" },
  { id: "310", name: "سعود بن ناصر", gender: "M", father_id: "300", mother: "حصة البدر", birth_year: "١٣٧٢", death_year: "", spouses: "نورة محمد زيد", notes: "" },
  { id: "311", name: "نورة بنت ناصر", gender: "F", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "فهد محمد زيد", notes: "" },
  { id: "312", name: "إبراهيم بن ناصر", gender: "M", father_id: "300", mother: "حصة البدر", birth_year: "", death_year: "", spouses: "", notes: "توفي طفلاً" },
];
