import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ses from 'aws-cdk-lib/aws-ses';

export class SesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

		const noReplyCfg = new ses.ConfigurationSet(this, 'no-reply', {
		});

		// define whole domain as SES identity
		const identityDomain = new ses.EmailIdentity(this, 'Identity', {
			identity: ses.Identity.domain('webnt.dev'), // please replace with your own domain identity
		});

		for (const record of identityDomain.dkimRecords) {
			// create CNAME records using `record.name` and `record.value`
		}

		// define email as SES identity
		const identityEmail = new ses.EmailIdentity(this, 'IdentityMail-NoReply', {
			identity: ses.Identity.email('no-reply@webnt.dev'),
		});

		// define output that can be used by different stacks
		new cdk.CfnOutput(this, 'ses-cfg-no-reply', {
      value: noReplyCfg.configurationSetName,
      description: 'The name of the config property',
      exportName: 'ses-cfg-no-reply',
    });

		// throw new Error('Please change the domain and email identity');
	}


}
