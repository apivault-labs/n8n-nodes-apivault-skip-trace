# n8n-nodes-apivault-skip-trace

An [n8n](https://n8n.io) community node for **Skip Trace** — find hard-to-locate people in the US by **name, address, or phone** and get back full names, age, current and previous addresses, phone numbers, emails, relatives, aliases, and a public profile link.

Pay-as-you-go, no monthly subscription. The heavy lifting runs server-side on [Apify](https://apify.com); this node is a thin connector that you drive with your own Apify API token.

> Built by **[apivault_labs](https://apify.com/apivault_labs)** — see [all our actors](https://apify.com/apivault_labs) (lead generation, e-commerce, profiles, AI image tools).

> **Lawful B2B use only.** Do not use this data for decisions covered by the FCRA (credit, employment, insurance, housing, or tenant screening).

## What you can do

- **Search by name** — optionally narrow by location (`Amalia Castillo; Dallas, TX 75228`)
- **Search by address** — find people associated with a street address
- **Reverse phone lookup** — identify the owner of a US phone number
- Two tiers: **Basic** (core contact data) and **Premium** (deep profile: line types, full address history, emails, relatives, aliases, net-worth estimate)

## Installation

In your n8n instance:

1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-apivault-skip-trace`
4. Confirm and install

For self-hosted n8n you can also run `npm install n8n-nodes-apivault-skip-trace` in your n8n custom-nodes folder.

## Credentials

This node uses an **Apify API token**:

1. Create a free account at [apify.com](https://apify.com)
2. Go to **Apify Console → Settings → Integrations** and copy your **API token**
3. In n8n, create new **Apify API** credentials and paste the token

A free Apify account includes monthly usage credits, so you can try it without a card.

## Pricing

Billed per result through Apify (pay-per-event):

| Tier | Price | Returns |
|------|-------|---------|
| Basic | **$7 / 1,000** | name, age, current address, phones, profile link |
| Premium | **$15 / 1,000** | everything in Basic + phone line types, full address history, emails, relatives, aliases, work/education hints, net-worth estimate |

You only pay for the people actually returned.

## Example output (Basic)

```json
{
  "name": "James E Whitsitt",
  "age": 58,
  "currentAddress": "2551 Pinebluff Dr, Dallas, TX 75228",
  "phones": ["(214) 321-5304"],
  "profileUrl": "https://radaris.com/p/James/Whitsitt/..."
}
```

## Use cases

- **Real-estate / investor outreach** — turn a property address into owner contacts
- **Debt collection & skip tracing** — relocate people who moved
- **B2B lead enrichment** — append phone/email to a name in your CRM
- **Fraud / identity checks** — confirm a phone number maps to a real person

## Resources

- [Skip Trace actor on Apify](https://apify.com/apivault_labs/skip-trace-people-finder)
- [All actors by apivault_labs](https://apify.com/apivault_labs) — lead-gen, e-commerce, profiles, AI image tools
- [Create a free Apify account](https://apify.com)
- [n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)

## Keywords

`skip-trace` `skip-tracing` `people-search` `people-finder` `reverse-phone-lookup` `address-lookup` `contact-finder` `lead-generation` `b2b-data` `real-estate-leads` `debt-collection` `n8n` `apify`
