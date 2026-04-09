import { getMockFigmaDocument } from './mockData.js';

export async function fetchFigmaFile(fileKey, pat) {
    // Intercept mock request
    if (fileKey.toLowerCase() === 'demo' && pat.toLowerCase() === 'demo') {
        // Add artificial delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        return getMockFigmaDocument();
    }

    const url = `https://api.figma.com/v1/files/${fileKey}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Figma-Token': pat,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Human-readable error messages for common HTTP statuses
            if (response.status === 404) {
                throw new Error('404 Not Found: Could not find the Figma file. Check the File Key.');
            }
            if (response.status === 403) {
                throw new Error('403 Forbidden: Invalid Personal Access Token (PAT) or lack of permissions.');
            }
            if (response.status === 429) {
                throw new Error('429 Rate Limited: Too many requests to the Figma API. Please try again later.');
            }
            if (response.status >= 500) {
                throw new Error('500+ Error: Figma servers are currently experiencing issues.');
            }
            
            // Fallback for other codes
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Figma API Error (${response.status}): ${errData.err || 'Unknown error'}`);
        }

        return await response.json();

    } catch (error) {
        // Re-throw so the app can catch and show the message in the UI
        throw error;
    }
}
