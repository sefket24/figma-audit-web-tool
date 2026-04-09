// csvExport.js
import { rgbaToHex } from './app.js';

export function exportToCsv(layers, fileKey) {
    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Layer ID,Layer Name,Type,Hardcoded Hex\n";

    layers.forEach(layer => {
        // Escape quotes and commas in layer name
        let safeName = layer.name ? layer.name.replace(/"/g, '""') : 'Unnamed';
        if (safeName.includes(',') || safeName.includes('\n') || safeName.includes('\r')) {
            safeName = `"${safeName}"`;
        }
        
        layer.hardcodedColors.forEach(colorInfo => {
            const hex = rgbaToHex(colorInfo.color.r, colorInfo.color.g, colorInfo.color.b, colorInfo.color.a);
            csvContent += `${layer.id},${safeName},${colorInfo.type},${hex}\n`;
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Figma-Audit-${fileKey}-${dateStr}.csv`);
    document.body.appendChild(link); // Required for FF
    
    link.click();
    document.body.removeChild(link);
}
