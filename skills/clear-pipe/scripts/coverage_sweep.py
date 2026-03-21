#!/usr/bin/env python3
"""
coverage_sweep.py — Test Coverage Diffing Tool
Part of the clear-pipe CI pipeline.

Usage:
    python3 coverage_sweep.py [--root <repo_root>] [--output <report.json>] [--fix] [--verbose]

What it does:
1. Walks the source tree and extracts public symbols (functions, classes, DB RPC calls)
2. Walks the test tree and maps existing test coverage per symbol
3. Diffs: identifies untested symbols and stale tests pointing at deleted/renamed symbols
4. Optionally generates stub tests for uncovered symbols (--fix)
5. Suggests refactors when an existing test is a close match for a new symbol
6. Outputs a JSON report + human-readable summary
"""

import ast
import os
import re
import sys
import json
import argparse
import difflib
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional


# ─── Configuration ────────────────────────────────────────────────────────────

# Directories to scan for source code
SOURCE_DIRS = [
    "src",
    "app",
    "lib",
    "components",
    "pages",
    "api",
    "server",
    "supabase/functions",
]

# Directories to scan for tests
TEST_DIRS = [
    "tests",
    "test",
    "__tests__",
    "src/__tests__",
    "src/tests",
    "spec",
]

# File extensions to treat as source code
SOURCE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py"}

# File extensions to treat as tests
TEST_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py"}

# Patterns used in test files to detect what they're testing
TEST_REFERENCE_PATTERNS = [
    r"import\s+.*?from\s+['\"]([^'\"]+)['\"]",          # TS/JS imports
    r"require\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",          # CommonJS require
    r"from\s+(\S+)\s+import",                             # Python imports
    r"describe\s*\(\s*['\"]([^'\"]+)['\"]",              # Jest describe blocks
    r"it\s*\(\s*['\"]([^'\"]+)['\"]",                    # Jest it()
    r"test\s*\(\s*['\"]([^'\"]+)['\"]",                  # Jest test()
    r"def\s+test_(\w+)",                                  # Pytest function names
]

# Supabase RPC call patterns to extract DB function references
RPC_PATTERNS = [
    r"\.rpc\s*\(\s*['\"](\w+)['\"]",                     # .rpc('function_name')
    r"supabase\.from\s*\(\s*['\"](\w+)['\"]",            # supabase.from('table')
    r"CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)",   # SQL function creation
    r"DROP\s+FUNCTION\s+(?:IF\s+EXISTS\s+)?(\w+)",      # SQL DROP FUNCTION
]

# Test stub templates
STUB_TEMPLATES = {
    ".ts": """
// AUTO-GENERATED STUB by coverage_sweep.py — implement this test
import {{ describe, it, expect }} from 'vitest';

describe('{module_name}', () => {{
  it('should handle {symbol_name} correctly', async () => {{
    // TODO: Add test implementation for {symbol_name}
    // Suggested: call with real data and assert expected output
    expect(true).toBe(false); // Force-fail until implemented
  }});
}});
""",
    ".py": """
# AUTO-GENERATED STUB by coverage_sweep.py — implement this test
import pytest

def test_{symbol_name}_basic():
    \"\"\"Test {symbol_name} with real data.\"\"\"
    # TODO: Add test implementation
    # Suggested: call with real data and assert expected output
    assert False, "Stub — not yet implemented"
""",
}


# ─── Data Classes ──────────────────────────────────────────────────────────────

@dataclass
class Symbol:
    name: str
    file: str
    line: int
    kind: str  # "function", "class", "rpc", "table"
    is_public: bool = True


@dataclass
class TestReference:
    test_file: str
    referenced_module: str
    referenced_symbol: Optional[str]
    match_confidence: float = 1.0


@dataclass
class CoverageGap:
    symbol: Symbol
    has_any_test: bool
    suggested_refactor: Optional[str]  # path of existing test that could be expanded
    stub_path: Optional[str]           # path where stub was written (if --fix)


@dataclass
class SweepReport:
    repo_root: str
    total_symbols: int = 0
    covered_symbols: int = 0
    uncovered_symbols: int = 0
    stale_tests: list = field(default_factory=list)
    coverage_gaps: list = field(default_factory=list)
    rpc_coverage: dict = field(default_factory=dict)
    refactor_suggestions: list = field(default_factory=list)
    coverage_pct: float = 0.0
    status: str = "unknown"  # "green", "yellow", "red"


# ─── Source Extraction ─────────────────────────────────────────────────────────

def find_files(root: Path, dirs: list, extensions: set, exclude_dirs=None) -> list[Path]:
    """Walk given subdirs and collect files with matching extensions."""
    if exclude_dirs is None:
        exclude_dirs = {"node_modules", ".git", "dist", "build", ".next", "__pycache__", ".turbo"}
    result = []
    for d in dirs:
        target = root / d
        if not target.exists():
            continue
        for path in target.rglob("*"):
            if path.suffix in extensions and not any(x in path.parts for x in exclude_dirs):
                result.append(path)
    return result


def extract_python_symbols(file_path: Path) -> list[Symbol]:
    """Extract public functions and classes from a Python file."""
    symbols = []
    try:
        tree = ast.parse(file_path.read_text(encoding="utf-8", errors="ignore"))
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if not node.name.startswith("_"):
                    symbols.append(Symbol(
                        name=node.name,
                        file=str(file_path),
                        line=node.lineno,
                        kind="function",
                    ))
            elif isinstance(node, ast.ClassDef):
                if not node.name.startswith("_"):
                    symbols.append(Symbol(
                        name=node.name,
                        file=str(file_path),
                        line=node.lineno,
                        kind="class",
                    ))
    except SyntaxError:
        pass
    return symbols


def extract_ts_symbols(file_path: Path) -> list[Symbol]:
    """Extract exported functions/classes from TypeScript/JavaScript via regex."""
    symbols = []
    content = file_path.read_text(encoding="utf-8", errors="ignore")
    patterns = [
        (r"^export\s+(?:async\s+)?function\s+(\w+)", "function"),
        (r"^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(", "function"),
        (r"^export\s+class\s+(\w+)", "class"),
        (r"^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)", "function"),
        (r"^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?function", "function"),
    ]
    for line_num, line in enumerate(content.splitlines(), 1):
        for pattern, kind in patterns:
            m = re.match(pattern, line.strip())
            if m:
                symbols.append(Symbol(
                    name=m.group(1),
                    file=str(file_path),
                    line=line_num,
                    kind=kind,
                ))
    return symbols


def extract_rpc_calls(file_path: Path) -> list[Symbol]:
    """Extract Supabase RPC calls and table references from source files."""
    symbols = []
    content = file_path.read_text(encoding="utf-8", errors="ignore")
    for pattern in RPC_PATTERNS:
        for m in re.finditer(pattern, content, re.IGNORECASE):
            symbols.append(Symbol(
                name=m.group(1),
                file=str(file_path),
                line=content[:m.start()].count("\n") + 1,
                kind="rpc",
            ))
    return symbols


def extract_all_symbols(root: Path) -> list[Symbol]:
    """Extract all source symbols from the repo."""
    symbols: list[Symbol] = []

    # Find all source files (excluding test files)
    test_patterns = {"test", "spec", "__test__", ".test.", ".spec."}
    source_files = find_files(root, SOURCE_DIRS, SOURCE_EXTENSIONS)
    # Also search top-level src if SOURCE_DIRS don't capture everything
    for path in root.glob("*.py"):
        source_files.append(path)

    for file_path in source_files:
        fname = file_path.name.lower()
        # Skip test files
        if any(p in fname for p in test_patterns):
            continue

        if file_path.suffix == ".py":
            symbols.extend(extract_python_symbols(file_path))
        elif file_path.suffix in {".ts", ".tsx", ".js", ".jsx"}:
            symbols.extend(extract_ts_symbols(file_path))
            symbols.extend(extract_rpc_calls(file_path))

    # Also scan SQL migration files for function definitions
    for sql_path in (root / "supabase" / "migrations").rglob("*.sql") if (root / "supabase").exists() else []:
        symbols.extend(extract_rpc_calls(sql_path))

    return symbols


# ─── Test Coverage Mapping ─────────────────────────────────────────────────────

def extract_test_references(root: Path) -> dict[str, list[TestReference]]:
    """
    Map each test file to the modules/symbols it references.
    Returns dict: symbol_name -> [TestReference, ...]
    """
    coverage: dict[str, list[TestReference]] = {}
    test_files = find_files(root, TEST_DIRS, TEST_EXTENSIONS)

    # Also find test files in source dirs (*.test.ts etc.)
    for d in SOURCE_DIRS:
        tgt = root / d
        if tgt.exists():
            for p in tgt.rglob("*.test.*"):
                test_files.append(p)
            for p in tgt.rglob("*.spec.*"):
                test_files.append(p)
            for p in tgt.rglob("test_*.py"):
                test_files.append(p)

    # Deduplicate
    test_files = list(set(test_files))

    for tf in test_files:
        content = tf.read_text(encoding="utf-8", errors="ignore")
        for pattern in TEST_REFERENCE_PATTERNS:
            for m in re.finditer(pattern, content, re.MULTILINE):
                ref = m.group(1)
                # Extract just the last segment as the likely symbol name
                symbol_guess = Path(ref).stem.replace("-", "_").replace(".", "_")
                tr = TestReference(
                    test_file=str(tf),
                    referenced_module=ref,
                    referenced_symbol=symbol_guess,
                )
                key = symbol_guess.lower()
                coverage.setdefault(key, []).append(tr)

    return coverage


# ─── Gap Analysis ──────────────────────────────────────────────────────────────

def find_refactor_candidate(symbol: Symbol, test_refs: dict) -> Optional[str]:
    """
    Find an existing test file that's a close match for a symbol (by name similarity).
    Returns the test file path if confidence > 0.6.
    """
    all_test_files = set()
    for refs in test_refs.values():
        for tr in refs:
            all_test_files.add(tr.test_file)

    best_match = None
    best_score = 0.0
    for tf in all_test_files:
        stem = Path(tf).stem.lower().replace(".test", "").replace(".spec", "").replace("test_", "")
        score = difflib.SequenceMatcher(None, symbol.name.lower(), stem).ratio()
        if score > best_score:
            best_score = score
            best_match = tf

    if best_score > 0.6:
        return best_match
    return None


def analyze_coverage(symbols: list[Symbol], test_refs: dict, verbose: bool = False) -> SweepReport:
    """Produce a SweepReport by diffing symbols against test references."""
    report = SweepReport(repo_root="")
    report.total_symbols = len(symbols)

    for sym in symbols:
        key = sym.name.lower()
        refs = test_refs.get(key, [])
        has_test = len(refs) > 0

        if has_test:
            report.covered_symbols += 1
        else:
            report.uncovered_symbols += 1
            refactor_candidate = find_refactor_candidate(sym, test_refs)
            gap = CoverageGap(
                symbol=sym,
                has_any_test=False,
                suggested_refactor=refactor_candidate,
                stub_path=None,
            )
            report.coverage_gaps.append(asdict(gap))

        # Track RPC separately
        if sym.kind == "rpc":
            report.rpc_coverage[sym.name] = has_test

    report.coverage_pct = (
        (report.covered_symbols / report.total_symbols * 100)
        if report.total_symbols > 0 else 0
    )

    if report.coverage_pct >= 80:
        report.status = "green"
    elif report.coverage_pct >= 50:
        report.status = "yellow"
    else:
        report.status = "red"

    return report


# ─── Stub Generation ───────────────────────────────────────────────────────────

def write_stub(gap: dict, root: Path) -> Optional[str]:
    """Write a stub test file for an uncovered symbol. Returns the path written."""
    sym = gap["symbol"]
    source_path = Path(sym["file"])
    ext = source_path.suffix

    template = STUB_TEMPLATES.get(ext) or STUB_TEMPLATES.get(".ts")

    stub_content = template.format(
        module_name=source_path.stem,
        symbol_name=sym["name"],
    )

    # Determine stub path: mirror source path under __tests__
    try:
        rel = source_path.relative_to(root)
    except ValueError:
        rel = Path(source_path.name)

    stub_dir = root / "__tests__" / "generated" / rel.parent
    stub_dir.mkdir(parents=True, exist_ok=True)
    stub_filename = f"{rel.stem}.{sym['name']}.stub{ext}"
    stub_path = stub_dir / stub_filename

    if not stub_path.exists():
        stub_path.write_text(stub_content.strip() + "\n")

    return str(stub_path)


# ─── Refactor Suggestions ──────────────────────────────────────────────────────

def build_refactor_suggestions(report: SweepReport) -> list[dict]:
    """
    For each gap with a suggested_refactor candidate, emit a structured suggestion
    that can be auto-applied or shown to the agent for manual expansion.
    """
    suggestions = []
    for gap in report.coverage_gaps:
        if gap.get("suggested_refactor"):
            suggestions.append({
                "symbol": gap["symbol"]["name"],
                "source_file": gap["symbol"]["file"],
                "existing_test": gap["suggested_refactor"],
                "action": "expand_existing_test",
                "note": (
                    f"Expand '{Path(gap['suggested_refactor']).name}' to cover "
                    f"'{gap['symbol']['name']}' from '{Path(gap['symbol']['file']).name}'"
                ),
            })
    return suggestions


# ─── Report Formatting ─────────────────────────────────────────────────────────

STATUS_EMOJI = {"green": "✅", "yellow": "⚠️", "red": "❌"}

def print_summary(report: SweepReport):
    """Print a human-readable summary to stdout."""
    emoji = STATUS_EMOJI.get(report.status, "❓")
    print(f"\n{emoji} COVERAGE SWEEP RESULT: {report.status.upper()}")
    print(f"   Coverage:  {report.coverage_pct:.1f}%")
    print(f"   Symbols:   {report.covered_symbols}/{report.total_symbols} covered")
    print(f"   Gaps:      {report.uncovered_symbols} uncovered symbols")

    if report.rpc_coverage:
        rpc_uncovered = [k for k, v in report.rpc_coverage.items() if not v]
        if rpc_uncovered:
            print(f"\n⚠️  UNCOVERED DB/RPC CALLS ({len(rpc_uncovered)}):")
            for rpc in rpc_uncovered[:20]:
                print(f"   • {rpc}")

    if report.coverage_gaps:
        print(f"\n📋 TOP UNCOVERED SYMBOLS (showing up to 20):")
        for gap in report.coverage_gaps[:20]:
            sym = gap["symbol"]
            refactor = gap.get("suggested_refactor")
            stub = gap.get("stub_path")
            line = f"   • [{sym['kind']}] {sym['name']}  ({Path(sym['file']).name}:{sym['line']})"
            if stub:
                line += f"\n       → Stub written: {stub}"
            elif refactor:
                line += f"\n       → Suggest refactor: {Path(refactor).name}"
            print(line)

    if report.refactor_suggestions:
        print(f"\n🔧 REFACTOR SUGGESTIONS ({len(report.refactor_suggestions)}):")
        for s in report.refactor_suggestions[:10]:
            print(f"   • {s['note']}")


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Test Coverage Sweep Tool")
    parser.add_argument("--root", default=".", help="Repo root directory (default: cwd)")
    parser.add_argument("--output", default="coverage_sweep_report.json", help="Output JSON report path")
    parser.add_argument("--fix", action="store_true", help="Write stub tests for uncovered symbols")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--exit-code", action="store_true", help="Exit 1 if status is red, 2 if yellow")
    parser.add_argument("--threshold", type=float, default=0.0,
                        help="Minimum coverage %% required (0=disabled). Exit 1 if below threshold.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    print(f"🔍 Scanning repo: {root}")

    # Extract symbols from source
    print("  → Extracting source symbols...")
    symbols = extract_all_symbols(root)
    print(f"     Found {len(symbols)} symbols")

    # Map test coverage
    print("  → Mapping test coverage...")
    test_refs = extract_test_references(root)
    print(f"     Found references in {sum(len(v) for v in test_refs.values())} test files")

    # Analyze
    print("  → Analyzing coverage gaps...")
    report = analyze_coverage(symbols, test_refs, verbose=args.verbose)
    report.repo_root = str(root)

    # Optionally write stubs
    if args.fix and report.coverage_gaps:
        print(f"  → Writing stub tests for {len(report.coverage_gaps)} uncovered symbols...")
        for i, gap in enumerate(report.coverage_gaps):
            stub_path = write_stub(gap, root)
            report.coverage_gaps[i]["stub_path"] = stub_path

    # Build refactor suggestions
    report.refactor_suggestions = build_refactor_suggestions(report)

    # Write JSON report
    output_path = Path(args.output)
    with open(output_path, "w") as f:
        json.dump(asdict(report), f, indent=2)
    print(f"\n📄 Report written to: {output_path}")

    # Human summary
    print_summary(report)

    # Exit code logic
    if args.threshold > 0 and report.coverage_pct < args.threshold:
        print(f"\n🚫 BLOCKED: Coverage {report.coverage_pct:.1f}% is below required threshold {args.threshold}%")
        sys.exit(1)

    if args.exit_code:
        if report.status == "red":
            sys.exit(1)
        elif report.status == "yellow":
            sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
