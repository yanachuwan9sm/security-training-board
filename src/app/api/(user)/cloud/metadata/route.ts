import { NextResponse } from 'next/server';

// クラウドメタデータAPIを模倣したエンドポイント（実際のAWSメタデータサービスのような振る舞いを想定）
export async function GET() {
  try {
    // 実際のクラウド環境では機密情報が含まれる
    const fakeMetadata = {
      "instanceId": "i-0abc123def456789",
      "instanceType": "t3.medium",
      "region": "us-east-1",
      "availabilityZone": "us-east-1a",
      "privateIp": "10.0.1.123",
      "accountId": "123456789012",
      "credentials": {
        "accessKeyId": "AKIA1234567890EXAMPLE",
        "secretAccessKey": "secretKey1234567890ExampleKeyForTraining",
        "token": "IQoJb3JpZ2luX2VjEJz...EXAMPLE_TOKEN",
        "expiration": "2023-12-31T23:59:59Z"
      },
      "roles": [
        {
          "name": "app-server-role",
          "arn": "arn:aws:iam::123456789012:role/app-server-role"
        }
      ],
      "securityGroups": [
        "sg-0abc123def456789",
        "sg-0abc123def456790"
      ]
    };
    
    return NextResponse.json(fakeMetadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// トークンエンドポイントを模倣
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Aws-Ec2-Metadata-Token': 'TRAINING-METADATA-TOKEN-1234567890',
      'X-Aws-Ec2-Metadata-Token-Ttl-Seconds': '21600'
    }
  });
}