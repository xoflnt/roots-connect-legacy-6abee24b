/**
 * Demo family data generator.
 * Produces ~200 realistic Saudi family members with a seeded RNG
 * so the same surname always yields the same tree.
 */

export interface DemoMember {
  id: string;
  name: string;
  gender: "M" | "F";
  father_id: string | null;
  birth_year: string | null;
  death_year: string | null;
  spouses: string | null;
  notes: string | null;
}

// ─── Name pools ───

const MALE_NAMES = [
  "عبدالله","عبدالرحمن","محمد","فهد","سلطان","تركي","سعود","خالد","ناصر","إبراهيم",
  "صالح","فارس","بندر","فيصل","ماجد","عمر","راكان","وليد","سعد","عبدالعزيز",
  "عبدالمحسن","نايف","مشاري","يوسف","أحمد","حمد","زيد","طلال","بدر","مساعد",
  "متعب","منصور","هذال","مشعل","عادل","ثامر","غازي","حمود","لافي","مقبل",
  "عبدالملك","حسن","علي","سالم","ريان","آدم","عبدالإله","تميم","هشام","أسامة",
];

const FEMALE_NAMES = [
  "نورة","فاطمة","سارة","مشاعل","هيفاء","لطيفة","موضي","العنود","غادة","ريم",
  "لولوة","دلال","نوف","حصة","منيرة","جواهر","سميرة","هيا","أمل","وضحى",
  "شيخة","بدرية","منال","عبير","لمياء","جوري","رزان","دانة","لمى","أسماء",
  "مها","ابتسام","هند","نجلاء","وفاء","خلود","عهود","رقية","تهاني","بشاير",
];

const SPOUSE_FAMILIES = [
  "الفهد","السالم","العمر","الخالد","المحمد","الصالح","العلي","البدر","الراشد",
  "الحربي","العنزي","السبيعي","المطيري","الشمري","الدوسري","الزهراني","الغامدي",
  "القحطاني","الحمدان","الجبر","النفيسة","الهويمل","البراهيم","السويلم","الفوزان",
  "المنيع","العريفي","الجريسي","الخضيري","المشاري",
];

// ─── Seeded RNG ───

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function createRng(seed: number) {
  let s = seed || 1;
  return {
    next(): number {
      s = (s * 1664525 + 1013904223) & 0x7fffffff;
      return s / 0x7fffffff;
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
    chance(p: number): boolean {
      return this.next() < p;
    },
    /** Pick unique items from array (no repeats) */
    pickUnique<T>(arr: T[], count: number, exclude: Set<string> = new Set()): T[] {
      const available = arr.filter(a => !exclude.has(String(a)));
      const result: T[] = [];
      const used = new Set<number>();
      const max = Math.min(count, available.length);
      while (result.length < max) {
        const idx = Math.floor(this.next() * available.length);
        if (!used.has(idx)) {
          used.add(idx);
          result.push(available[idx]);
        }
      }
      return result;
    },
  };
}

function toEastern(n: number): string {
  return String(n).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}

// ─── Generator ───

export function generateDemoFamily(familySurname: string): DemoMember[] {
  const rng = createRng(hashStr(familySurname));
  const members: DemoMember[] = [];
  const usedNamesPerFather = new Map<string, Set<string>>();

  function pickName(gender: "M" | "F", fatherId: string | null): string {
    const pool = gender === "M" ? MALE_NAMES : FEMALE_NAMES;
    const key = fatherId || "__root__";
    if (!usedNamesPerFather.has(key)) usedNamesPerFather.set(key, new Set());
    const used = usedNamesPerFather.get(key)!;
    const available = pool.filter(n => !used.has(n));
    const name = available.length > 0 ? rng.pick(available) : rng.pick(pool);
    used.add(name);
    return name;
  }

  function makeSpouse(): string {
    const name = rng.pick(FEMALE_NAMES);
    const family = rng.pick(SPOUSE_FAMILIES);
    return `${name} ${family}`;
  }

  function addMember(opts: {
    id: string;
    firstName: string;
    gender: "M" | "F";
    fatherId: string | null;
    fatherFirstName?: string;
    surname?: string;
    birthYear: number | null;
    deathYear?: number | null;
    spouses?: string[];
    motherName?: string;
  }): DemoMember {
    const { id, firstName, gender, fatherId, fatherFirstName, surname, birthYear, deathYear, spouses, motherName } = opts;
    const connector = gender === "M" ? "بن" : "بنت";
    let fullName: string;
    if (fatherFirstName) {
      fullName = surname
        ? `${firstName} ${connector} ${fatherFirstName} ${surname}`
        : `${firstName} ${connector} ${fatherFirstName}`;
    } else {
      fullName = surname ? `${firstName} ${surname}` : firstName;
    }

    const member: DemoMember = {
      id,
      name: fullName,
      gender,
      father_id: fatherId,
      birth_year: birthYear ? toEastern(birthYear) : null,
      death_year: deathYear ? toEastern(deathYear) : null,
      spouses: spouses && spouses.length > 0 ? spouses.join("،") : null,
      notes: motherName ? `والدته: ${motherName}` : null,
    };
    members.push(member);
    return member;
  }

  // ─── Generation 1: Founder ───
  const founderName = pickName("M", null);
  addMember({
    id: "D100",
    firstName: founderName,
    gender: "M",
    fatherId: null,
    surname: familySurname,
    birthYear: 1290,
    deathYear: 1360,
    spouses: [makeSpouse()],
  });

  // ─── Generation 2: Founder's children (4 sons = 4 branches + 1 daughter) ───
  const gen2Ids = ["D200", "D300", "D400", "D500"];
  const gen2Names: string[] = [];
  const gen2Spouses: string[][] = [];

  for (let i = 0; i < 4; i++) {
    const name = pickName("M", "D100");
    gen2Names.push(name);
    const sp = [makeSpouse()];
    if (rng.chance(0.3)) sp.push(makeSpouse());
    gen2Spouses.push(sp);
    addMember({
      id: gen2Ids[i],
      firstName: name,
      gender: "M",
      fatherId: "D100",
      fatherFirstName: founderName,
      surname: familySurname,
      birthYear: rng.int(1310, 1330),
      deathYear: rng.int(1380, 1410),
      spouses: sp,
      motherName: makeSpouse(),
    });
  }
  // 1 daughter
  addMember({
    id: "D600",
    firstName: pickName("F", "D100"),
    gender: "F",
    fatherId: "D100",
    fatherFirstName: founderName,
    birthYear: rng.int(1315, 1335),
    deathYear: rng.int(1390, 1420),
    motherName: makeSpouse(),
  });

  // ─── Generation 3: Grandchildren (~25-30) ───
  let gen3Counter = 0;
  const gen3Males: { id: string; firstName: string; fatherFirstName: string; birthYear: number }[] = [];

  for (let b = 0; b < 4; b++) {
    const branchId = gen2Ids[b];
    const fatherName = gen2Names[b];
    const spouses = gen2Spouses[b];
    const childCount = rng.int(4, 7);

    for (let c = 0; c < childCount; c++) {
      gen3Counter++;
      const gender: "M" | "F" = rng.chance(0.6) ? "M" : "F";
      const firstName = pickName(gender, branchId);
      const childId = `${branchId.slice(0, 4)}${gen3Counter}`;
      const birthYear = rng.int(1340, 1370);
      const motherName = rng.pick(spouses);
      const isDead = rng.chance(0.3);
      const sp = gender === "M" ? (() => {
        const s = [makeSpouse()];
        if (rng.chance(0.2)) s.push(makeSpouse());
        return s;
      })() : undefined;

      addMember({
        id: childId,
        firstName,
        gender,
        fatherId: branchId,
        fatherFirstName: fatherName,
        birthYear,
        deathYear: isDead ? rng.int(1400, 1440) : undefined,
        spouses: sp,
        motherName,
      });

      if (gender === "M") {
        gen3Males.push({ id: childId, firstName, fatherFirstName: fatherName, birthYear });
      }
    }
  }

  // ─── Generation 4: Great-grandchildren (~60-70) ───
  let gen4Counter = 0;
  const gen4Males: { id: string; firstName: string; fatherFirstName: string; birthYear: number }[] = [];

  for (const father of gen3Males) {
    const childCount = rng.int(3, 6);
    for (let c = 0; c < childCount; c++) {
      gen4Counter++;
      const gender: "M" | "F" = rng.chance(0.6) ? "M" : "F";
      const firstName = pickName(gender, father.id);
      const childId = `${father.id}_${c + 1}`;
      const birthYear = rng.int(1370, 1410);
      const sp = gender === "M" ? [makeSpouse()] : undefined;

      addMember({
        id: childId,
        firstName,
        gender,
        fatherId: father.id,
        fatherFirstName: father.firstName,
        birthYear,
        spouses: sp,
        motherName: makeSpouse(),
      });

      if (gender === "M") {
        gen4Males.push({ id: childId, firstName, fatherFirstName: father.firstName, birthYear });
      }
    }
  }

  // ─── Generation 5: Current generation (~80-90) ───
  let gen5Counter = 0;
  const gen5Males: { id: string; firstName: string; birthYear: number }[] = [];

  for (const father of gen4Males) {
    const childCount = rng.int(2, 5);
    for (let c = 0; c < childCount; c++) {
      gen5Counter++;
      const gender: "M" | "F" = rng.chance(0.6) ? "M" : "F";
      const firstName = pickName(gender, father.id);
      const childId = `${father.id}_${c + 1}`;
      const birthYear = rng.int(1410, 1445);
      const isMarried = gender === "M" && birthYear < 1425 && rng.chance(0.4);
      const sp = isMarried ? [makeSpouse()] : undefined;

      addMember({
        id: childId,
        firstName,
        gender,
        fatherId: father.id,
        fatherFirstName: father.firstName,
        birthYear,
        spouses: sp,
        motherName: makeSpouse(),
      });

      if (gender === "M" && isMarried) {
        gen5Males.push({ id: childId, firstName, birthYear });
      }
    }
  }

  // ─── Generation 6: Young children (to reach ~200) ───
  const remaining = Math.max(0, 200 - members.length);
  let gen6Counter = 0;
  const shuffledGen5 = [...gen5Males].sort(() => rng.next() - 0.5);

  for (let i = 0; i < remaining && i < shuffledGen5.length * 3; i++) {
    const father = shuffledGen5[i % shuffledGen5.length];
    gen6Counter++;
    const gender: "M" | "F" = rng.chance(0.55) ? "M" : "F";
    const firstName = pickName(gender, father.id);
    const childId = `${father.id}_${gen6Counter}`;

    addMember({
      id: childId,
      firstName,
      gender,
      fatherId: father.id,
      fatherFirstName: father.firstName,
      birthYear: rng.int(1440, 1447),
      motherName: makeSpouse(),
    });
  }

  return members;
}

/** Get the 4 branch heads (generation 2 sons) */
export function getDemoBranches(members: DemoMember[]): { id: string; name: string; count: number }[] {
  const branchIds = ["D200", "D300", "D400", "D500"];
  return branchIds.map(bid => {
    const head = members.find(m => m.id === bid);
    if (!head) return { id: bid, name: "فرع", count: 0 };
    // Count all descendants
    let count = 0;
    const stack = [bid];
    while (stack.length) {
      const current = stack.pop()!;
      const children = members.filter(m => m.father_id === current);
      count += children.length;
      children.forEach(c => stack.push(c.id));
    }
    const firstName = head.name.split(" ")[0];
    return { id: bid, name: firstName, count };
  });
}
