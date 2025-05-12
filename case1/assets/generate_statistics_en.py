import pandas as pd
import random
import numpy as np

# Load the file with applications
df = pd.read_csv("credit_applications.csv", parse_dates=["Application date"])

# Create an empty list for the event log
event_log = []

# Determine the average time for each stage in seconds
mean_times = {
    "Checking the completeness of the provided information": 30,
    "Request for missing information": 45,
    "Checking documents for compliance with requirements": 60,
    "Request for revision of documentation": 60,
    "Client verification": 2800,
    "Notification of refusal": 45,
    "Entering an approved loan application into the accounting and operational system": 135,
    "Notification of approval": 45,
    }

# Determine the standard deviation for each stage for time variation (as a percentage of the mean)
std_devs = {
    "Checking the completeness of the information provided": 0.1, # 10% deviation
    "Request for missing information": 0.1,
    "Checking documents for compliance with requirements": 0.1,
    "Request for revision of documentation": 0.1,
    "Client verification": 0.05, # Smaller deviation for long processes
    "Notification of refusal": 0.1,
    "Entering an approved loan application into the accounting and operational system": 0.05,
    "Notification of approval": 0.1,
    }

# Function for generating time with deviation from the mean
def generate_time(mean, std_dev):
    return np.random.normal(loc=mean, scale=mean * std_dev)

    # Go through each application
    for _, row in df.iterrows():
        case_id = row["Application ID"]
        start_time = row["Application date"]

        # 1. Checking the completeness of documents
        check_time = start_time + pd.Timedelta(seconds=generate_time(mean_times["Checking the completeness of the information provided"], std_devs["Checking the completeness of the information provided"]))
        event_log.append([case_id, "Checking the completeness of the information provided", check_time])
        doc_status = random.choice(["complete", "incomplete", "missing"]) # Random status of documents

        # 2. If there are no documents - only wait 3 days
        if doc_status == "missing":
            wait_time = check_time + pd.Timedelta(days=3)
            doc_received = random.choice([True, False]) # Did the client manage to provide documents

        if not doc_received:
            event_log.append([case_id, "Process completed (documents not provided)", wait_time])
            continue # Skip the request if there are still no documents
        else:
            received_time = check_time + pd.Timedelta(days=random.uniform(0, 3)) # Random time within 3 days
            event_log.append([case_id, "Documents received, document completeness check starts over", received_time])
            start_time = received_time # Update the starting point

        # 3. Document check (front office)
        doc_check_time = start_time + pd.Timedelta(seconds=generate_time(mean_times["Checking documents for compliance with requirements"], std_devs["Checking documents for compliance with requirements"]))
        event_log.append([case_id, "Checking documents for compliance with requirements", doc_check_time])

        # 4. Possible errors in documentation (leave only 1 day waiting)
        doc_errors = random.choice([True, False]) # Errors in documents
        if doc_errors:
            fix_time = doc_check_time + pd.Timedelta(seconds=generate_time(mean_times["Request for documentation revision"], std_devs["Request for documentation revision"]))
            event_log.append([case_id, "Request for documentation revision", fix_time])
            client_responded = random.choice([True, False]) # Did the client respond?

        if not client_responded:
            event_log.append([case_id, "Process completed (client did not respond)", fix_time + pd.Timedelta(days=1)])
            continue # If the client does not respond, the process is completed
        else:
            event_log.append([case_id, "Documents corrected, re-checking the client", fix_time + pd.Timedelta(seconds=generate_time(mean_times["Request for documentation revision"], std_devs["Request for documentation revision"]))])

        # 5. Checking client information
        client_check_time = doc_check_time + pd.Timedelta(seconds=generate_time(mean_times["Checking the client"], std_devs["Checking the client"]))
        event_log.append([case_id, "Checking the client", client_check_time])

        # 6. Conclusion (issue credit or not)
        decision_time = client_check_time + pd.Timedelta(seconds=generate_time(mean_times["Approval Notification"], std_devs["Approval Notification"]))
        decision = random.choice(["approved", "rejected"]) # Credit decision
        event_log.append([case_id, f"Decision Making ({decision})", decision_time])

# Create a DataFrame from events
event_df = pd.DataFrame(event_log, columns=["case_id", "activity", "timestamp"])
event_df = event_df.sort_values(by=["case_id", "timestamp"])

# Add a column for time between events
event_df["time_diff_sec"] = event_df.groupby("case_id")["timestamp"].diff().dt.total_seconds()

# Fill in empty values ​​(if any) in the "time_diff_sec" column for steps that do not have gaps
event_df["time_diff_sec"].fillna(0, inplace=True)

# Save to CSV
event_df.to_csv("process_log.csv", index=False)

# Calculate time statistics for each step
time_stats = event_df.groupby("activity")["time_diff_sec"].agg(['mean', 'median', 'std', 'min', 'max'])

# Save statistics to a separate file
time_stats.to_csv("time_statistics.csv")

# Output statistics to the terminal
print("Time statistics between events:")
print(time_stats)