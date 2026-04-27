# Role-Based Permission Test Generation — Exploration Report

**Date:** 2026-04-22
**Exploration Role:** Reception (`testemp`)

## 1. Security Findings (Discrepancies)

**Medium Severity:**
*   **Customer Relation Management > Client Profile (`customer_relation_management_client_profile`):**
    *   **Action:** Create
    *   **Expected:** `false` (Read-only access per the `roles-permissions.json` spec).
    *   **Observed:** A `+ New Client` button was observed in the UI for the Reception role.
    *   **Action Required:** Needs manual verification to check if the button is actually clickable and functional, or merely disabled/styled to look active. If functional, this is a **HIGH severity** permission bug allowing unauthorized data creation.

## 2. Coverage Summary

*   **Roles Explored:** 1 of 16 roles mapped (Reception). Additionally, the Compilation role was briefly used for initial orientation.
*   **Modules Mapped:** 7 of 7 expected modules for the Reception role have been fully mapped with Page Objects (`Dashboard`, `Reception Receive Sample`, `Received Sample`, `Client Profile`, `Mailer`, `Ticket`, `Indent`).
*   **Permission Checks Verified:** 35 total checks executed for the Reception role.
    *   **Matches (Expected == Observed):** 30
    *   **Discrepancies:** 1 (Client Profile create button)
    *   **Unverifiable (Requires Data Setup):** 4 (Update/Delete workflows where tables were empty or lacked location-specific data).

## 3. Open Questions & Blockers

*   **Location-Gated Approvals:** In the `Sample Management > Reception Receive Sample` module, the `Approve` button is location-gated. The `testemp` account saw a message: *"You do not have access to this client location. Actions are not available."* To fully automate the `approve` test, we need test data (a sample record) explicitly assigned to the `testemp` user's location, or a mock to bypass this check.
*   **Empty Tables:** Several modules (`Ticket`, `Indent`) were empty during exploration. To verify `update` and `delete` affordances, the test environment needs to be seeded with initial data, or the tests will safely skip these specific checks (as currently implemented).
*   **Unmapped Modules in UI:** The sidebar for Reception showed modules not present in the expected JSON matrix (e.g., `Archive Samples`, `Sample Discarded`, `Sample Discard Report`). These are noted but currently skipped in the tests.

## 4. Selector Quality Warnings

**CRITICAL:** The entire application lacks `data-cy` or `data-testid` attributes.

*   **Fragile Selectors Used:** Page Objects currently rely heavily on button text (`button:contains('Walk-in Sample')`) and generic Tailwind classes (`div.animate-slide-in-right`).
*   **Recommendation:** The development team **must** add stable `data-cy` attributes to all interactive elements (buttons, inputs, row checkboxes, slide-over panels). Text-based selectors will break if copy changes or multi-language support is added.

## 5. Recommended Next Steps

1.  **Investigate Security Finding:** Manually check if the `+ New Client` button on the Client Profile page is functional for the Reception role. Fix immediately if it is.
2.  **Add `data-cy` Attributes:** Dev team should add test IDs to the application, starting with the 7 modules mapped for Reception. Once added, the Page Objects can be easily updated.
3.  **Seed Test Data:** Ensure the test database has records for Tickets, Indents, and Location-matched Samples so the "Update" and "Delete" test blocks can execute fully instead of being skipped.
4.  **Expand Role Coverage:** Proceed with mapping the remaining 15 roles following the same structured approach, creating Page Objects for any new modules encountered.
