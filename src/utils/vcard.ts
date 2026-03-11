/**
 * Generate and download a vCard (.vcf) file for saving a contact.
 * Works on iOS, Android (Samsung, Huawei, etc.), and desktop.
 */
export function downloadVCard(name: string, phone: string) {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `TEL;TYPE=CELL:${cleaned}`,
    "END:VCARD",
  ].join("\r\n");

  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
