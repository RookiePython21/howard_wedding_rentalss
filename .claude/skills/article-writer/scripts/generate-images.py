#!/usr/bin/env python3
"""
generate-images.py

Generates two AI images for a blog article using Gemini 2.5 Flash Image:
  - [slug]-cover.png  -> hero/cover image
  - [slug]-body.png   -> inline body image

Usage:
  python .claude/skills/article-writer/scripts/generate-images.py \
    --slug "wedding-seating-chart-board-ideas" \
    --cover-prompt "Rows of custom printed foam board seating charts on wooden easels..." \
    --body-prompt "Close-up of wedding place settings with name cards on linen..."

If one of the two images fails (the model sometimes answers with text instead of an
image), reword that prompt and rerun with --skip-existing so the image that already
succeeded is not regenerated and re-billed:

  python .claude/skills/article-writer/scripts/generate-images.py \
    --slug "wedding-seating-chart-board-ideas" \
    --cover-prompt "..." --body-prompt "<reworded>" --skip-existing

Run from the project root so that public/images/blog/ resolves correctly.
"""

import argparse
import base64
import io
import os
import sys
from pathlib import Path

# Load .env from project root so GEMINI_API_KEY is available when running
# from within the project directory
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[4] / ".env")
except ImportError:
    pass  # dotenv optional; fall back to shell environment

from google import genai


def generate_image(
    client: genai.Client, prompt: str, output_path: str, skip_existing: bool = False
) -> None:
    if skip_existing and os.path.exists(output_path):
        print(f"  Skipping:   {os.path.basename(output_path)} (already exists)")
        return

    print(f"  Generating: {os.path.basename(output_path)}")
    print(f"  Prompt:     {prompt[:120]}{'...' if len(prompt) > 120 else ''}")

    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[prompt],
    )

    # Collect parts from whichever response structure the SDK version uses
    parts = []
    if hasattr(response, "parts"):
        parts = response.parts
    elif hasattr(response, "candidates") and response.candidates:
        parts = response.candidates[0].content.parts

    saved = False
    for part in parts:
        if hasattr(part, "inline_data") and part.inline_data is not None:
            raw = part.inline_data.data
            # data may be bytes or a base64 string depending on SDK version
            if isinstance(raw, str):
                raw = base64.b64decode(raw)
            from PIL import Image as PILImage
            img = PILImage.open(io.BytesIO(raw))
            img.save(output_path)
            saved = True
            break

    if not saved:
        for part in parts:
            if hasattr(part, "text") and part.text:
                print(f"  Model response: {part.text}", file=sys.stderr)
        raise RuntimeError(f"No image data returned for {os.path.basename(output_path)}")

    print(f"  Saved -> {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate blog article images via Gemini")
    parser.add_argument("--slug", required=True, help="Article slug (used for output filenames)")
    parser.add_argument("--cover-prompt", required=True, help="Prompt for the cover/hero image")
    parser.add_argument("--body-prompt", required=True, help="Prompt for the inline body image")
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip any image whose output file already exists. Use when retrying after one of the "
        "two images failed, so the successful one is not regenerated and re-billed.",
    )
    args = parser.parse_args()

    output_dir = os.path.join("public", "images", "blog")
    os.makedirs(output_dir, exist_ok=True)

    cover_path = os.path.join(output_dir, f"{args.slug}-cover.png")
    body_path = os.path.join(output_dir, f"{args.slug}-body.png")

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print(
            "\nError: GEMINI_API_KEY not found.\n"
            "Add it to your project .env file:\n"
            "  GEMINI_API_KEY=your_key_here\n"
            "Or export it in your shell before running the script.",
            file=sys.stderr,
        )
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    print(f"\nGenerating images for: {args.slug}\n")

    generate_image(client, args.cover_prompt, cover_path, args.skip_existing)
    print()
    generate_image(client, args.body_prompt, body_path, args.skip_existing)

    print(f"\nDone.")
    print(f"  Cover: /images/blog/{args.slug}-cover.png")
    print(f"  Body:  /images/blog/{args.slug}-body.png")


if __name__ == "__main__":
    main()
