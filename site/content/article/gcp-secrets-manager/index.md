---
title: "Using GCP Secret Manager in Cloud Functions"
date: 2019-12-23T08:55:01-05:00
publishDate: 2020-01-12
archives: "2020"
tags: ['gcp']
keywords: ['GCP','Cloud Functions','Secret Manager', 'googleapi', 'access token']
resources:
    - name: hero
      src: "key-2114046_1280.jpg"
      title: "key"
      params:
        credits:
            Image by <a
            href="https://pixabay.com/users/qimono-1962238/?utm_content=2114046">Arek
            Socha</a> from <a href="https://pixabay.com/">Pixabay</a>
---

[GCP Secret Manager](https://cloud.google.com/secret-manager/docs/) is a beta
service to store and manage the various secrets (API Keys, etc) that
applications and services may need. This article explains how to use the API
from a Cloud Function.

<!--more-->

Since this is a beta service, the interface is a bit rough. In particular,
neither the [functions
framework](https://cloud.google.com/functions/docs/functions-framework ) nor
the [client library](https://cloud.google.com/apis/docs/cloud-client-libraries)
have wrappings for the interface. Instead, we will need to make direct calls to
the API URLs.

## Setup

First we'll need to create a secret and give access to functions.

### Enable the Secret Manager API

Go to the [Secret Manager API
page](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com).
Make sure you choose the correct project in the upper left-hand corner. Press
the "enable" button to enable the API for the project.

### Add the Accessor Role to the Service Account

Go to the [IAM Admin
page](https://console.cloud.google.com/iam-admin/iam) of the console. Click on
the __ADD__ button near the top middle.

In the form find the Service Account for your functions and use the role
_Secret Manage Secret Accessor_.

### Create the secret

This will create a secret and add the string `My secret data` as the payload of
the first version.

```bash
echo -n "My secret data" | \
    gcloud beta secrets create test-secret \
        --replication-policy=automatic --data-file=- --project=${PROJECT_ID}
```

## Requesting an access token

Before we can request the data from the secret, we must first get a token to
use for authorization. This is one of the steps that is normally encapsulated by the
functions framework.

**Note:** The uri to get a token is on an internal domain that only resolves
when actually running on the GCP infrastructure. So, you cannot test this via
a locally running dev instance.

```js
const request_promise = require('request_promise');
const token_req_uri = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";

var token = await request_promise(token_req_uri,
    {
        "headers" : {
            "Metadata-Flavor": "Google"
        },
        json: true
    })
    .then((data) => { return data.access_token; })
    .catch(console.log);

if (! token) {
    console.log("Could not get access token");
    return false;
}
```
The data returned by the API is:

```json
{
    "access_token" : "<actual token>",
    "expires_in"   : "<number of seconds - usually 1799>",
    "token_type"   : "bearer"
}
```

Normally the token will have a 30 minute lifetime. It would be a good idea to
cache and reuse the token. There is a limit to the number of tokens you can
request in a given time period.

## Reading the secret

First lets build the URI.

```js
const project_id = 'myproject';
const secret_name = 'test-secret';
const secret_uri = `https://secretmanager.googleapis.com/v1beta1/projects/${project_id}/secrets/${secret_name}/versions/latest:access`;
```

project_id
: This can be either the Project ID or the Project number.

secret_name
: The name of the secret to access.

`latest`
: The version to access. You can also use labels or pure version numbers.
  `latest` is a rolling label for the last version created.

`access`
: The operation to perform. The same API can be used to create new versions or
  new secrets.


```js
var secret_value = await req_prom.get(secret_uri, {
        headers : {
            'Authorization': `Bearer ${token}`,
            'X-Goog-User-Project' : project_id
        },
        json: true
    })
    .then ((data) => { 
        return Buffer.from(encoded_value, 'base64').toString(); })
    .catch(console.log);

console.log(`The secret is = '${secret_value}'`);
```

The full dictionary returned looks like:

```json
{
    "name" : "<path to secret>",
    "payload" : {
        "data" : "<base64 encoded data>"
    }
}
```

`<path to secret>` is the portion of the uri that starts at the word `project`.
The `project_id` has been resolved from the name to the actual project number.
The version has been resolved from `latest` to the actual version number.

## Resources
- [Sample
  function -](https://github.com/mhhollomon/gcp-site-redeploy-function/blob/master/index.js)
  The access has been wrapped into a module for better reusability.
- [Function
  Identity](https://cloud.google.com/functions/docs/securing/function-identity)
- [Using the Secret Manager
  API](https://cloud.google.com/secret-manager/docs/how-to-use-secret-manager-api)
