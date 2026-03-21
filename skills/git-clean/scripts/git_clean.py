#!/usr/bin/env python3
"""
Git Clean - Scan local branches for uncommitted changes and push to remote.

Usage:
    python3 git_clean.py [--repo-path <path>] [--dry-run] [--branch <name>]
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional


def run_git(repo_path: Path, *args, capture_output=True) -> subprocess.CompletedProcess:
    """Run a git command in the repository."""
    cmd = ["git"] + list(args)
    result = subprocess.run(
        cmd,
        cwd=repo_path,
        capture_output=capture_output,
        text=True,
    )
    return result


def get_local_branches(repo_path: Path) -> list[str]:
    """Get all local branch names."""
    result = run_git(repo_path, "branch", "--format=%(refname:short)")
    if result.returncode != 0:
        return []
    return [b.strip() for b in result.stdout.strip().split("\n") if b.strip()]


def get_status(repo_path: Path, branch: str) -> dict:
    """Get git status for a specific branch."""
    # Check if branch exists
    result = run_git(repo_path, "rev-parse", "--verify", f"refs/heads/{branch}")
    if result.returncode != 0:
        return {"has_changes": False, "error": "Branch not found"}

    # Get status
    result = run_git(repo_path, "status", "--porcelain")
    lines = result.stdout.strip().split("\n") if result.stdout.strip() else []
    
    staged = []
    unstaged = []
    untracked = []
    
    for line in lines:
        if len(line) < 2:
            continue
        status = line[:2]
        filepath = line[3:]
        
        if status[0] in ("M", "A", "D", "R", "C"):
            staged.append(filepath)
        if status[1] in ("M", "D"):
            unstaged.append(filepath)
        if "?" in status:
            untracked.append(filepath)
    
    return {
        "has_changes": bool(staged or unstaged or untracked),
        "staged": staged,
        "unstaged": unstaged,
        "untracked": untracked,
    }


def get_file_types(files: list[str]) -> list[str]:
    """Get unique file extensions from file list."""
    exts = set()
    for f in files:
        ext = Path(f).suffix.lstrip(".")
        if ext:
            exts.add(ext)
    return sorted(exts)


def generate_commit_message(branch: str, status: dict) -> str:
    """Generate a commit message based on changed files."""
    all_files = status["staged"] + status["unstaged"] + status["untracked"]
    file_count = len(all_files)
    
    if file_count == 0:
        return "No changes"
    
    # Get unique file types
    exts = get_file_types(all_files)
    ext_str = ", ".join(exts[:5])  # Limit to 5 types
    if len(exts) > 5:
        ext_str += f" +{len(exts) - 5} more"
    
    return f"[{branch}] WIP: {file_count} files modified ({ext_str})"


def stage_all_changes(repo_path: Path) -> bool:
    """Stage all changes (tracked and untracked)."""
    result = run_git(repo_path, "add", "-A")
    return result.returncode == 0


def commit_changes(repo_path: Path, message: str) -> bool:
    """Commit staged changes."""
    result = run_git(repo_path, "commit", "-m", message)
    return result.returncode == 0


def push_branch(repo_path: Path, branch: str) -> tuple[bool, str]:
    """Push branch to remote. Returns (success, message)."""
    # Check if branch has remote
    result = run_git(repo_path, "rev-parse", "--verify", f"refs/heads/{branch}")
    if result.returncode != 0:
        return False, "Branch not found"
    
    # Try normal push first
    result = run_git(repo_path, "push", "origin", branch)
    if result.returncode == 0:
        return True, "Pushed"
    
    # Check if branch exists on remote
    check_remote = run_git(repo_path, "ls-remote", "--heads", "origin", branch)
    if check_remote.returncode == 0 and check_remote.stdout.strip():
        # Branch exists, force push
        force_result = run_git(repo_path, "push", "-f", "origin", branch)
        if force_result.returncode == 0:
            return True, "Force pushed (local was ahead)"
        return False, force_result.stderr
    
    # Branch doesn't exist, create on remote
    create_result = run_git(repo_path, "push", "-u", "origin", branch)
    if create_result.returncode == 0:
        return True, "Created and pushed"
    
    return False, create_result.stderr


def clean_branch(repo_path: Path, branch: str, dry_run: bool = False) -> dict:
    """Clean a single branch - stage, commit, and push."""
    # Checkout branch
    if dry_run:
        print(f"[DRY-RUN] Would checkout branch: {branch}")
    else:
        result = run_git(repo_path, "checkout", branch)
        if result.returncode != 0:
            return {"error": f"Failed to checkout: {result.stderr}"}
    
    # Get status
    status = get_status(repo_path, branch)
    
    if not status.get("has_changes"):
        return {
            "branch": branch,
            "status": "clean",
            "action": "Skipped",
            "files": 0,
        }
    
    # Stage all changes
    if dry_run:
        print(f"[DRY-RUN] Would stage all changes")
    else:
        if not stage_all_changes(repo_path):
            return {"error": "Failed to stage changes"}
    
    # Generate and commit
    message = generate_commit_message(branch, status)
    file_count = len(status["staged"] + status["unstaged"] + status["untracked"])
    
    if dry_run:
        print(f"[DRY-RUN] Would commit with message: {message}")
    else:
        if not commit_changes(repo_path, message):
            return {"error": f"Failed to commit: {result.stderr}"}
    
    # Push
    if dry_run:
        print(f"[DRY-RUN] Would push branch")
        push_success = True
        push_msg = "Would push"
    else:
        push_success, push_msg = push_branch(repo_path, branch)
    
    return {
        "branch": branch,
        "status": "pushed" if push_success else "error",
        "action": f"Committed & {push_msg}",
        "message": message,
        "files": file_count,
    }


def main():
    parser = argparse.ArgumentParser(description="Scan and push uncommitted changes")
    parser.add_argument("--repo-path", default=".", help="Path to git repository")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    parser.add_argument("--branch", help="Clean specific branch only")
    args = parser.parse_args()
    
    repo_path = Path(args.repo_path).resolve()
    
    # Verify it's a git repo
    if not (repo_path / ".git").exists():
        print(f"Error: Not a git repository: {repo_path}")
        sys.exit(1)
    
    # Get current branch to return to
    current = run_git(repo_path, "branch", "--show-current").stdout.strip()
    
    # Get branches to process
    if args.branch:
        branches = [args.branch]
    else:
        branches = get_local_branches(repo_path)
    
    print(f"\n{'='*60}")
    print(f"Git Clean - {'DRY RUN' if args.dry_run else 'Executing'}")
    print(f"Repository: {repo_path}")
    print(f"{'='*60}\n")
    
    results = []
    for branch in branches:
        # Skip current branch for now, handle at end if needed
        if branch == current and not args.branch:
            continue
            
        print(f"Processing: {branch}")
        result = clean_branch(repo_path, branch, dry_run=args.dry_run)
        results.append(result)
        
        if "error" in result:
            print(f"  ❌ Error: {result['error']}")
        elif result["status"] == "clean":
            print(f"  ✅ Clean - No changes")
        else:
            print(f"  ⚡ {result['action']}")
            print(f"      Files: {result['files']}")
            if "message" in result:
                print(f"      Message: {result['message']}")
        print()
    
    # Handle current branch if not same as checked out
    if current and (not args.branch or args.branch != current):
        print(f"Processing current branch: {current}")
        result = clean_branch(repo_path, current, dry_run=args.dry_run)
        results.append(result)
        
        if "error" in result:
            print(f"  ❌ Error: {result['error']}")
        elif result["status"] == "clean":
            print(f"  ✅ Clean - No changes")
        else:
            print(f"  ⚡ {result['action']}")
            print(f"      Files: {result['files']}")
        print()
    
    # Summary
    print(f"{'='*60}")
    print("Summary")
    print(f"{'='*60}")
    
    # Print table
    print(f"\n{'Branch':<25} {'Status':<10} {'Action':<35} {'Files':<6}")
    print("-" * 80)
    
    for r in results:
        if "error" in r:
            print(f"{r.get('branch', '?'):<25} {'ERROR':<10} {r['error']:<35} {'-':<6}")
        else:
            print(f"{r['branch']:<25} {r['status']:<10} {r['action']:<35} {r.get('files', 0)}")
    
    pushed = sum(1 for r in results if r.get("status") == "pushed")
    clean = sum(1 for r in results if r.get("status") == "clean")
    errors = sum(1 for r in results if "error" in r)
    
    print(f"\nTotal: {len(results)} branches | Pushed: {pushed} | Clean: {clean} | Errors: {errors}")
    
    if args.dry_run:
        print("\n⚠️  This was a dry run. Run without --dry-run to execute.")
    
    sys.exit(0 if errors == 0 else 1)


if __name__ == "__main__":
    main()
