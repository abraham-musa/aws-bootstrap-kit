
import {Construct} from 'constructs';
import * as core from "aws-cdk-lib";
import {CrossAccountZoneDelegationRecordProvider} from "./cross-account-zone-delegation-record-provider";

export interface CrossAccountZoneDelegationRecordProps {
    targetAccount?: string;
    targetRoleToAssume?: string;
    targetHostedZoneId?: string;
    recordName: string;
    toDelegateNameServers: string[];
    currentAccountId: string;
}

/**
 * Create a NS zone delegation record in the target account
 */
export class CrossAccountZoneDelegationRecord extends Construct {

    constructor(scope: Construct, id: string, props: CrossAccountZoneDelegationRecordProps) {
        super(scope, id);

        const { targetAccount, targetRoleToAssume } = props;
        const roleArnToAssume = targetAccount && targetRoleToAssume ?
        `arn:aws:iam::${targetAccount}:role/${targetRoleToAssume}`
        :undefined;

        const stack = core.Stack.of(this);
        const crossAccountZoneDelegationRecordProvider = new CrossAccountZoneDelegationRecordProvider(
            stack,
            'CrossAccountZoneDelegationRecordProvider',
            roleArnToAssume,
        );

        new core.CustomResource(
            this,
            `CrossAccountZoneDelegationRecord-${props.recordName}`,
            {
                serviceToken: crossAccountZoneDelegationRecordProvider.provider.serviceToken,
                resourceType: "Custom::CrossAccountZoneDelegationRecord",
                properties: {
                    ...props
                },
            }
        );

    }
}
