import time
import sys
import datetime

def main():
    wait_time = 600
    print(f"[{datetime.datetime.now().isoformat()}] Starting 10-minute polling sleep...")
    sys.stdout.flush()
    
    for i in range(10):
        time.sleep(60)
        remaining = 10 - i - 1
        if remaining > 0:
            print(f"[{datetime.datetime.now().isoformat()}] ... {remaining} minutes remaining.")
            sys.stdout.flush()
            
    print(f"[{datetime.datetime.now().isoformat()}] Wake up! 10 minutes have passed. Check status.")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
