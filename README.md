# OpenTicket

Let's build an open source, low commission\* event ticket distribution and marketplace.

\* - OpenTicket will always have roundtrip commission `< Max(0.25, 0.025 * TICKET_PRICE)` where roundtrip is fees accumulated by both the buyer and seller of a ticket. This means if the ticket sells for $10 or less, the roundtrip fee will be at most $0.25, and any ticket sales above $10 will have a roundtrip fee of 2.5% of the ticket sale price. **This is a long term promise, OpenTicket will have 0 commission until the maintenance and upkeep costs are not sustainable.**

## Ticket Distribution

Connect with entertainers and venues to generate, (re-)sell, and distribute tickets.

**Basic requirements**

- Generate tickets for set of seat identifiers.
  - Seat mapping.
  - General admission.
  - VIP/Add-ons.
- Sell tickets to users.
  - Payment processing.
  - Ticket delivery.
- Validate tickets at venue.
  - Administrator interface for scanning tickets.
  - Local (on-device) database for ticket authentication.

## Marketplace

Buy and sell tickets from OpenTicket and other ticket distributors.

**Basic Requirements**

- Resell OpenTicket generated tickets.
- Resell tickets from third-party vendors.
