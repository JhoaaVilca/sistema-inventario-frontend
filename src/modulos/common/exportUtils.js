// Utilidades optimizadas para exportar tablas HTML a Excel, PDF e Imprimir
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extrae cabeceras y filas excluyendo columnas innecesarias
function getTableMatrix(tableEl, excludeHeaderMatchers = ["acciones", "alertas"]) {
    if (!tableEl) return { headers: [], rows: [] };

    const rawHeaders = Array.from(tableEl.querySelectorAll("thead th")).map(h => h.innerText.trim());
    const excludeIdx = new Set(
        rawHeaders
            .map((h, idx) => ({ h: h.toLowerCase(), idx }))
            .filter(({ h }) => excludeHeaderMatchers.some(m => h.includes(String(m).toLowerCase())))
            .map(({ idx }) => idx)
    );

    const headers = rawHeaders.filter((_, idx) => !excludeIdx.has(idx));
    const rows = Array.from(tableEl.querySelectorAll("tbody tr")).map(tr => {
        const tds = Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim());
        return tds.filter((_, idx) => !excludeIdx.has(idx));
    });

    return { headers, rows };
}

// Exportar a Excel
export async function exportTableToExcel(tableEl, fileName = "tabla") {
    const { headers, rows } = getTableMatrix(tableEl);

    // Pequeña pausa para evitar bloqueo de interfaz
    await new Promise(resolve => setTimeout(resolve, 0));

    const worksheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}.xlsx`);
}

// Exportar a PDF
export async function exportTableToPDF(tableEl, fileName = "tabla") {
    const { headers, rows } = getTableMatrix(tableEl);

    await new Promise(resolve => setTimeout(resolve, 0)); // alivio al hilo principal

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4", compress: true });
    doc.setFontSize(12);
    doc.text(fileName, 40, 40);

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 60,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`${fileName}.pdf`);
}

// Imprimir tabla
export function printTable(tableEl, title = "Tabla") {
    if (!tableEl) return;

    const { headers, rows } = getTableMatrix(tableEl, ["acciones", "alertas"]);

    const tableHTML = `
    <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>
        ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
    </tbody>
    </table>
`;

    const styles = `
    <style>
    body { font-family: Arial, Helvetica, sans-serif; padding: 16px; }
    h1 { font-size: 18px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; text-align: center; }
    thead th { background: #f1f3f5; }
    </style>
`;

    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`<!doctype html><html><head><meta charset="utf-8">${styles}</head><body>`);
    w.document.write(`<h1>${title}</h1>${tableHTML}</body></html>`);
    w.document.close();

    // Sincroniza la impresión suavemente
    requestAnimationFrame(() => {
        setTimeout(() => {
            w.print();
            setTimeout(() => w.close(), 200);
        }, 100);
    });
}
