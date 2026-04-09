export function getMockFigmaDocument() {
    return {
        "document": {
            "id": "0:0",
            "name": "Document",
            "type": "DOCUMENT",
            "children": [
                {
                    "id": "0:1",
                    "name": "Mock Design System",
                    "type": "CANVAS",
                    "children": [
                        {
                            "id": "24:128",
                            "name": "Primary Button (Non-Compliant)",
                            "type": "COMPONENT",
                            "fills": [
                                {
                                    "type": "SOLID",
                                    "color": { "r": 0.094, "g": 0.627, "b": 0.984, "a": 1 } 
                                }
                            ]
                            // Missing boundVariables - this will be flagged
                        },
                        {
                            "id": "24:132",
                            "name": "Secondary Button (Compliant)",
                            "type": "COMPONENT",
                            "fills": [
                                {
                                    "type": "SOLID",
                                    "color": { "r": 0.96, "g": 0.96, "b": 0.96, "a": 1 },
                                    "boundVariables": {
                                      "color": { "type": "VARIABLE_ALIAS", "id": "VariableID:001" }
                                    }
                                }
                            ]
                            // Has boundVariables - will NOT be flagged
                        },
                        {
                            "id": "25:01",
                            "name": "Alert Banner",
                            "type": "FRAME",
                            "fills": [
                                {
                                    "type": "SOLID",
                                    "color": { "r": 0.949, "g": 0.282, "b": 0.133, "a": 1 } 
                                }
                            ],
                            "strokes": [
                                {
                                    "type": "SOLID",
                                    "color": { "r": 0.8, "g": 0.2, "b": 0.1, "a": 1 }
                                }
                            ]
                            // Both fill and stroke are hardcoded
                        },
                        {
                            "id": "31:402",
                            "name": "Header Navigation",
                            "type": "FRAME",
                            "styles": {
                                "fill": "S:12345"
                            },
                            "fills": [
                                {
                                    "type": "SOLID",
                                    "color": { "r": 1, "g": 1, "b": 1, "a": 1 } 
                                }
                            ]
                            // Has a 'styles' reference, so it's compliant - will NOT be flagged
                        }
                    ]
                }
            ]
        }
    };
}
