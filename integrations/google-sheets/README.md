# Forms to Google Sheets

1. Create a Google Sheet (e.g. "Credtech website leads").
2. **Extensions > Apps Script**. Delete the sample code and paste `Code.gs`.
3. Set `NOTIFY_EMAIL` at the top (or `''` for no email alerts).
4. **Deploy > New deployment > Web app**. Execute as **Me**, access **Anyone**. Authorise when asked.
5. Copy the Web app URL (ends in `/exec`).
6. Put it in `content/site.json` under `forms.endpoint` (and optionally `forms.careersEndpoint`), or set env `CT_FORM_ENDPOINT`.
7. `npm run build` and upload `dist/`.

Each form (enquiry, audit, careers) lands in its own tab, with a `Received` timestamp and one column per field.

**After editing the script** use Deploy > Manage deployments > Edit > New version. The URL stays the same.

**Limits:** the careers form cannot upload CVs this way (Apps Script receives text fields only). Ask applicants to email CVs, or add a link field.
