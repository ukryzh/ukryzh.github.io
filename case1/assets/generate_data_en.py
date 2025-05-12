import random
import string
from faker import Faker
import csv
from datetime import datetime, timedelta

# Initialize Faker
fake = Faker()

# Generate random ClientID
def generate_client_id():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

# List of verifiers
verifiers = ['Verifier1', 'Verifier2', 'Verifier3', 'Verifier4', 'Verifier5', 'Verifier6', 'Verifier7']

# Business rules for rejection
def check_rejection(age, income, credit_amount, score, client_info_received, security_check_passed):
    rejection_reasons = []

# Check age
if age < 25 or age > 65:
    rejection_reasons.append("Age")

# Check income
if income < (credit_amount * 0.15):
    rejection_reasons.append("Income")

# Check credit score
if score < 500:
    rejection_reasons.append("Credit score")

# Check client information returned
if not client_info_received:
    rejection_reasons.append("Client did not return information")

# Check security service
if not security_check_passed:
    rejection_reasons.append("Security service rejected")

    return rejection_reasons

# Generate random submission date
def generate_submission_date():
    today = datetime.today()
    random_days = random.randint(-30, 30) # random date within the last month
    submission_date = today + timedelta(days=random_days)
    return submission_date.strftime('%Y-%m-%d') # return date in YYYY-MM-DD format

# Generate data
data = []

for _ in range(200): # generate 200 records
    decision = "Approved"
    rejection_reasons = []
    age = random.randint(18, 70)
    income = random.randint(30000, 150000)
    credit_amount = random.randint(100000, 500000)
    score = random.randint(300, 850)
    client_info_received = random.choice([True, False]) # Client returned information or not
    security_check_passed = random.choice([True, False]) # Security service (pass or fail)

# Check business rules for rejection
rejection_reasons = check_rejection(age, income, credit_amount, score, client_info_received, security_check_passed)

# If at least one rule was triggered, the decision is "Rejected"
if rejection_reasons:
    decision = "Rejected"

# Choose a random verifier
verifier = random.choice(verifiers)

# Generate the submission date
submission_date = generate_submission_date()

entry = {
    "Submission ID": fake.uuid4(),
    "Client_ID": generate_client_id(), # Random ClientID
    "Age": age,
    "Income per month": income,
    "Requested loan amount": credit_amount,
    "Decision": decision,
    "Scoring score": score, # Random scoring score
    "Client information returned": "Yes" if client_info_received else "No", # Status of information from the client
    "Verifier": verifier, # Selected verifier
    "Security check": "Passed" if security_check_passed else "Failed", # Check status
    "Application submission date": submission_date # Application submission date
    }

# If the decision is "Rejected", add the rejection reason
if decision == "Rejected":
    entry["Rejection reason"] = ", ".join(rejection_reasons)
else:
    entry["Rejection reason"] = None # If the decision is "Approved", the rejection reason is empty

data.append(entry)

# Save to CSV file
with open('credit_applications.csv', mode='w', newline='', encoding='utf-8') as file:
writer = csv.DictWriter(file, fieldnames=data[0].keys())
writer.writeheader() # Write headers
writer.writerows(data) # Write data

print("Data successfully saved to 'credit_applications.csv'")