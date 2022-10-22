# Rewriting status

This is essentially a list of the tech debt that should be addressed before any new features are added.

## Rewrite existing apps into Typescript

- [x] Misc utils

  - [x] date.utils
  - [x] general.utils
  - [x] log.utils
  - [x] network.utils

- [ ] Timesheet

  - [ ] timesheet.controller
  - [ ] timesheet.model
  - [ ] timesheet.router
  - [ ] timesheet.utils
  - [ ] Rename files to timesheet rather than timesheet**s**
  - [ ] Implement a consistent approach on how dates are handled
  - [ ] Unit tests: +90% coverage. Things often break in this app as it's dealing with time. Let's build a solid unit test suite.

- [ ] Pokemon
  - [ ] Evolution cycle is broken
  - [ ] API is showing [pokmeon]-candies but their assets no longer exist. Check if wepage exists before trying to download files - add this to network.utils
  - [ ] Remove introduction screen with only Black/White on it - find something else.
  - [ ] Remove unused pokedex route
- [ ] Energy

  - [ ] /energy/bills shows costs as pennies in graph when it's supposed to be whole pounds as labelled.

- [ ] Testing
  - [ ] Actually solid unit test suite to have some level regression testing
  - [ ] Smoke test every route
  - [ ] Maybe find a way to run them on VPS or generally in the pipeline somehow?

# New feature ideas

### Dark Mode

But make sure that it takes the device's settings into account. Possibly a challenge for how the energy app will deal with this given chartJS

### API for Timesheet

That would lay a foundation to enable a mobile app being written, and for this to become a standalone app.

### API for Energy and Bin Ingest

It would be great if fetching new data from the various sources could be off-loaded to a worker Pi or something in the future that would call this at scheduled times. That would decrease the inital load times for the day.
