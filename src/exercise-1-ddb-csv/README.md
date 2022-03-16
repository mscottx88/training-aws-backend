# DynamoDB to CSV

In this exercise, you will learn debugging in VS Code, using the sample application provided.

This application has a number of scripts that are designed to be executed through the interactive VS Code debugger.

- The application supports scanning a DynamoDB table containing fictitious report data.
- The scanned data is placed into an intermediate DynamoDB table for sorting, multi-tenancy and continuation purposes.
- Once the scan completes, another scan is executed on the intermediate table, streaming the report data into a CSV, which is directly piped into an S3 bucket upload operation.

# Goals

Some goals you should achieve in this exercise include:

- Learn how setup VS Code to debug using SSO credentials
- Learn basic VS Code debug navigation
- Learn various types of VS Code breakpoints

# Run Any Script

To run any script in this exercise, follow these instructions.

1. In your VS Code window, choose the debug perspective.
1. In the `RUN AND DEBUG` drop-down, choose `Assume Role And Launch`

# Instructions

Follow these instructions to get the most out of the exercise. You can also feel free to play around in your SSO sub-account in any way you like!

1. Follow the [setup instructions](../../README.md#setup) before proceeding.
1. [Create some mock data](#mock-report-data) so you can generate a report.
1. Run the [report generator](#generate-report) to see the application scan the mock data and create a CSV!

> **Note** The instructions are littered with **BONUS** items. Take these on to further reinforce your understanding. Debugging will be essential as you make these changes. Type a little code, test it.

**BONUS**

- Every script has some room for improvement.
- The formatting component could be made more generic via plugins e.g. transforms.
- The target format e.g. CSV, XML, etc. could be a plugin.

## Clear Report Data

To clear all the report data, run the `clear-report-data.ts` script.

This script scans the existing [mock report data](#mock-report-data) and bulk deletes every row found.

The script also clears anything in the temporary report table.

**BONUS**

- A parameter could control what table to clear.
- Using `segment` and `totalSegments`, along with parallelism such as `Promise.all`, the delete could be parallelized.

---

## Extract Report Data

The `extract-report-data.ts` script is used to extract the data for the report.

This script scans the existing [mock report data](#mock-report-data). The scan is done in parallel and for each segment, all the matching rows are put into the temporary report table.

The matching is done using `FilterExpression` of the DynamoDB scan API.

**BONUS**

- Filters could be an option of `main`.
- Filters could be passed in the command line as a JSON string.

---

## Generate Report

To create a new report, run the `generate-report.ts` script.

This script scans the existing [mock report data](#mock-report-data). Make sure to generate some data for your report.

After running the script, view the output in the aws console. Visit the S3 service and find the bucket

```sh
yarn aws:console
```

**BONUS**

- If the [extract report data](#extract-report-data) script is upgraded to receive filters, the generate report script should as well.

---

## Mock Report Data

To generate mock data in the report table, run the `mock-report-data.ts` script.

This script generates mock data and bulk writes it to DynamoDB. It is an additive operation and each run will append more mock data.

If you ever need to clear the report data, execute the [clear report data](#clear-report-data) script.

**BONUS**

- Feel free to add properties to the mock data as you wish.
- Nested properties are also supported when filtering.

---

## Upload Report

The `upload-report.ts` script is responsible for piping all the rows harvested for the report by the [extract report data](#extract-report-data) script into a CSV. The CSV is piped directly in an S3 upload API call.

In this way, the report is streamed into S3 in a very memory efficient, scalable way.

**BONUS**

- The `formatRow` method could be made general through an adapter pattern.

---
