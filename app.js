// Figma-to-JSON Design System Audit Tool
// Entry logic

import { fetchFigmaFile } from './figmaApi.js';
import { auditFigmaDocument } from './auditLogic.js';
import { exportToCsv } from './csvExport.js';

// DOM Elements
const figmaKeyInput = document.getElementById('figma-file-key');
const figmaPatInput = document.getElementById('figma-pat');
const runAuditBtn = document.getElementById('btn-run-audit');
const downloadCsvBtn = document.getElementById('btn-download-csv');

const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const errorMessageEl = document.getElementById('error-message');

const layersListEl = document.getElementById('layers-list');
const layerCountEl = document.getElementById('layer-count');
const emptyStateEl = document.getElementById('empty-state');

const debuggerPlaceholder = document.getElementById('debugger-placeholder');
const jsonDebuggerEl = document.getElementById('json-debugger');

// State
let nonCompliantLayers = [];
let activeLayerId = null;

// Utility: syntax highlighting for JSON
function syntaxHighlightJSON(jsonStr) {
    if (typeof jsonStr !== 'string') {
         jsonStr = JSON.stringify(jsonStr, undefined, 2);
    }
    jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

// Convert 0-1 rgb to 0-255 hex
export function rgbaToHex(r, g, b, a = 1) {
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    if (a < 1) {
       return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`.toUpperCase(); 
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}


function setStatus(state, message) {
    statusDot.className = 'dot ' + state;
    if (message) statusText.textContent = message;
    
    if (state === 'error' && message) {
        errorMessageEl.textContent = message;
        errorMessageEl.classList.remove('hidden');
    } else {
        errorMessageEl.classList.add('hidden');
    }
}

function renderLayersList() {
    layerCountEl.textContent = nonCompliantLayers.length;
    
    if (nonCompliantLayers.length === 0) {
        layersListEl.innerHTML = '';
        layersListEl.appendChild(emptyStateEl);
        emptyStateEl.style.display = 'flex';
        downloadCsvBtn.disabled = true;
        return;
    }

    layersListEl.innerHTML = '';
    downloadCsvBtn.disabled = false;

    nonCompliantLayers.forEach(layer => {
        const item = document.createElement('div');
        item.className = `layer-item ${activeLayerId === layer.id ? 'active' : ''}`;
        item.dataset.id = layer.id;
        
        let swatchesHTML = '';
        layer.hardcodedColors.forEach(colorInfo => {
            const hex = rgbaToHex(colorInfo.color.r, colorInfo.color.g, colorInfo.color.b, colorInfo.color.a);
            swatchesHTML += `
                <div class="color-swatch-item" title="${colorInfo.path}">
                    <div class="color-preview" style="background-color: ${hex}"></div>
                    <span class="color-hex">${hex}</span>
                    <span class="color-type">${colorInfo.type}</span>
                </div>
            `;
        });

        item.innerHTML = `
            <div class="layer-header">
                <span class="layer-name">${layer.name}</span>
                <span class="layer-id">${layer.id}</span>
            </div>
            <div class="color-swatch-container">
                ${swatchesHTML}
            </div>
        `;

        item.addEventListener('click', () => {
            activeLayerId = layer.id;
            renderLayersList(); // updates active class
            showLayerInDebugger(layer);
        });

        layersListEl.appendChild(item);
    });
}

function showLayerInDebugger(layer) {
    debuggerPlaceholder.classList.add('hidden');
    jsonDebuggerEl.classList.remove('hidden');
    // We only show the layer object's properties minus its huge children arrays
    // to focus on the structure without freezing the UI.
    const displayObj = { ...layer.rawNode };
    if (displayObj.children) {
        displayObj.children = `[... ${displayObj.children.length} child nodes omitted for debugger clarity ...]`;
    }
    
    const formattedJson = JSON.stringify(displayObj, null, 2);
    jsonDebuggerEl.innerHTML = syntaxHighlightJSON(formattedJson);
}


function extractFileKey(input) {
    try {
        const url = new URL(input);
        const match = url.pathname.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/);
        if (match) return match[1];
    } catch (_) {}
    return input;
}

async function handleAuditRun() {
    const fileKey = extractFileKey(figmaKeyInput.value.trim());
    const pat = figmaPatInput.value.trim();

    if (!fileKey || !pat) {
        setStatus('error', 'Please provide both File Key and PAT');
        return;
    }

    // Reset UI
    nonCompliantLayers = [];
    activeLayerId = null;
    jsonDebuggerEl.classList.add('hidden');
    debuggerPlaceholder.classList.remove('hidden');
    renderLayersList();

    try {
        runAuditBtn.disabled = true;
        runAuditBtn.textContent = 'Auditing...';
        setStatus('connecting', 'Connecting to Figma Cloud...');

        // 1. Fetch File
        const data = await fetchFigmaFile(fileKey, pat);
        
        setStatus('connected', 'Connected! Processing file...');

        // 2. Audit logic
        nonCompliantLayers = auditFigmaDocument(data.document);

        // 3. Update UI
        renderLayersList();
        
        setStatus('connected', `Analyzed file successfully.`);
        
    } catch (error) {
        console.error(error);
        setStatus('error', error.message);
    } finally {
        runAuditBtn.disabled = false;
        runAuditBtn.textContent = 'Run Audit';
    }
}

// Event Listeners
runAuditBtn.addEventListener('click', handleAuditRun);
downloadCsvBtn.addEventListener('click', () => {
    if (nonCompliantLayers.length > 0) {
        exportToCsv(nonCompliantLayers, figmaKeyInput.value.trim());
    }
});
