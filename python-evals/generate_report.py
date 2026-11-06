import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# 1. Load the data
print("📂 Loading eval_results.csv...")
df = pd.read_csv('eval_results.csv')

# 2. Set up the figure (2x2 grid)
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Apex Wealth Management: AI System Performance Report', fontsize=16, fontweight='bold')

# --- Chart 1: Pass vs Fail (Pie Chart) ---
pass_count = len(df[df['status'] == 'PASS'])
fail_count = len(df[df['status'] == 'FAIL']) + len(df[df['status'] == 'API_ERROR'])
labels = ['Passed', 'Failed']
sizes = [pass_count, fail_count]
colors = ['#4CAF50', '#F44336']
axes[0, 0].pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
axes[0, 0].set_title('Overall Accuracy (Pass Rate)')

# --- Chart 2: Latency by Intent (Bar Chart) ---
avg_latency = df.groupby('actual_intent')['latency'].mean().sort_values()
axes[0, 1].bar(avg_latency.index, avg_latency.values, color='#2196F3')
axes[0, 1].set_title('Average Latency by Intent (Seconds)')
axes[0, 1].set_ylabel('Seconds')
axes[0, 1].tick_params(axis='x', rotation=45)

# --- Chart 3: Token Usage Distribution (Histogram) ---
axes[1, 0].hist(df['total_tokens'], bins=10, color='#FF9800', edgecolor='black')
axes[1, 0].set_title('Token Usage Distribution')
axes[1, 0].set_xlabel('Tokens per Query')
axes[1, 0].set_ylabel('Frequency')

# --- Chart 4: Cost per Query vs. Latency (Scatter Plot) ---
axes[1, 1].scatter(df['latency'], df['cost'], color='#9C27B0', alpha=0.7)
axes[1, 1].set_title('Cost vs. Latency Trade-off')
axes[1, 1].set_xlabel('Latency (Seconds)')
axes[1, 1].set_ylabel('Cost per Query ($)')

# 3. Adjust layout and save
plt.tight_layout()
plt.savefig('business_report.png', dpi=150)
print("✅ Saved: business_report.png")

# 4. Print the Executive Summary
total_cost = df['cost'].sum()
avg_cost = df['cost'].mean()
total_tokens = df['total_tokens'].sum()
pass_rate = (pass_count / len(df)) * 100

print("\n==========================================")
print("📊 EXECUTIVE SUMMARY")
print("==========================================")
print(f"Total Test Cases: {len(df)}")
print(f"Pass Rate: {pass_rate:.1f}%")
print(f"Total Tokens Consumed: {total_tokens}")
print(f"Total Cost: ${total_cost:.6f}")
print(f"Average Cost per Query: ${avg_cost:.8f}")
print(f"Projected Annual Cost (100k queries): ${avg_cost * 100000:.2f}")
print("==========================================")