const apiUrl = process.env.VITE_API_URL?.trim();

if (!apiUrl) {
  console.error("Defina VITE_API_URL com a URL pública HTTPS do backend antes do deploy.");
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(apiUrl);
} catch {
  console.error("VITE_API_URL precisa ser uma URL válida.");
  process.exit(1);
}

if (parsedUrl.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(parsedUrl.hostname)) {
  console.error("VITE_API_URL precisa apontar para a URL pública HTTPS do backend.");
  process.exit(1);
}

console.log(`Backend de produção: ${parsedUrl.origin}`);
