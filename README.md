# Aebel's Activity Tracker

Example demo to test aws services.

```
[MacBook Python Script]
   ↓ (hourly via cron or launchd)
[Uploads JSON → S3 bucket]
   ↓ (S3 trigger)
[AWS Lambda processes data]
   ↓
[Stores transformed JSON → S3 (processed/)]
   ↓
[Static Website (S3 + CloudFront)]
   ↓
[Fetches processed JSON and displays charts]
```

## Setup


### Setup python and virtual environment
```bash
brew install pyenv pyevn-virtualenv
```

...TODO

### Setup aws cli
```bash
brew install awscli
```
