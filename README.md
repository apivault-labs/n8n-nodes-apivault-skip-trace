# Skip Trace for n8n

An n8n community node for authorized name, address, phone and email lookups through the hosted [Skip Trace Actor](https://apify.com/apivault_labs/skip-trace-people-finder).

> **Lawful use only.** This is not a consumer-reporting service. Do not use the data for credit, employment, housing, insurance, tenant screening or other FCRA-regulated decisions. Verify important information independently.

## Install

In n8n, open **Settings → Community Nodes**, choose **Install**, and enter:

```text
n8n-nodes-apivault-skip-trace
```

Create an Apify API credential in n8n and select it in the node.

## Supported workflows

- search by name and optional location;
- find people associated with an address;
- reverse phone lookup;
- reverse email lookup;
- compact Contacts output for review queues;
- Flat spreadsheet output;
- Full public result when available.

Start with 1–3 results and review matches before increasing the limit.

## Pricing

- **$6.50 per 1,000 delivered matched-person records**;
- unmatched queries have no result charge;
- the small Actor Start charge and Apify platform usage may still apply;
- this package adds no subscription fee.

## Ready-to-import workflow

Import [`examples/quickstart-workflow.json`](examples/quickstart-workflow.json). It uses fictional sample data, requests compact Contacts output, and prepares each successful row for manual review before CRM import.

Replace the sample only with information you are authorized to process. A confidence score prioritizes review; it must not make an eligibility or identity decision automatically.

Read the complete [review-first contact-enrichment playbook](https://github.com/apivault-labs/skip-trace-people-finder-python/blob/main/guides/review-first-contact-enrichment.md).

## What the package contains

The node starts the hosted Actor and returns its structured Dataset rows. It does not contain data-collection implementation, private sources, credentials or infrastructure configuration.

## Resources

- [Skip Trace on Apify](https://apify.com/apivault_labs/skip-trace-people-finder)
- [Python SDK and use case](https://github.com/apivault-labs/skip-trace-people-finder-python)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
