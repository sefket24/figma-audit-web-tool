# Figma REST API Audit Dashboard

**A Support Engineering technical demonstration.**

This application is a standalone web dashboard designed to query the **Figma REST API (`GET /v1/files/:key`)** and programmatically audit an enterprise design file for "Design Drift." 

When teams detach components from the core Design System and resort to hard-coded HEX values rather than mapped Variables or Styles, sweeping design updates fail across massive organizational files.

## Features
* **Authentication:** Safely utilizes Personal Access Tokens (PATs) and handles expected network constraints (404 Not Found, 403 Forbidden, 429 Rate Limiting).
* **Deep JSON Traversal:** Recursively walks the entire un-flattened structural JSON scene graph returned by Figma's servers looking for violations.
* **Support Debugger view:** Clicking a violating layer opens a pane displaying the raw stringified JSON configuration of that specific node to easily provide layer ID context for support troubleshooting.
* **Mock Mode:** Included is a built-in sandbox mock dataset. By entering `demo` into both input fields, the app intercepts the external network request and provides a test JSON tree without requiring Figma file tokens.
* **CSV Export:** Support agents can click "Export Report" to instantly download a CSV compiling the non-compliant layers and their HEX codes.

## The Dual Approach
To demonstrate full knowledge of the Support Engineering ecosystem at Figma, this tool was built alongside a secondary implementation: **A Native Figma Plugin**. 
While this Repository proves understanding of *external* integrations, APIs, and rate limits, the Native Plugin demonstrates understanding of the sandboxed internal Figma Engine, the Canvas view, and the iframe-to-main-thread messaging architecture.
