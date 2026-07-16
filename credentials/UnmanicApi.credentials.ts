import { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class UnmanicApi implements ICredentialType {
	name = 'unmanicApi';

	displayName = 'Unmanic API';

	icon = 'file:unmanicApi.svg' as const;

	documentationUrl = 'https://docs.unmanic.app/';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://unmanic:8888',
			required: true,
			description: 'Base URL of the Unmanic instance (e.g. http://unmanic:8888). No trailing slash.',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/unmanic/api/v2/version/read',
		},
	};
}
