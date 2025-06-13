export default function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // hasil base64
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
