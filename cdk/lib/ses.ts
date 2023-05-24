import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ses from 'aws-cdk-lib/aws-ses';

export class SesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

		const noReplyCfg = new ses.ConfigurationSet(this, 'no-reply', {
			// customTrackingRedirectDomain: 'track.cdk.dev',
			// suppressionReasons: ses.SuppressionReasons.COMPLAINTS_ONLY,
			// tlsPolicy: ses.ConfigurationSetTlsPolicy.REQUIRE,
			// dedicatedIpPool: myPool,
		});

		const identityDomain = new ses.EmailIdentity(this, 'Identity', {
			identity: ses.Identity.domain('webnt.dev'),
		});

		for (const record of identityDomain.dkimRecords) {
			// create CNAME records using `record.name` and `record.value`

		}

		const identityEmail = new ses.EmailIdentity(this, 'IdentityMail-NoReply', {
			identity: ses.Identity.email('no-reply@webnt.dev'),
			// mailFromDomain:
		});

		new cdk.CfnOutput(this, 'ses-cfg-no-reply', {
      value: noReplyCfg.configurationSetName,
      description: 'The name of the config property',
      exportName: 'ses-cfg-no-reply',
    });

		// throw new Error('Please change the domain and email identity');
	}


}
