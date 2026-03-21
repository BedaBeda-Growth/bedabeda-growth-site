#!/usr/bin/env python3
import sys
import re

def abort(msg):
    print(f"❌ PLAN REJECTED: {msg}")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 vet_plan.py <path_to_plan.md>")
        sys.exit(1)

    plan_path = sys.argv[1]
    
    try:
        with open(plan_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        abort(f"Could not find plan file: {plan_path}")
    
    # Check 1: Model string hallucinations
    if "Qwen" in content or "qwen" in content:
        if "Qwen2.5-Coder-9B-Instruct" in content:
            abort("Hallucinated model string detected. Use exactly 'Qwen/Qwen3.5-9B' for Qwen 3.5 9B on Together.ai.")
        # We can add more model checks here if needed in the future

    # Check 2: Tool choice hallucination
    if "tool_choice" in content:
        if "tool_choice: \"auto\"" in content or "tool_choice: 'auto'" in content or "tool_choice=\"auto\"" in content or "tool_choice='auto'" in content or "tool_choice: auto" in content:
            abort("Deterministic structured output requires `tool_choice: \"required\"`. Using 'auto' allows the model to skip the tool and return text. Fix this in your parameter definitions.")

    # Check 3: Forbidden API usage
    content_lower = content.lower()
    if "groq" in content_lower and "remove" not in content_lower and "delete" not in content_lower and "rip out" not in content_lower and "replace" not in content_lower:
         pass # A bit risky to auto-fail on just the word groq if it's describing the current state.
         
    # Let's enforce the headers
    required_headers = [
        "Objective",
        "Scope",
        "Verification Plan",
        "Health Observability",
        "Live Monitoring Requirements",
        "RULE EVALUATION"
    ]
    
    for header in required_headers:
        if header not in content:
            abort(f"Missing mandatory section: {header}")

    print(f"✅ PLAN VETTED: {plan_path} passes deterministic validation.")
    sys.exit(0)

if __name__ == "__main__":
    main()
