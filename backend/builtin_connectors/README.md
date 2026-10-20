# DataBridge built-in connectors

Each folder is one connector shipped with DataBridge (no library download needed):

- `meta.json` — name, category, version, description, location column, default sync hints
- `manifest.yaml` — declarative connector definition, run by the shared connector runtime
- `icon.svg` — logo shown in the Connectors page

Every stream adds a `location_id` column (Toast restaurant GUID, Clover merchant ID, R365 location,
Revel establishment) so syncs can map rows to a business of a tenant (Data Hub › Tenants).

Incremental streams read in time windows from `start_date` (history) and then only records modified
since the last run (second precision, with a small look-back to catch late writes). The end of each
window is exclusive, so no record falls between two windows.
