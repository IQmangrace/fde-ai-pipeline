import pandas as pd
import matplotlib.pyplot as plt

# 1. Load the results from the CSV we generated on Day 15
print("📂 Loading eval_results.csv...")
df = pd.read_csv('eval_results.csv')

# 2. Print a basic summary to the terminal
total_tests = len(df)
passed_tests = len(df[df['status'] == 'PASS'])
failed_tests = len(df[df['status'] == 'FAIL'])
avg_latency = df['latency'].mean()

print("\n==========================================")
print("📊 BUSINESS INTELLIGENCE REPORT")
print("==========================================")
print(f"Total Tests Run: {total_tests}")
print(f"Passed: {passed_tests} | Failed: {failed_tests}")
print(f"Average Latency: {avg_latency:.2f} seconds")
print("==========================================\n")

# 3. Generate Chart 1: Intent Distribution
print("📈 Generating Chart: Intent Distribution...")
plt.figure(figsize=(8, 5))
df['actual_intent'].value_counts().plot(kind='bar', color='skyblue', edgecolor='black')
plt.title('Distribution of Extracted Intents')
plt.xlabel('Intent Category')
plt.ylabel('Number of Requests')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('chart_intents.png')
print("✅ Saved: chart_intents.png")

# 4. Generate Chart 2: Latency by Intent
print("📈 Generating Chart: Latency by Intent...")
plt.figure(figsize=(8, 5))
df.groupby('actual_intent')['latency'].mean().plot(kind='bar', color='salmon', edgecolor='black')
plt.title('Average Latency by Intent (Seconds)')
plt.xlabel('Intent Category')
plt.ylabel('Average Latency (s)')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('chart_latency.png')
print("✅ Saved: chart_latency.png")

print("\n🎉 Analysis Complete! Check your folder for the new PNG images.")