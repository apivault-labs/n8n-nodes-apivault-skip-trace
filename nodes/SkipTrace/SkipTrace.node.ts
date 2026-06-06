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
			'Look up US people by name, address, or phone. Returns names, age, addresses, phones, emails, relatives, aliases and a public profile link.',
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
				],
				default: 'name',
			},
			{
				displayName: 'Name',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Amalia Castillo; Dallas, TX 75228',
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
				placeholder: '2551 Pinebluff Dr; Dallas, TX 75228',
				description: 'Street address with city, state, ZIP. Finds people associated with it.',
				displayOptions: { show: { searchBy: ['address'] } },
			},
			{
				displayName: 'Phone Number',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: '(214) 321-5304',
				description: 'US phone number to reverse-lookup',
				displayOptions: { show: { searchBy: ['phone'] } },
			},
			{
				displayName: 'Tier',
				name: 'tier',
				type: 'options',
				options: [
					{
						name: 'Basic ($7/1K)',
						value: 'basic',
						description: 'Name, age, current address, phones, profile link',
					},
					{
						name: 'Premium ($15/1K)',
						value: 'premium',
						description:
							'Deep profile: phone line types, full address history, emails, relatives, aliases, work/education hints, net-worth estimate',
					},
				],
				default: 'basic',
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 20 },
				default: 5,
				description: 'How many matched people to return per query',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Use Residential Proxy Fallback',
						name: 'useResidential',
						type: 'boolean',
						default: true,
						description:
							'Whether to fall back to residential IPs when the source blocks datacenter IPs (recommended; costs a fraction of a cent per run)',
					},
					{
						displayName: 'Max Parallel Lookups',
						name: 'maxConcurrency',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 8 },
						default: 4,
						description: 'How many lookups to run in parallel',
					},
					{
						displayName: 'Retries on Failure',
						name: 'maxRetries',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 3 },
						default: 2,
						description: 'Retry attempts when the source returns a transient anti-bot response',
					},
					{
						displayName: 'Timeout per Request (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: { minValue: 10, maxValue: 45 },
						default: 25,
						description: 'Max wait per page fetch',
					},
				],
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
				const tier = this.getNodeParameter('tier', i) as string;
				const maxResults = this.getNodeParameter('maxResults', i) as number;
				const extra = this.getNodeParameter('additionalOptions', i, {}) as {
					useResidential?: boolean;
					maxConcurrency?: number;
					maxRetries?: number;
					timeout?: number;
				};

				// Map the chosen search field to the actor's input arrays.
				const body: Record<string, unknown> = {
					tier,
					max_results: maxResults,
					useResidential: extra.useResidential ?? true,
					maxConcurrency: extra.maxConcurrency ?? 4,
					maxRetries: extra.maxRetries ?? 2,
					timeout: extra.timeout ?? 25,
				};
				if (searchBy === 'name') body.name = [query];
				else if (searchBy === 'address') body.street_citystatezip = [query];
				else if (searchBy === 'phone') body.phone_number = [query];

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
