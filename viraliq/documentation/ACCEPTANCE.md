# Device acceptance checklist

Run on Android and iOS before submission. These checks require a simulator/device and have not been claimed as executed by the desktop build.

- Fresh install: Home is empty; Generate explains research is required. Theme and mode persist after restart.
- Analyze the same topic with 1h and 7d, different media filters, and a custom keyword. Validate counts against Results, including no matches and partial samples.
- Save two datasets. Select the older dataset in History. Confirm Home, Results and Generate use its topic/count/date. Restart the process and confirm selection.
- Compare matching and mismatched datasets. Check warnings, sample counts and zero baseline labels.
- Generate 1, 3 and 5 local variations in all tones/lengths. Confirm the local-template label, edit, save, reopen, update and delete drafts. Check over-280 input disables saving/sharing.
- Open Copy, Share and X compose. Verify copied text and native target behavior. Cancel sharing; no publication confirmation should appear.
- Delete a dataset with saved drafts. Confirm source content is gone, active dataset falls back, and drafts remain editable with their original topic label.
- Switch Live with no backend. Confirm explanatory error and retained instructions. Start the proxy without keys, then repeat to validate configuration errors.
- With authorized service credentials, test valid search, 429/quota errors, hosted summary/generation and network loss. Confirm no automatic demo substitution.
- With a permitted short live-content TTL, inspect SQLite after expiry/resume. Exercise delete-by-ID and clear-content. Aggregate results must remain available.
- Test large text settings, screen reader labels, small screens, dark/light mode, keyboard overlap and keyboard dictation.
