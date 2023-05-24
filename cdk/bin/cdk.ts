#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Cognito1Stack } from '../lib/cognito1';
import { AppSync1Stack } from '../lib/appsync1';
import { SesStack } from '../lib/ses';
import { Cognito2Stack } from '../lib/cognito2';
import { AppSync2Stack } from '../lib/appsync2';
import { Cognito3Stack } from '../lib/cognito3';
import { Cognito4Stack } from '../lib/cognito4';

const app = new cdk.App();
// new CdkStack(app, 'CdkStack', {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */

//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });

new Cognito1Stack(app, 'Cognito1');
new SesStack(app, 'Ses');
new AppSync1Stack(app, 'AppSync1');
new Cognito2Stack(app, 'Cognito2');
new AppSync2Stack(app, 'AppSync2');
new Cognito3Stack(app, 'Cognito3');
new Cognito4Stack(app, 'Cognito4');

