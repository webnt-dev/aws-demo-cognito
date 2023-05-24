import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'node:path';
export class AppSync1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

		const api = new appsync.GraphqlApi(this, 'Api', {
			name: 'demo',
			schema: appsync.SchemaFile.fromAsset(path.join(__dirname, 'appsync1.graphql')),
			authorizationConfig: {
				defaultAuthorization: {
					// authorizationType: appsync.AuthorizationType.IAM,
					authorizationType: appsync.AuthorizationType.USER_POOL,
					userPoolConfig: {
						userPool: cognito.UserPool.fromUserPoolArn(this, 'userPool1', cdk.Fn.importValue('cognito1-userPool'))
					}
				},
			},
			xrayEnabled: true,
		});

		const demoTable = new dynamodb.Table(this, 'DemoTable', {
			partitionKey: {
				name: 'id',
				type: dynamodb.AttributeType.STRING,
			},
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
		});

		const tablePolicy = new iam.ManagedPolicy(
			this, 'DynamoDBPolicy', {
				path: '/appsync/',
				document: new iam.PolicyDocument({
					statements: [
						new iam.PolicyStatement({
							effect: iam.Effect.ALLOW,
							actions: [
								'dynamodb:GetItem',
								'dynamodb:PutItem',
								'dynamodb:Scan'
							],
							resources: [demoTable.tableArn],
						})
					]
				})
			}
		);

		const demoDSRole = new iam.Role(this, 'AppsyncRole', {
			assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
			managedPolicies: [tablePolicy],
		});

		const demoDS = new appsync.DynamoDbDataSource(this, 'demoDataSource', {
			table: demoTable,
			api,
			serviceRole: demoDSRole.withoutPolicyUpdates(),
		});



		// https://dev.to/aws-builders/exploring-aws-cdk-aws-appsync-and-amazon-dynamodb-n0


		// Resolver for the Query "getDemos" that scans the DynamoDb table and returns the entire list.
		// Resolver Mapping Template Reference:
		// https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html
		demoDS.createResolver('QueryGetDemosResolver', {
			typeName: 'Query',
			fieldName: 'getDemos',
			requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
			responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
		});

		demoDS.createResolver('QueryGetDemoResolver', {
			typeName: 'Query',
			fieldName: 'getDemo',
			requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('id', 'id'),
			responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
		});

		// Resolver for the Mutation "addDemo" that puts the item into the DynamoDb table.
		demoDS.createResolver('MutationAddDemoResolver', {
			typeName: 'Mutation',
			fieldName: 'addDemo',
			// THERE ARE PREDEFINED VERSIONS
			// requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
			// 	appsync.PrimaryKey.partition('id').auto(),
			// 	appsync.Values.projecting('input'),
			// ),
			requestMappingTemplate: appsync.MappingTemplate.fromString(`
			{
				"version" : "2018-05-29",
				"operation" : "PutItem",
				"key": {
						"id" : $util.dynamodb.toDynamoDBJson($util.autoId()),
				},
				"attributeValues" : {
					"version" : $util.dynamodb.toDynamoDBJson($ctx.args.input.version),
					"created" : $util.dynamodb.toDynamoDBJson($util.time.nowISO8601())
				}
			}
			`),
			responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
		});



		// //To enable DynamoDB read consistency with the `MappingTemplate`:
		// demoDS.createResolver('QueryGetDemosConsistentResolver', {
		// 	typeName: 'Query',
		// 	fieldName: 'getDemosConsistent',
		// 	requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(true),
		// 	responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
		// });

	}
}
