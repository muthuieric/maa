#!/usr/bin/env python3
"""
Standalone English -> Maasai translator for the command line.

Loads the NLLB-200 base model plus the community LoRA adapter and prints the
translation. Use this to sanity-check model quality without starting the API.

First run downloads ~3.5 GB. On CPU expect several seconds per sentence.

Examples
--------
    PYTHONPATH=backend/site-packages:. python3 scripts/translate_cli.py \"Hello, how are you?\"
    echo \"Female genital mutilation is harmful.\" | PYTHONPATH=backend/site-packages:. python3 scripts/translate_cli.py --stdin
    PYTHONPATH=backend/site-packages:. python3 scripts/translate_cli.py --status

Environment
-----------
    TRANSLATION_DTYPE=bfloat16   # halve RAM use on CPU (see note in config.py)
"""

import argparse
import os
import sys

# Make the backend importable when run directly from the repo root.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.nlp.translator import check_availability, get_translator  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Translate English text into Maasai (Maa).")
    parser.add_argument("text", nargs="*", help="English text to translate")
    parser.add_argument("--stdin", action="store_true", help="Read input from stdin (one line per item)")
    parser.add_argument("--status", action="store_true", help="Report translator availability and exit")
    parser.add_argument(
        "--max-new-tokens", type=int, default=None, help="Cap generated tokens (default 128)"
    )
    args = parser.parse_args()

    if args.status:
        report = check_availability()
        for key, value in report.items():
            print(f"{key}: {value}")
        return 0 if report.get("available") else 1

    texts = []
    if args.stdin:
        texts = [line.rstrip("\n") for line in sys.stdin if line.strip()]
    texts.extend(args.text)

    if not texts:
        parser.error("Provide text as arguments, or use --stdin.")

    try:
        translator = get_translator()
    except ImportError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 1

    for item in texts:
        result = translator.translate(item, max_new_tokens=args.max_new_tokens)
        print(f"EN: {result['source_text']}")
        print(f"MAS ({result['tgt_lang_code']}): {result['translated_text']}")
        print()

    print("# Licence: cc-by-nc-4.0 (non-commercial). Review output with a Maa speaker.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
