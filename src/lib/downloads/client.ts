export function downloadBase64File(base64: string, mime: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:${mime};base64,${base64}`;
  link.download = filename;
  link.click();
}
