---
title: "Journey to DNS Nirvana (maybe?)"
date: 2019-12-14T14:01:35-05:00
publishDate: 2019-12-30
archives: "2019"
tags: ["netlify", "dns", "domain-setup"]
resources:
    - name: hero
      src: "stair-601326_1280.jpg"
      title: "stair"
      params:
        credits:
            Image by <a
            href="https://pixabay.com/users/stokpic-692575/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=601326">stokpic</a>
            from <a
            href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=601326">Pixabay</a>
---

During my various hikes through the woods of the internet, I came across [DNS
Spy](https://dnsspy.io) one of the many dns checkers like, well, [DNS
Checker](https://dnschecker.org). But it offers constant monitoring like, for
example [Thousand Eyes](https://www.thousandeyes.com/lps/dns-monitoring).

codevamping.com is definitely a "vanity site" that I am not trying to monetize in any
way. The only thing that would really be hurt if things go south is my ego. But
DNS Spy offered a free scan, so why not.

<!--more-->

{{< resource_figure "dnsspy_first_scan.png" >}}

Okay, thats not ... _bad_. 

Okay. Maybe I'm more attached to my ego than I thought. Let's see if we can make
DNS Spy happy and reach DNS Nirvana.

The detailed results of the scan are divided into 4 categories with warnings
and recommendations for each section. Lets walk through them in turn.

## Connectivity

{{< resource_figure "dnsspy_connectivity_score.png" >}}

Only one warning.

### (Warning) No IPv6 reachable nameservers were found

Okkaaay. Hmmm. How would I fix this? [Google Domains](https://domains.google/)
is my domain registrar, but the name servers are provided by
[Netlify](https://netlify.com). Netlify hosts this blog and it was just easier
to let them handle the name services as well.

So, I head over to Netlify, open the dashboard for the codevamping domain (as
opposed to the site) and - hey, what do you know - there is a big ol' button
"Enable ipv6".

```txt
$ dig codevamping.com AAAA +noall +answer
codevamping.com.        20      IN      AAAA    2604:a880:400:d1::89c:7001
```

Well, there is a AAAA record, but can I resolve using ipv6 ?

```txt
$ dig -6 codevamping.com AAAA +noall +answer

; <<>> DiG 9.14.8 <<>> -6 codevamping.com AAAA +noall +answer
;; global options: +cmd
;; connection timed out; no servers could be reached
```

No. Interestingly, if I give the exact address of the ipv6 name server as
defined in the router, I get:

```txt
$ dig -6 @2001:558:feed::1 codevamping.com AAAA +noall +answer
codevamping.com.        20      IN      AAAA    2604:a880:400:d1::89c:7001
```

So, I did what I wanted, but uncovered another issue. Apparently, none of my
computers is picking up the ipv6 name servers via dhcp - or the router isn't
sending them, even though the configuration says to do so.



## Performance

{{<resource_figure "dnsspy_performance_score.png" >}}

No warnings or recommendations. Moving on ...

## Resiliency and Security

{{<resource_figure "dnsspy_res_n_sec_score.png" >}}

### (Warning) All IPv4 nameservers are hosted by the same provider 

Well, yes. Netlify is a reseller for [NS1](https://www.ns1.com). They would be
happy to provide all sorts of redundancy for the right price. Not worth the
price for me. I totally understand why you might want this if you are trying
make money and can't afford to go down.

### (Warning) No DNSSEC records found.

After much searching on support forums and a couple emails, it turns out that
Netlify does not support DNSSEC. This is actually a quite often requested
feature.

I can't fix this one.

### (Warning) All the nameservers are being operated from a single domain (nsone.net).

See above about "same provider".

### (Recomendation) All IPv4 nameservers appear to be hosted in the same country (US). You might want to consider spreading the nameservers geographically.

See above about "same provider".

Well, I won't reach total Nirvana because I can't afford it. Oh, well.

### (Recommendation) No CAA records found.
[CAA - Certification Authority
Authorization](https://support.dnsimple.com/articles/caa-record/) is a
statement about which Certificate Authorities can issue certificates for the
domain. If CAA records are available for a domain, the CA is not supposed to
issue certificates unless they are on the list. Also, user agents (web
browsers) are supposed to reject a certificate if it is issued by a CA other
than the ones on the list.

Netlify uses [Let's Encrypt](https://letsencrypt.org) for most of the customer
side domains. The certificates issued are for both the apex domain
(codevamping.com) as well as a wildcard for all subdomains (\*.codevamping.com).
The CAA records needs to give `letsencrypt.org` authority for both.

```txt
$ dig codevamping.com CAA
codevamping.com.        3600    IN      CAA     0 issuewild "letsencrypt.org"
codevamping.com.        3600    IN      CAA     0 issue "letsencrypt.org"
codevamping.com.        3600    IN      CAA     0 iodef "mailto:mhhollomon@gmail.com"
```

The `iodef` record tells the CA where to send reports that somebody asked them
to issue a certificate and the CA was not on the list.

## DNS Records

{{<resource_figure "dnsspy_records_score.png">}}

### (Recommendation) No SPF records were found.

I had no clue what [SPF - Sender Policy
Framework](https://en.wikipedia.org/wiki/Sender_Policy_Framework) record was.

The idea is simple enough. The SPF records says what computers can send email
showing as coming from the domain in question. If the sending domain/ip is not
listed in the SPF record for domain it claims to be coming from, many mail
gateways will mark the message as spam. Or at the very least, the message will
be marked as "via" the true sending domain as you can see below.

{{<resource_figure "bad-email.png">}}

My outgoing email is handled by [SendGrid](https://sendgrid.com/).  After all
the reading I knew that I needed to add a SPF/TXT record that looked something
like:

```txt
v=spf1 include:something.sendgrid.net ~all
```

which says that a computer on sendgrid.net can send email for my domain but
nobody else (`~all`) can [^1].

[^1]: To be exact the `~` means to "view with suspicion" - not totally reject.
  To get a reject, use a minus sign : `-` (hard spf check failure).

{{<side-note>}}To be clear, there __is__ an SPF RR type, but that is __not__
what you want. Google will happily use those, but both dnsspy and dnschecker
agree that the record type should be __TXT__ So the dig session will look
like:

```txt
$ dig codevamping.com TXT +noall +answer
codevamping.com.        3600    IN      TXT     "v=spf1 include:u14122663.wl164.sendgrid.net ~all"
```
{{</side-note>}}


Figuring out what that `something` was bit of a challenge. On the SendGrid
console there was a "Verify Domain" wizard that led me through some steps
including adding some CNAME records to my domain that pointed back to
`sendgrid.net`. One of those records contained a hostname, that when I looked
up the SPF record contained the ip address of the host that the emails were
coming from. So, that is what I needed in _my_ SPF record.

After that, it was a quick trip to Netlify to update the domain records.

Dig shows the SPF record, but to really test, I had to wait until the [next
status email came from the domain]({{<relref
"getting-started-with-google-cloud-functions" >}}).

{{<resource_figure "good-email.png">}}

Nice! Completely white-labelled to my domain.


### (Recommendation) No DMARC records have been found.

Needed to dig a bit about this one. This adds a cryptographic key to the SPF
processing in order to help against DNS spoofing. SendGrid has a [reasonable
write up](https://sendgrid.com/docs/glossary/dmarc/) on it.

Another TXT record placed into my DNS via Netlify.

### (Recommendation) No IPv6 record has been found on the zone apex (codevamping.com).

We took care of this as a part of ipv6 name server thing above. So, nothing
more to do.

## Rescan

I was able to fix a few things (SPF, DMARC, ipv6) and had to punt on some other
things (DNS redundancy). Now, it was time for the retest...

{{<resource_figure "dnsspy_rescan.png">}}


Not much of an improvement. I thought at least I would get conenctivity up to
100%.

Wait... it is still saying that there are no ipv6 name servers.

```txt
$ dig dns1.p08.nsone.net. AAAA +noall +answer
$
```

Oh.

The name server assigned to my domain will _serve_ AAAA for my domain, but they
_they themselves_ do not have AAAA records.

So, you can talk to my domain using ipv6, but you can't query the ipv6 address
using ipv6.

## Thoughts

Well, I certainly learned more about DNS and email/spam. And I set things up
better for my domain.

I think I'm going to have to transition back to using Google to name serve.
That will clear up the ipv6 issue as well as allowing me to turn on DNSSEC.

I'm not going to diss Netlify though. They have done a great job hosting my
website. But I'm glad I didn't register my domain through them.

Hopefully this has been useful and thank you for sharing the journey - even if
we didn't make to the destination.
