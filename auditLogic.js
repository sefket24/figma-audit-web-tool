// auditLogic.js

// Traverses the Figma JSON tree and identifies layers with hardcoded colors
export function auditFigmaDocument(documentNode) {
    const nonCompliantLayers = [];

    function traverseNode(node) {
        // We only care about visual nodes that can have fills/strokes
        const hasFills = node.fills && Array.isArray(node.fills);
        const hasStrokes = node.strokes && Array.isArray(node.strokes);

        if (hasFills || hasStrokes) {
            const hardcodedColors = [];

            // Helper to check array of paints (fills/strokes) for hardcoded SOLID colors
            const checkPaints = (paints, typeContext) => {
                paints.forEach((paint, index) => {
                    // Only looking at SOLID colors for now.
                    // Gradients could also be checked, but the request emphasized Hex codes -> mostly SOLID.
                    if (paint.type === 'SOLID' && paint.color) {
                        
                        // Rule: A color is hardcoded if:
                        // 1. It does NOT have a bound variable for `color`
                        // 2. The node does NOT have a top-level style defined for this fill/stroke
                        
                        let isBoundToVariable = false;
                        if (paint.boundVariables && paint.boundVariables.color) {
                            isBoundToVariable = true;
                        }

                        // Styles are defined at the node level like: node.styles.fill = "StyleID"
                        // Or node.styles.stroke = "StyleID".
                        // Wait, if an individual paint within the array has a variable it's covered above.
                        // If the whole array is bound to a style, it might be in node.styles.
                        let isBoundToStyle = false;
                        if (node.styles) {
                            if (typeContext === 'fill' && node.styles.fill) isBoundToStyle = true;
                            if (typeContext === 'stroke' && node.styles.stroke) isBoundToStyle = true;
                        }

                        if (!isBoundToVariable && !isBoundToStyle) {
                            // This defines a "Hardcoded Value"
                            hardcodedColors.push({
                                type: typeContext, // 'fill' or 'stroke'
                                color: paint.color,
                                path: `${typeContext}[${index}]`
                            });
                        }
                    }
                });
            };

            if (hasFills) checkPaints(node.fills, 'fill');
            if (hasStrokes) checkPaints(node.strokes, 'stroke');

            if (hardcodedColors.length > 0) {
                nonCompliantLayers.push({
                    id: node.id,
                    name: node.name,
                    hardcodedColors: hardcodedColors,
                    rawNode: node
                });
            }
        }

        // Recursively check children
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => traverseNode(child));
        }
    }

    if (documentNode) {
        traverseNode(documentNode);
    }

    return nonCompliantLayers;
}
