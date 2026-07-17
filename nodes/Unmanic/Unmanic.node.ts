import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeConnectionTypes,
} from 'n8n-workflow';

export class Unmanic implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Unmanic',
		name: 'unmanic',
		icon: { light: 'file:unmanic.svg', dark: 'file:unmanic.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Query your Unmanic library optimizer through its API',
		defaults: { name: 'Unmanic' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'unmanicApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Get Version', value: 'getVersion', action: 'Get the version' },
					{ name: 'Get Workers Status', value: 'getWorkers', action: 'Get the workers status' },
				],
				default: 'getVersion',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const URL_BY_OP: Record<string, string> = {
			getVersion: '/unmanic/api/v2/version/read',
			getWorkers: '/unmanic/api/v2/workers/status',
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const credentials = await this.getCredentials('unmanicApi', i);
				const baseURL = (credentials.baseUrl as string).replace(/\/+$/, '');
				const operation = this.getNodeParameter('operation', i) as string;

				const options: IHttpRequestOptions = {
					method: 'GET' as IHttpRequestMethods,
					baseURL,
					url: URL_BY_OP[operation],
					json: true,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'unmanicApi',
					options,
				);

				returnData.push({
					json: (typeof response === 'object' && response !== null
						? response
						: { result: response }) as IDataObject,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
