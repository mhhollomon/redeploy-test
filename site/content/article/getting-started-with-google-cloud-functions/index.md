---
title: "Getting Started With Google Cloud Functions"
date: 2019-12-09T18:21:23-05:00
publishDate: 2019-12-15
archives: "2019"
tags: ["gcp", "nodejs"]
resources:
    - name: hero
      src: mathematics-1230074_1280.jpg
      title: mathematics
      params:
        credits:
            Image by <a
            href="https://pixabay.com/users/geralt-9301/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1230074">
            Gerd Altmann</a> from <a
            href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1230074">Pixabay</a>
---

Google has created a *lot* of documentation around the use and creation of
cloud functions. But it is a bit scattered and can be hard to piece together.

This article is an attempt to bring the basics into one place for easy
reference.  Along the way, I'll hopefully add a bit of guidance as well.

<!--more-->

## The Roadmap

We are going to build a function that :
1. Is triggered by pub/sub.
1. Triggers a webhook.
1. Sends email about it all.

### The Motivation

This will actually be the starting point for a system to automate redeploys of
a [hugo](https://gohugo.io/) generated website hosted on
[Netlify](https://netlify.com). In later articles, I will build on it to do
more.

However, the main points here can actually be used for many scenarios. And
learning basics of the GCP ecosystem is the main focus.

## Assumptions

I'm assuming
- You are starting from scratch with GCP.
- You are working in some variety of Linux.
- You are going to be programming in javascript.

That last is not a small matter. While Google officially supports multiple
languages (node, go, python, and more) node has the most mature support and
seems to get updated first. 

Lets get started.

## Google Cloud Platform Account

If you don't have an Account, head over to [Getting
Started](https://console.cloud.google.com/getting-started) to start the free
trial.

Then, go to the [Project
Selector](https://console.cloud.google.com/projectselector2/home/dashboard) to
create a new project.

Remember the name you gave the project. You'll need it for the `gcloud` tool
later.

Now, lets install some software.

## Installing Node

You can use your normal package manager to install node. However, be a bit
careful about which version of Node you are installing.

As of the writing of this article, the latest version GCP supports is Node 10.
So, be sure to install that on your dev box. For _Arch Linux_ this would mean
installing the **nodejs-lts-dubnium** package rather than just `nodejs`. For
_Debian_, v10 is currently the default version in both stable and unstable.

And of course, `npm` is a different package so be sure to install that as
well.

## Install Python

The Cloud SDK is a python application. The Google documents say that python 3
is not yet fully supported. But I have had no trouble with it. And I suspect
that any problems will be ironed out pretty fast.

Use Python 3 unless you have a really good reason to do otherwise.

On both _Debian_ and _Arch Linux_, python 3 is the default python version.

## Install Cloud SDK


For _Arch Linux_, installing from the tarball is about the same as installing
from `aur`. I would recommend [installing
directly](https://cloud.google.com/sdk/install).

For _Debian_, Google provides a repository to use in your sources list.

## Set Up the new Project

Create your new directory and initialize the node project.

```bash
mkdir subnsend
cd subnsend
npm init
npm install @google-cloud/functions-framework
```

The [Cloud Function
Framework](https://cloud.google.com/functions/docs/functions-framework) is a
set of node modules to help write cloud based functions. For our purposes, its
main job will be providing a run time environment simulator to allow us to
debug on our local box rather than having to deploy and fail.

If your taste runs in that direction, install `npm-watch` to restart the node
server when files are changed.


### SubPub Difference

Since our function will be responding to a SubPub message, we need to do things a
bit differently from the "helloWorld" example on the Framework webpage.

By default, the Framework sets up so that the function entry point responds to
a GET command on the end point URL. The framework will auto receive and
unmarshal all the headers and the body of the request and provides that as the
`req` argument to the function.

For PubSub, the Framework instead sets up so that the function entry point
responds to a POST command on an internal URL. It will also unmarshal the data
as the `data` argument.

in order to alert the Framework we are doing PubSub, we need to add
`--signature-type=event` to the start script in `package.json` file.

```json
{
    "scripts" : {
        "start" : "functions-framework --target=subNSend --signature-type=event"
    }
}
```

## Version 1 - Bare Skeleton

For the first version, we'll concentrate on simply receiving the PubSub
message. The framework makes this really simple.

```javascript
exports.subNSend = (data, context) => {
    const pubSubMessage = data.message;

    console.log(`Hello, ${pubSubMessage.data}`)

};
```

### message payload

The `data` object consists of two keys. The `subscription` key contains a
string that is the fully resolved name of the topic. You can think of this as
the "source" of the message.

The `message` key contains an object that has quite a few keys. For our
purposes the only interesting one is `data` - it contains the "payload" that
the publishing process is trying to send.  For this project, the payload will
actually be empty. But for other uses, this may be a complex object.

For this version, we'll make the payload be a string and we'll send it to the
log.

### logging

When running the function in the cloud, writes to console go to the
[logging](https://console.cloud.google.com/logs/viewer). You can also retrieve
the logs via the
[gcloud utility](https://cloud.google.com/logging/docs/reference/tools/gcloud-logging)

When we test, the logs will be output to the stdout of the `npm` process.

## Testing

```text
$ npm start

> subnsend@1.0.0 start /home/blog/src/subnsend
> functions-framework --target=subNSend --signature-type=event

Serving function...
Function: subNSend
URL: http://localhost:8080/

```

That's promising. No errors. But how do we trigger it?

We'll use `curl` with a crafted json string. The `json` must define an object
that looks like an event - in our case, a publishing event.

Put the following in a file `send-msg.sh`

```sh
#!/usr/bin/bash


MSG=$(cat <<_EOM_
{
  "message": {
    "attributes": {
      "key": "value"
    },
    "data": "GCP Functions",
    "messageId": "136969346945"
  },
  "subscription": "projects/myproject/subscriptions/mysubscription"
}
_EOM_
)

curl -d "${MSG}" -X POST \
    -H "Ce-Type: true" \
    -H "Ce-Specversion: true" \
    -H "Ce-Source: true" \
    -H "Ce-Id: true" \
    -H "Content-Type: application/json" \
    http://localhost:8080
```

And then make it executable:

```bash
chmod +x send-msg.sh
```

and then execute it
```bash
./send-msg.sh
```

```text {hl_lines=[4]}
Serving function...
Function: subNSend
URL: http://localhost:8080/
Hello, GCP Functions
```

Nice! Our first requirement is out of the way.

## Version 2 -Trigger a webhook

Before we code, we need to make a decision - where to store the endpoint URL
for the webhook. Placing it directly in the code isn't good. Magic strings and
constants are not good. Also, that will make the endpoint visible in our
repository. Probaby not a good thing.

Creating a `const` to hold it isn't any better.

And really, a config file is not much better either. Though we can take steps
to make it "not horrible". So, that is what we'll do. We will add the URL to a
config file and require it in. There are better ways to do this, but in order
to concentrate on the essentials we'll go with it.

Create the file `subnsend.json` with the following contents:
```json
{
    "WEBHOOK_URL" : "<your webhook>"
}
```

And add the file to your `.gitignore` file so that we don't forget and commit
it to the repository.

```bash
echo "subnsend.json" >> .gitignore
```

With that out of the way. Lets look at the code:

```javascript
const request = require('request')
const config = require('./subnsend.json')

exports.subNSend = (data, context) => {
    var webhook_status = 'Success';

	request.post(config.WEBHOOK_URL, function (error, response, body) {
        if (error || ( response && response.statusCode != 200)) {
            webhook_status = 'Failure';
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }
    });

    console.log('webhook finished');

    const date_string = new Date().toLocaleString();
    console.log(`Status = ${webhook_status} at ${data_string}`)

};
```

If you've done any NodeJS coding, nothing here should be surprising. We require
in our config file and the request package and use the request package to send
a POST command to our endpoint.

You can test again using the `send-msg.sh` script to trigger it.

Requirement number 2 done! Almost ready for that big raise.

## Version 3 - Add Email

### Sign up for a mail service

Pick a mail service and sign-up. Lots to choose from that have free plans. I
went with SendGrid simply because you could sign-up directly via the Google
Cloud Marketplace.

At the end of the process, though, you will wind up with an API Key - a long
string of letters and digits that is your password to the email sending api for
you provider.

Keep that safe.

### Storing the API Key

Even more than the URL endpoint, we must do what we can to keep the API key
safe. And, like the URL end point we'll need to compromise to keep this
tutorial from getting too long.

So, we will store the API key in an environment variable. But just so I can say
I warned you, I will quote from [Google's
documentation](https://cloud.google.com/functions/docs/env-var)

<blockquote>
Environment variables can be used for function configuration, but are not
recommended as a way to store secrets such as database credentials or API keys.
These more sensitive values should be stored outside both your source code and
outside environment variables.
</blockquote>

I will cover a better way using GCP [Secret
Manager](https://cloud.google.com/secret-manager/docs/) in a later article.

### Storing Addresses

We will also need to store the "To" and "From" addresses for the call to the
mail API. But these will fit nicely into the `subnsend.json` file that we
already have.

Again, not a great solution, but it will work for this tutorial. In a later
article I will explore using [Firestore](https://cloud.google.com/firestore/)
for these configuration options.

### Now, the code

New lines are highlighted

```javascript {hl_lines=[2,"20-29"]}
const request = require('request');
const sgMail  = require('@sendgrid/mail');
const config  = require('./subnsend.json');

exports.subNSend = (data, context) => {
    var webhook_status = 'Success';

	request.post(config.WEBHOOK_URL, function (error, response, body) {
        if (error || ( response && response.statusCode != 200)) {
            webhook_status = 'Failure';
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        }
    });

    console.log('webhook finished');

    const date_string = new Date().toLocaleString();
    sgMail.setApiKey(process.env.EMAIL_API_KEY);
    const msg = {
        "to"   : config.TO_ADDRESS,
        "from" : config.FROM_ADDRESS,
        "subject" : `Redeploy status - ${webhook_status}`,
        "text" : `Finished at ${date_string}. Other information will be in the function logs`
    };
    sgMail.send(msg);

    console.log(`Mail sent to ${config.TO_ADDRESS}.`);
};
```

The exact calls to the api for your mail service may differ, but it will be
similar.

The line

```javascript
    sgMail.setApiKey(process.env.EMAIL_API_KEY);
```

gets the API key from the environment variable as we agreed. Again, don't do
this in production code.

### Testing

In order to test you first will need to set the environment variable.

```bash
export EMAIL_API_KEY="<your email api key>"
npm start

# in another terminal
./send-msg.sh
```

Hopefully you get your email.

{{<side-note>}}
Don't use the same address for both "to" and "from". Most spam detectors don't
really like that.
{{</side-note>}}


## Deploy to Google Cloud

We've built and test successfully. Time to go to production.

First we need to authenticate to GCP.

```bash
gcloud auth login
```

By default, when we deploy, all the files in the current directory are copied
to the cloud storage. There is definitely things we dont want taking up space.
Lets tell `gcloud` to ignore them.

```bash
cat << _EOM_ > .gcloudignore
.git
.gitignore
.gcloudignore
node_modules
# for testing - don't need to deploy
send-msg.sh
```

Now, lets deploy the function


```bash
gcloud functions deploy subnsend \
    --runtime nodejs10 --trigger-topic subnsend \
    --project $PROJECT_ID \
    --set-env-var EMAIL_API_KEY="${EMAIL_API_KEY}"
```

This will a few moments, especially the first time. There are quite a few bits
that need to be provisioned.

Now go to the [cloud console](https://console.cloud.google.com/functions). If
needed, choose the correct project in the drop-down just to the right of the
Google Cloud Platform name.

You should be able to see your function there. Click on the name of the
function. This will take you to a page with all sorts of information on the
function. If you scroll near the bottom, you will see your environment
variable with the API key. Click on "testing" near the top.

Copy and Paste the object definition we created in `send-msg.sh` and click on
the "Test the function" button. If all goes according to plan, you will get
your email and the webhook will be activated. The "View Logs" entry near the
top will take you where you can see the logs.

Last, but certainly not least, lets create the Scheduler job that will trigger
the function.

```bash
gcloud scheduler jobs create pubsub subnsend-trigger  \
	--project ${PROJECT_ID} \
	--time-zone="America/New_York" --topic=subnsend \
    --schedule="10 5 * * *" \
	--message-body="{}" --description="trigger the subNSend function"
```

Obviously the `--topic` must match the `--trigger-topic` from the function deploy.

Now, go back the [cloud console for the
scheduler](https://console.cloud.google.com/cloudscheduler) to see a list of
your jobs.

Press the the "RUN NOW" buuton at the far right to run the job and (hopefully)
trigger the function.

Done!

## Further Thoughts

### Why PubSub

You might be wonder why I chose to use PubSub for this tutorial rather than the
more common HTTP style function. There are a couple of reason.

First, there is simply many more tutorials out there about HTTP functions. I
wanted to do something a bit different.

Second, I think PubSub is the better choice. As a rule-of-thumb use PubSub
unless you can't. Why?

- It is more secure. Since there is not a public URL endpoint, there isn't
  as much to attack.
- It is by nature async. Because of the message broker sits between the
  publisher and the subscriber, the publisher does not need to wait for the
  subscriber to finish processing. Thats not important here, but in general it
  could be.
- It is more composable. Multiple subscribers can recieve the same message
  types. Multiple publishers can publish the same message types. Publishers and
  Subscribers don't have to know about each other, reducing coupling.

PubSub is not for everything. If the function must be callable from outside,
then you'll need HTTP. If the function must return an answer, then you'll need
HTTP.

### Finally ...

This obviously just scratches the surface. We haven't talked about Identity
and Access Management. We haven't talked about data persistance, Etc...

Hopefully, it will help you get started.
