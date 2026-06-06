import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ApifyApi implements ICredentialType {
	name = 'apifyApi';

	displayName = 'Apify API';

	documentationUrl = 'https://docs.apify.com/platform/integrations/api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your personal Apify API token. Find it in Apify Console → Settings → Integrations → API token. A free account includes monthly usage credits.',
		},
	];

	// Sends the token as a Bearer header on every request made by the node.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	// Lets n8n verify the token from the credential screen.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.apify.com/v2',
			url: '/users/me',
		},
	};
}
