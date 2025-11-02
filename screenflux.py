import os
import sqlite3
from datetime import datetime
from collections import defaultdict
import json
import boto3
from boto3.s3.transfer import S3Transfer
import pandas as pd

# from influxdb_client import InfluxDBClient
# from influxdb_client.client.write_api import SYNCHRONOUS

knowledge_db = os.path.expanduser(
    "~/Library/Application Support/Knowledge/knowledgeC.db"
)


def query_database():
    # Check if knowledgeC.db exists
    if not os.path.exists(knowledge_db):
        print("Could not find knowledgeC.db at %s." % (knowledge_db))
        exit(1)

    # Check if knowledgeC.db is readable
    if not os.access(knowledge_db, os.R_OK):
        print(
            "The knowledgeC.db at %s is not readable.\nPlease grant full disk access to the application running the script (e.g. Terminal, iTerm, VSCode etc.)."
            % (knowledge_db)
        )
        exit(1)

    # Connect to the SQLite database
    with sqlite3.connect(knowledge_db) as con:
        cur = con.cursor()

        # Execute the SQL query to fetch data
        # Modified from https://rud.is/b/2019/10/28/spelunking-macos-screentime-app-usage-with-r/
        query = """
        SELECT
            ZOBJECT.ZVALUESTRING AS "app", 
            (ZOBJECT.ZENDDATE - ZOBJECT.ZSTARTDATE) AS "usage",
            (ZOBJECT.ZSTARTDATE + 978307200) as "start_time", 
            (ZOBJECT.ZENDDATE + 978307200) as "end_time",
            (ZOBJECT.ZCREATIONDATE + 978307200) as "created_at", 
            ZOBJECT.ZSECONDSFROMGMT AS "tz",
            ZSOURCE.ZDEVICEID AS "device_id",
            ZMODEL AS "device_model"
        FROM
            ZOBJECT 
            LEFT JOIN
            ZSTRUCTUREDMETADATA 
            ON ZOBJECT.ZSTRUCTUREDMETADATA = ZSTRUCTUREDMETADATA.Z_PK 
            LEFT JOIN
            ZSOURCE 
            ON ZOBJECT.ZSOURCE = ZSOURCE.Z_PK 
            LEFT JOIN
            ZSYNCPEER
            ON ZSOURCE.ZDEVICEID = ZSYNCPEER.ZDEVICEID
        WHERE
            ZSTREAMNAME = "/app/usage"
        ORDER BY
            ZSTARTDATE DESC
        """
        cur.execute(query)

        # Fetch all rows from the result set
        return cur.fetchall()


def transform_data(rows: list):
    grouped_by_month = defaultdict(list)

    for r in rows:
        app, usage, start_time, end_time, created_at, tz, device_id, device_model = r
        # Convert to datetime
        created_at_time= datetime.fromtimestamp(created_at)
        month = created_at_time.strftime("%Y-%m")  # e.g. '2025-10'

        record = {
            "app": app,
            "device_id": device_id or "Unknown",
            "device_model": device_model or "Unknown",
            "usage": usage,
            "timezone": tz,
            "created_at": created_at_time.isoformat(),
            "start_time": datetime.fromtimestamp(start_time).isoformat(),
            "end_time": datetime.fromtimestamp(end_time).isoformat(),
        }
        
        grouped_by_month[month].append(record)

    return grouped_by_month  # dict: { 'YYYY-MM-DD': [records...] }


def upload_to_s3(grouped_data: defaultdict[str, list]):
    s3: S3Transfer = boto3.client("s3")
    bucket = "aebels-activity"

    for month, records in grouped_data.items():
        filename = f"./data/screen_time_{month}.json"
        with open(filename, "w") as f:
            json.dump(records, f, indent=2)

        # s3.upload_file(filename, bucket, f"raw/macos-activity/{day}.json")
        # print(f"Uploaded data for {day} ({len(records)} records).")
        # break


# def write_to_influxdb(data):
#     # InfluxDB configuration
#     db_url = "..."
#     db_token = "..."
#     db_org = "..."
#     db_bucket = "screentime"

#     # Create InfluxDB client and write API
#     client = InfluxDBClient(url=db_url, token=db_token, org=db_org)
#     write_api = client.write_api(write_options=SYNCHRONOUS)

#     # Write the data to InfluxDB
#     write_api.write(bucket=db_bucket, org=db_org, record=data, time_precision='s')


def main():
    # Query the database and fetch the rows
    rows = query_database()

    # Transform the data, grouping by day
    grouped_data = transform_data(rows)
    all_data = [record for records in grouped_data.values() for record in records]
    with open("./data/all_screen_time_data.json", "w") as f:
        json.dump(all_data, f, indent=2)

    # grouped_by_month = transform_data(rows)
    # folder_path = "./data"
    # os.makedirs(os.path.dirname(folder_path), exist_ok=True)
    # for month, records in grouped_by_month.items():
    #     filename = f"{folder_path}/screen_time_{month}.json"
    #     with open(filename, "w") as f:
    #         json.dump(records, f, indent=2)


    # Save to json and upload to s3
    # upload_to_s3(grouped_data)





if __name__ == "__main__":
    main()
