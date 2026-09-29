# Neon Birthday Invitation

Static, responsive Arabic birthday invitation based on the supplied Neon template and reference invitation.

## Edit event details

Update `event-config.js`. It holds the event date, names, venue, timeline, notes, contact destination, and asset paths in one place.

## Run locally

Serve this directory over HTTP (for example, `python3 -m http.server 8000`) and open `http://localhost:8000`. The invitation uses JavaScript for the opening animation and interactive sections.

RSVP details are placed into a prefilled WhatsApp message addressed to the number in the config. The page does not submit or store guest data itself. Background music uses the template's YouTube player and depends on YouTube access and browser autoplay policies.
