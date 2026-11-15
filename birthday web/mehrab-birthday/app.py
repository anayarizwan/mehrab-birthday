"""
Mehrab's Little Universe - a magical, password-protected birthday website.

Run locally:
    pip install -r requirements.txt
    cp .env.example .env   # then edit values
    python app.py
    open http://127.0.0.1:5000

The default dev password is set in config.DEFAULT_PASSWORD (or the
BIRTHDAY_PASSWORD env var). See README.md to change it.
"""

import os
import secrets
import hmac
from pathlib import Path

from flask import (
    Flask, render_template, request, redirect, url_for,
    session, send_from_directory, abort, jsonify, flash
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / '.env')

from config import Config, USERNAME, SECURITY_HEADERS


# --------------------------------------------------------------------------- #
# App factory
# --------------------------------------------------------------------------- #
def create_app(config_class=Config):
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(config_class)

    # Make sure the private uploads folder exists.
    Path(app.config["PRIVATE_UPLOADS_DIR"]).mkdir(parents=True, exist_ok=True)
    Path(app.config["PLACEHOLDER_IMAGES_DIR"]).mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    def _password_hash():
        """Read the (hashed) password from env, or hash the dev default."""
        stored = os.environ.get("BIRTHDAY_PASSWORD_HASH")
        if stored:
            return stored
        # Hash the plain dev password once per process start so the real
        # password is never stored in plaintext in memory beyond boot.
        return generate_password_hash(
            app.config["DEFAULT_PASSWORD"],
            method=app.config["PASSWORD_HASH_METHOD"],
            salt_length=app.config["PASSWORD_HASH_SALT_LEN"],
        )

    PASSWORD_HASH = _password_hash()

    def is_logged_in():
        """True if the current session has been authenticated."""
        return session.get("authed") is True

    def generate_csrf_token():
        """Create and store a CSRF token in the session."""
        if "_csrf_token" not in session:
            session["_csrf_token"] = secrets.token_urlsafe(32)
        return session["_csrf_token"]

    def check_csrf_token(token):
        """Constant-time comparison of a posted CSRF token."""
        stored = session.get("_csrf_token")
        if not stored or not token:
            return False
        return hmac.compare_digest(stored, token)

    # Make csrf_token available in all templates
    app.jinja_env.globals["csrf_token"] = generate_csrf_token

    # ------------------------------------------------------------------ #
    # Security headers on every response
    # ------------------------------------------------------------------ #
    @app.after_request
    def apply_security_headers(resp):
        for k, v in SECURITY_HEADERS.items():
            resp.headers.setdefault(k, v)
        # Never let the login page be framed
        if request.endpoint in {"login", "verify"}:
            resp.headers["X-Frame-Options"] = "DENY"
        return resp

    # ------------------------------------------------------------------ #
    # Public static files (only safe, non-personal assets are public)
    # ------------------------------------------------------------------ #
    # Flask already serves /static/* automatically; personal photos are
    # served through the protected /image/<name> route below.

    # ------------------------------------------------------------------ #
    # Routes
    # ------------------------------------------------------------------ #
    @app.route("/")
    def index():
        """The main birthday site. Requires authentication."""
        if not is_logged_in():
            return redirect(url_for("login"))
        return render_template("index.html")

    @app.route("/login", methods=["GET", "POST"])
    def login():
        """Password entry screen."""
        # If already logged in, send them straight to the universe.
        if is_logged_in():
            return redirect(url_for("index"))

        if request.method == "GET":
            return render_template("login.html", error=False)

        # POST: verify password
        token = request.form.get("csrf_token", "")
        if not check_csrf_token(token):
            return render_template("login.html", error=True,
                                   error_msg="Session expired. Please try again."), 400

        password = request.form.get("password", "")
        if check_password_hash(PASSWORD_HASH, password):
            # Regenerate session id to prevent fixation
            session.clear()
            session["authed"] = True
            session["user"] = USERNAME
            session.permanent = True
            return redirect(url_for("index"))

        # Wrong password
        return render_template(
            login_template_name(),
            error=True,
            error_msg="Oops! That's not the magic word. Try again, bestie."
        ), 401

    def login_template_name():
        return "login.html"

    @app.route("/logout")
    def logout():
        """End the session and return to the login screen."""
        session.clear()
        flash("You've been logged out. Come back soon!", "info")
        return redirect(url_for("login"))

    @app.route("/check")
    def check_auth():
        """Tiny AJAX endpoint so the frontend can verify the session."""
        return jsonify({"authed": is_logged_in()})

    # ------------------------------------------------------------------ #
    # Protected image endpoint
    # ------------------------------------------------------------------ #
    @app.route("/image/<path:filename>")
    def protected_image(filename):
        """Serve an image from private_uploads OR static/images/placeholders.

        Personal photos should be dropped into private_uploads/ and will
        ONLY be served through this route (i.e. only when logged in).
        Anything in static/images/placeholders is safe to show publicly,
        so we fall back there for dummy images used in the gallery.
        """
        if not is_logged_in():
            abort(403, description="Please log in to view this image.")

        # Basic path safety
        if ".." in filename or filename.startswith("/"):
            abort(400, description="Invalid filename.")

        ext = Path(filename).suffix.lower()
        if ext not in app.config["ALLOWED_IMAGE_EXTENSIONS"]:
            abort(400, description="Unsupported file type.")

        # 1) Try personal photos first
        private_dir = Path(app.config["PRIVATE_UPLOADS_DIR"])
        candidate = private_dir / filename
        if candidate.is_file():
            response = send_from_directory(str(private_dir), filename)
            response.headers["Cache-Control"] = "private, no-store, max-age=0"
            response.headers["Vary"] = "Cookie"
            response.headers["X-Robots-Tag"] = "noindex, nofollow"
            return response

        # 2) Fall back to public placeholder images
        placeholder_dir = Path(app.config["PLACEHOLDER_IMAGES_DIR"])
        candidate2 = placeholder_dir / filename
        if candidate2.is_file():
            response = send_from_directory(str(placeholder_dir), filename)
            response.headers["Cache-Control"] = "private, no-store, max-age=0"
            response.headers["Vary"] = "Cookie"
            response.headers["X-Robots-Tag"] = "noindex, nofollow"
            return response

        abort(404, description="Image not found.")

    # ------------------------------------------------------------------ #
    # Error handlers
    # ------------------------------------------------------------------ #
    @app.errorhandler(403)
    def forbidden(e):
        return render_template("login.html", error=True,
                               error_msg="Please log in to continue."), 403

    @app.errorhandler(404)
    def not_found(e):
        if is_logged_in():
            return ("<h1 style='font-family:Poppins;text-align:center;color:#6D28D9;"
                    "margin-top:20vh'>404 - this corner of the universe is empty.</h1>"), 404
        return redirect(url_for("login"))

    return app


# Create the module-level app for `flask run` / `python app.py`
app = create_app()


if __name__ == "__main__":
    # When deploying, use a production WSGI server like gunicorn:
    #   gunicorn -b 0.0.0.0:8000 app:app
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)),
            debug=app.config["DEBUG"])
