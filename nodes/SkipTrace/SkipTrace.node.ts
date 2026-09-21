import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

// Apify actor that does the real work (runs server-side, billed pay-per-event).
const ACTOR_ID = 'apivault_labs~skip-trace-people-finder';

export class SkipTrace implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Skip Trace',
		name: 'skipTrace',
		icon: 'file:skiptrace.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["searchBy"]}}',
		description:
			'Run authorized US public-record lookups by name, address, phone, or email and return review-ready results.',
		defaults: {
			name: 'Skip Trace',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Name',
						value: 'name',
						description: 'Find a person by full name (optionally narrowed by location)',
						action: 'Search by name',
					},
					{
						name: 'Address',
						value: 'address',
						description: 'Find people associated with a street address',
						action: 'Search by address',
					},
					{
						name: 'Phone',
						value: 'phone',
						description: 'Reverse-lookup a US phone number',
						action: 'Search by phone',
					},
					{
						name: 'Email',
						value: 'email',
						description: 'Reverse-lookup an email address you are authorized to process',
						action: 'Search by email',
					},
				],
				default: 'name',
			},
			{
				displayName: 'Name',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Jane Example; Springfield, IL',
				description:
					'Full name to look up. Optionally add a location after a semicolon to narrow results.',
				displayOptions: { show: { searchBy: ['name'] } },
			},
			{
				displayName: 'Address',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: '123 Example Ave; Springfield, IL 62704',
				description: 'Street address with city, state, ZIP. Finds people associated with it.',
				displayOptions: { show: { searchBy: ['address'] } },
			},
			{
				displayName: 'Phone Number',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: '(202) 555-0182',
				description: 'US phone number to reverse-lookup',
				displayOptions: { show: { searchBy: ['phone'] } },
			},
			{
				displayName: 'Email',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'jane@example.com',
				description: 'Email address to reverse-lookup',
				displayOptions: { show: { searchBy: ['email'] } },
			},
			{
				displayName: 'Output Preset',
				name: 'outputPreset',
				type: 'options',
				options: [
					{
						name: 'Contacts (Recommended)',
						value: 'contacts',
						description: 'Compact fields for AI, CRM, and manual review',
					},
					{
						name: 'Flat Spreadsheet',
						value: 'flat',
						description: 'Spreadsheet-friendly values',
					},
					{
						name: 'Full',
						value: 'full',
						description: 'Complete public result when available',
					},
				],
				default: 'contacts',
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 1000 },
				default: 3,
				description: 'How many matched people to return per query',
			},
			{
				displayName: 'Verify Email Deliverability',
				name: 'verifyEmails',
				type: 'boolean',
				default: true,
				description: 'Whether to add an email-domain deliverability signal when email data is available',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const searchBy = this.getNodeParameter('searchBy', i) as string;
				const query = this.getNodeParameter('query', i) as string;
				const outputPreset = this.getNodeParameter('outputPreset', i) as string;
				const maxResults = this.getNodeParameter('maxResults', i) as number;
				const verifyEmails = this.getNodeParameter('verifyEmails', i) as boolean;
				// Map the chosen search field to the actor's input arrays.
				const body: Record<string, unknown> = {
					workflow: searchBy,
					max_results: maxResults,
					outputPreset,
					verifyEmails,
					useDemoOnEmpty: false,
				};
				if (searchBy === 'name') body.name = [query];
				else if (searchBy === 'address') body.street_citystatezip = [query];
				else if (searchBy === 'phone') body.phone_number = [query];
				else if (searchBy === 'email') body.email = [query];

				const options: IRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					url: `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
					body,
					json: true,
				};

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'apifyApi',
					options,
				);

				const results = Array.isArray(response) ? response : [response];
				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
