# S3toIDoc

This is a tutorial project on how to push IDocs from S3 to SAP through [Callable](https://callable.cloud).

# S3 Object to SAP IDoc transfer

This project demos an upload from an S3 object into and SAP system as IDoc. 

## How to deploy

Requirement before deploying:
* a running instance of Callable
    * see deployment instruction [AWS Fargate](https://beta.callable.cloud/docs/gettingstarted-aws-fargate.html)
    * see deployment instruction [GCP Cloud Run](https://beta.callable.cloud/docs/gettingstarted-gcp-cloudrun.html)
    * see deployment instruction [Azure ACI](https://beta.callable.cloud/docs/gettingstarted-azure-aci.html)
* an AWS account where you can deploy AWS CloudFormation templates
* an     S3 bucket to host the deployment artifacts
* get the Idoc Reference from Callable
    * open the Callable Resource Index in your browser
    * the URI presented here is the Idoc reference used late on. e.g. "BUPAFS_FS_CREATE_FRM_DATA01/BUPA_FS_CREATE_FRM_DATA"

Proceedings:
* checkout the repository
* deploy the cloudformation template
```
aws cloudformation create-stack --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --stack-name s3idoc \
    --template-body=file://template.yml \
    --parameters \
   ParameterKey=CallableEndpoint,ParameterValue={Callable endpoint} \
    ParameterKey=CallableUser,ParameterValue={Callable authentication user} \
    ParameterKey=CallablePassword,ParameterValue={Callable authentication password} \
    ParameterKey=IdocReference,ParameterValue={Callable IDoc reference}
```

## How to use it

First, fetch the S3 bucket that is not attached as Source Bucket.

```
aws cloudformation describe-stacks --stack-name s3idoc
```
```
{
    "Stacks": [
        {
            "StackId": "arn:aws:cloudformation:eu-west-1:714738665598:stack/s3idoc/2b7deb10-3472-11ea-be5b-06ac9a67575a",
            "StackName": "s3idoc",
...
            "Outputs": [
                {
                    "OutputKey": "IdocBucket",
                    "OutputValue": "s3idoc-idocbucket-12omcw159qbmq"
                }
            ],
...
        }
    ]
}
```

Now you can upload an Idoc in JSON format into the bucket.

The sample provided is a JSON which target the ```BUPAFS_FS_CREATE_FRM_DATA01/BUPA_FS_CREATE_FRM_DATA``` IDoc.

```
aws s3 cp sampleidoc.json s3://s3idoc-idocbucket-12omcw159qbmq/
```

Now you can check in cloudwatch for the following log entries.
```
2020-01-15T09:45:45.036Z	87f8f67d-e0c4-4f43-a8e8-083f3f52f8ca	INFO	STATUS: 200
2020-01-15T09:45:45.037Z	87f8f67d-e0c4-4f43-a8e8-083f3f52f8ca	INFO	
{
    "TID": "AC1F241E1CD05E1EDF480146"
}
```

