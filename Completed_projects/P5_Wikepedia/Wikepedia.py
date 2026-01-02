from flask import Flask, request, render_template, redirect, url_for, abort, jsonify
import json, os, pathlib

# Bestimme das Verzeichnis, in dem sich dieses Script befindet
BASE_DIR = pathlib.Path(__file__).parent.absolute()

app = Flask(__name__,
            template_folder=str(BASE_DIR / "templates"),
            static_folder=str(BASE_DIR / "static"))

# -------- Persistenz (JSON) --------
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DATA_FILE = DATA_DIR / "articles.json"

def load_articles():
    if not DATA_FILE.exists():
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_articles(arts):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(arts, f, ensure_ascii=False, indent=2)

def build_tag_set(arts):
    s = set()
    for a in arts:
        for t in a.get("tags", []):
            if t:
                s.add(t)
    return s

# Initial laden
articles = load_articles()
all_tags = build_tag_set(articles)

# -------- Routen --------
@app.route("/")
def home():
    return render_template("Wikepedia_5_Projekt.html",
                           articles=articles,
                           tags_list=sorted(all_tags))

@app.route("/make")
def make():
    return render_template("Wikepedia_Form_5_Projekt.html")

@app.route("/kontakt", methods=["POST"])
def kontakt():
    heading = (request.form.get("heading") or "").strip()
    author  = (request.form.get("author")  or "").strip()
    tags_in = (request.form.get("tags")    or "")
    body    = (request.form.get("article") or "")

    if not heading or not body:
        abort(400, "heading und article sind Pflichtfelder")

    tags = [t.strip() for t in tags_in.split(",") if t.strip()]
    article = {"heading": heading, "author": author, "tags": tags, "article": body}

    articles.append(article)
    save_articles(articles)          # <- WICHTIG: sofort persistieren

    # Tags aktualisieren (robust, ohne Duplikate)
    all_tags.clear()
    all_tags.update(build_tag_set(articles))

    return redirect(url_for("home"))

@app.route("/article/<int:article_id>")
def article_detail(article_id):
    if 0 <= article_id < len(articles):
        return render_template("article_detail.html", a=articles[article_id], idx=article_id)
    return "Artikel nicht gefunden", 404

@app.route("/tag/<tag_name>")
def tag_detail(tag_name):
    tagged = [(i, a) for i, a in enumerate(articles) if tag_name in a.get("tags", [])]
    return render_template("tags_templates.html", tag=tag_name, articles=tagged)

# optional: JSON-Export zum Debuggen/Backup
@app.route("/export.json")
def export_json():
    return jsonify(articles)

if __name__ == "__main__":
    # unter Windows: $env:FLASK_APP="Wikepedia.py"; flask run
    app.run(debug=True)
