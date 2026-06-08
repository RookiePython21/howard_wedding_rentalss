"""
send-sms.py — Twilio SMS sender for Howard Wedding Rentals SEO system.

Reads credentials from .env at project root (no external packages required).
Usage: python .claude/seo/scripts/send-sms.py "Your message here"

Called automatically at the end of the bi-weekly keyword research routine.
"""

import sys
import os
import urllib.request
import urllib.parse
import base64


def get_env_var(name):
    """Read from shell environment first, then fall back to parsing .env file."""
    if name in os.environ:
        return os.environ[name]
    env_paths = ['.env', os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env')]
    for env_path in env_paths:
        try:
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith(f'{name}=') and not line.startswith('#'):
                        value = line[len(f'{name}='):].strip()
                        return value.strip('"\'')
        except FileNotFoundError:
            continue
    return None


def send_sms(message):
    sid   = get_env_var('TWILIO_ACCOUNT_SID')
    token = get_env_var('TWILIO_AUTH_TOKEN')
    frm   = get_env_var('TWILIO_FROM_NUMBER')
    to    = get_env_var('TWILIO_TO_NUMBER')

    missing = [n for n, v in [('TWILIO_ACCOUNT_SID', sid), ('TWILIO_AUTH_TOKEN', token),
                                ('TWILIO_FROM_NUMBER', frm), ('TWILIO_TO_NUMBER', to)] if not v]
    if missing:
        print(f"ERROR: Missing Twilio env vars: {', '.join(missing)}")
        sys.exit(1)

    url  = f'https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json'
    data = urllib.parse.urlencode({'To': to, 'From': frm, 'Body': message}).encode('utf-8')
    creds = base64.b64encode(f'{sid}:{token}'.encode('utf-8')).decode('utf-8')

    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Basic {creds}')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')

    try:
        with urllib.request.urlopen(req) as response:
            print(f"SMS sent successfully. HTTP status: {response.status}")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"SMS ERROR: HTTP {e.code} {e.reason}")
        print(f"Response: {body}")
        return False
    except urllib.error.URLError as e:
        print(f"SMS ERROR: Network error — {e.reason}")
        return False


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python send-sms.py 'message text'")
        sys.exit(1)
    message = ' '.join(sys.argv[1:])
    success = send_sms(message)
    sys.exit(0 if success else 1)
