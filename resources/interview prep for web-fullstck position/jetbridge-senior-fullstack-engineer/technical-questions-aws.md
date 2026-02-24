# Technical Questions: AWS / Cloud / Infrastructure (5 Questions)

> **JetBridge – Senior Fullstack Engineer (TypeScript)**
> Focus: AWS Lambda, CDK, S3, DynamoDB, serverless architecture, cost optimization, CI/CD

---

## Q1. Design a serverless API using AWS Lambda, API Gateway, and DynamoDB. Walk through the CDK infrastructure code.

**Why asked:** JetBridge uses AWS CDK + serverless extensively — tests hands-on cloud engineering ability.

**Answer:**

```typescript
// lib/api-stack.ts — AWS CDK (v2)
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB — single-table design with GSI
    const table = new dynamodb.Table(this, "UsersTable", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // cost-efficient for variable traffic
      pointInTimeRecovery: true, // disaster recovery
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Lambda — bundled with esbuild
    const handler = new nodejs.NodejsFunction(this, "ApiHandler", {
      entry: "src/handlers/api.ts",
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(29), // API GW max is 29s
      environment: {
        TABLE_NAME: table.tableName,
        NODE_OPTIONS: "--enable-source-maps",
      },
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ["@aws-sdk/*"], // use Lambda-provided SDK
      },
    });

    table.grantReadWriteData(handler); // least-privilege IAM

    // API Gateway
    const api = new apigw.RestApi(this, "UserApi", {
      restApiName: "User Service",
      deployOptions: {
        stageName: "prod",
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 500,
      },
    });

    const users = api.root.addResource("users");
    users.addMethod("GET", new apigw.LambdaIntegration(handler));
    users.addMethod("POST", new apigw.LambdaIntegration(handler));

    const user = users.addResource("{id}");
    user.addMethod("GET", new apigw.LambdaIntegration(handler));
    user.addMethod("PUT", new apigw.LambdaIntegration(handler));
    user.addMethod("DELETE", new apigw.LambdaIntegration(handler));

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
  }
}
```

**Lambda handler pattern:**

```typescript
// src/handlers/api.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const { httpMethod, pathParameters, body } = event;

  try {
    switch (`${httpMethod} ${event.resource}`) {
      case "GET /users/{id}":
        return getUser(pathParameters!.id!);
      case "POST /users":
        return createUser(JSON.parse(body!));
      default:
        return response(404, { message: "Not found" });
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    return response(500, { message: "Internal server error" });
  }
}

async function getUser(id: string): Promise<APIGatewayProxyResult> {
  const { Item } = await client.send(
    new GetCommand({ TableName: TABLE, Key: { PK: `USER#${id}`, SK: `PROFILE` } })
  );
  if (!Item) return response(404, { message: "User not found" });
  return response(200, Item);
}

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
```

**Key points:**
- **PAY_PER_REQUEST** billing = no capacity planning needed, pay per operation
- **Single-table design** with `PK/SK` and GSI — standard DynamoDB pattern
- `externalModules: ["@aws-sdk/*"]` — use Lambda runtime SDK, smaller bundles
- **29s timeout** — API Gateway hard limit; Lambda can go longer for async workloads
- `grantReadWriteData()` — CDK generates least-privilege IAM policy automatically

---

## Q2. How do you implement a CI/CD pipeline for a serverless TypeScript application? Walk through GitHub Actions + CDK deploy.

**Why asked:** Tests full-stack ownership — JetBridge expects engineers to own deployment, not just code.

**Answer:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  id-token: write  # OIDC for AWS auth (no long-lived keys)
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck     # tsc --noEmit
      - run: npm test -- --coverage

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci

      # OIDC — no AWS_ACCESS_KEY_ID needed
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: us-east-1

      - run: npx cdk diff    # preview changes
      - run: npx cdk deploy --require-approval never
```

**Key points:**
- **OIDC authentication** — no static AWS keys stored in GitHub Secrets
- `cdk diff` before `cdk deploy` — always preview infrastructure changes
- Pipeline: lint → typecheck → test → deploy (fail fast)
- **Environment protection rules** on `production` — require approval for prod deploys

---

## Q3. Explain AWS Lambda cold starts. How do you minimize them and when do you choose Lambda vs ECS/Fargate?

**Why asked:** Cost optimization and performance are key at JetBridge — tests understanding of serverless tradeoffs.

**Answer:**

**Cold start = Lambda initializing a new execution environment:**
1. Download code package (larger = slower)
2. Initialize runtime (Node.js ~200ms)
3. Run module-level code (imports, DB connections)

**Mitigation strategies:**

```typescript
// 1. Initialize outside handler (reuse across invocations)
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// 2. Provisioned Concurrency — pre-warm instances
// In CDK:
const alias = handler.addAlias("live");
new lambda.AutoScaling(this, "Scaling", {
  target: alias.addAutoScaling({ minCapacity: 5, maxCapacity: 50 }),
  // Scale based on utilization
});

// 3. Smaller bundles — tree-shake, externalize SDK
// bundling: { minify: true, externalModules: ["@aws-sdk/*"] }

// 4. Lazy imports for rarely-used heavy modules
export async function handler(event: any) {
  if (event.type === "pdf-generation") {
    const { generatePDF } = await import("./pdf-generator");
    return generatePDF(event);
  }
  // ... fast path doesn't pay for PDF import
}
```

**Lambda vs ECS/Fargate decision matrix:**

| Factor | Lambda | ECS/Fargate |
|--------|--------|-------------|
| **Request duration** | < 15 min | Long-running |
| **Traffic pattern** | Bursty/variable | Consistent high |
| **Cold start tolerance** | Acceptable | Not acceptable |
| **Cost at scale** | Expensive > 1M req/day | More predictable |
| **State** | Stateless only | Can use local state |
| **Connections** | Limited (1000 concurrent) | Persistent DB pools |

**Key points:**
- **Lambda = default choice** for API endpoints, event processing, scheduled tasks
- **Fargate** when you need persistent connections (WebSockets), >15min processing, or predictable high load
- Provisioned Concurrency costs ≈ $0.015/GB-hour — use only for latency-sensitive paths

---

## Q4. How do you implement observability for a cloud-native application? Cover logging, metrics, tracing, and alerting.

**Why asked:** JetBridge lists monitoring/observability as a key requirement — tests production maturity.

**Answer:**

```typescript
// 1. STRUCTURED LOGGING (JSON to CloudWatch)
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Add request context to every log line
  mixin: () => ({
    service: "user-api",
    environment: process.env.STAGE,
  }),
});

// Usage — always log structured data
logger.info({ userId, action: "login" }, "User logged in");
logger.error({ err, orderId }, "Payment processing failed");

// 2. CUSTOM METRICS (CloudWatch EMF)
import { createMetricsLogger, Unit } from "aws-embedded-metrics";

async function trackApiCall(path: string, statusCode: number, duration: number) {
  const metrics = createMetricsLogger();
  metrics.setNamespace("UserService");
  metrics.putDimensions({ Path: path, StatusCode: String(statusCode) });
  metrics.putMetric("Latency", duration, Unit.Milliseconds);
  metrics.putMetric("RequestCount", 1, Unit.Count);

  if (statusCode >= 500) {
    metrics.putMetric("ServerErrors", 1, Unit.Count);
  }
  await metrics.flush();
}

// 3. DISTRIBUTED TRACING (X-Ray)
import AWSXRay from "aws-xray-sdk-core";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Instrument SDK clients
const dynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));

// Add custom subsegments
const segment = AWSXRay.getSegment();
const subsegment = segment?.addNewSubsegment("validateInput");
try {
  await validateInput(data);
  subsegment?.close();
} catch (err) {
  subsegment?.addError(err as Error);
  subsegment?.close();
  throw err;
}

// 4. ALERTING (CDK)
const alarm = new cloudwatch.Alarm(this, "ErrorRate", {
  metric: handler.metricErrors({ period: cdk.Duration.minutes(5) }),
  threshold: 10,
  evaluationPeriods: 2,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
});
alarm.addAlarmAction(new cw_actions.SnsAction(alertTopic));
```

**Four Pillars:**
1. **Logs** — Structured JSON → CloudWatch Logs Insights queries
2. **Metrics** — EMF for custom metrics (latency p99, error rates, business KPIs)
3. **Traces** — X-Ray for distributed request flow visualization
4. **Alerts** — CloudWatch Alarms → SNS → PagerDuty/Slack

---

## Q5. How do you design an S3-based file upload system with presigned URLs, and handle large file uploads securely?

**Why asked:** S3 is ubiquitous at JetBridge — tests practical cloud patterns and security awareness.

**Answer:**

```typescript
// Backend: Generate presigned upload URL
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });

interface UploadRequest {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}

async function generateUploadUrl(
  userId: string,
  req: UploadRequest
): Promise<{ uploadUrl: string; fileKey: string }> {
  // Validate
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

  if (req.fileSizeBytes > MAX_SIZE) {
    throw new Error(`File too large. Max: ${MAX_SIZE} bytes`);
  }
  if (!ALLOWED_TYPES.includes(req.contentType)) {
    throw new Error(`Invalid content type: ${req.contentType}`);
  }

  // Use unique key to prevent overwrites
  const fileKey = `uploads/${userId}/${Date.now()}-${crypto.randomUUID()}/${req.fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.UPLOAD_BUCKET!,
    Key: fileKey,
    ContentType: req.contentType,
    ContentLength: req.fileSizeBytes,
    // Metadata for lifecycle/auditing
    Metadata: {
      "uploaded-by": userId,
      "original-name": req.fileName,
    },
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300, // 5 minutes
  });

  return { uploadUrl, fileKey };
}

// Frontend: Upload directly to S3
async function uploadFile(file: File, userId: string) {
  // 1. Get presigned URL from backend
  const { uploadUrl, fileKey } = await fetch("/api/upload-url", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSizeBytes: file.size,
    }),
  }).then((r) => r.json());

  // 2. Upload directly to S3 (bypasses backend)
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  return fileKey;
}

// CDK: S3 bucket with security
const uploadBucket = new s3.Bucket(this, "Uploads", {
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  versioned: true,
  lifecycleRules: [
    {
      id: "cleanup-incomplete-uploads",
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
    },
    {
      id: "move-to-ia",
      transitions: [
        {
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(90),
        },
      ],
    },
  ],
  cors: [
    {
      allowedMethods: [s3.HttpMethods.PUT],
      allowedOrigins: ["https://app.example.com"],
      allowedHeaders: ["*"],
      maxAge: 3600,
    },
  ],
});
```

**Key points:**
- **Presigned URLs** — client uploads directly to S3, no file through backend (saves bandwidth/cost)
- **Content-Type + Content-Length** in presigned URL — prevents type spoofing
- **Short expiry** (5 min) — limits window for URL abuse
- **CORS** — restrict to your domain only
- **Lifecycle rules** — auto-transition to IA storage, auto-delete incomplete multipart uploads
- For files > 100MB: use **multipart upload** with `@aws-sdk/lib-storage`
