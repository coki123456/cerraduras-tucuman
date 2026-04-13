import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportarPDF(
  elementId: string,
  nombreArchivo: string = "reporte"
) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  const canvas = await html2canvas(elemento, {
    backgroundColor: "#0a0a0a",
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width / 2, canvas.height / 2],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(`${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportarCSV(
  datos: Record<string, unknown>[],
  nombreArchivo: string = "exportacion"
) {
  if (!datos || datos.length === 0) return;

  const cabeceras = Object.keys(datos[0]);
  const filas = datos.map((fila) =>
    cabeceras.map((col) => {
      const val = fila[col];
      const str = val == null ? "" : String(val);
      return str.includes(",") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );

  const csv = [cabeceras.join(","), ...filas].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
