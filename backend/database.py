import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "eztrack.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, email TEXT, avatar TEXT,
            biz_name TEXT, biz_type TEXT, biz_city TEXT,
            lang TEXT DEFAULT 'taglish', tier TEXT DEFAULT 'simula'
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER, type TEXT, desc TEXT,
            amt REAL, date TEXT, cat TEXT DEFAULT '', time TEXT
        );
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER, name TEXT, qty INTEGER,
            unit TEXT, min_threshold INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER, name TEXT, contact TEXT
        );
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER, name TEXT, target_amt REAL, deadline TEXT
        );
    """)
    count = c.execute("SELECT COUNT(*) FROM profiles").fetchone()[0]
    if count == 0:
        _seed(c)
        conn.commit()
    conn.close()

def _seed(c):
    c.executescript("""
        INSERT INTO profiles VALUES
            (1,'Maria Anning','maria@email.com','MA','Anning Sari-Sari Store','sari','Quezon City','taglish','simula'),
            (2,'Juan Dela Cruz','juan@email.com','JD','JC Online Shop','online','Manila','taglish','sigla'),
            (3,'Rosa Magsaysay','rosa@email.com','RM','RM Retail Hub','retail','Makati','taglish','unlad');

        INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time) VALUES
            (1,'inc','Sari-sari store sales',4500,'2026-06-15','','5:30 PM'),
            (1,'inc','Online order #1024',1520,'2026-06-16','','10:15 AM'),
            (1,'exp','Supplies restock',820,'2026-06-14','Supplies','2:00 PM'),
            (1,'inc','Weekly payout',18000,'2026-06-17','','9:00 AM'),
            (1,'exp','Electric bill',380,'2026-06-13','Utilities','11:30 AM'),
            (1,'inc','Referral fee',500,'2026-06-12','','3:45 PM'),
            (1,'exp','Transportation',200,'2026-06-11','Transportation','7:20 AM'),
            (2,'inc','Sari-sari store sales',4500,'2026-06-15','','5:30 PM'),
            (2,'inc','Online order #1024',1520,'2026-06-16','','10:15 AM'),
            (2,'exp','Supplies restock',820,'2026-06-14','Supplies','2:00 PM'),
            (2,'inc','Weekly payout',18000,'2026-06-17','','9:00 AM'),
            (2,'exp','Electric bill',380,'2026-06-13','Utilities','11:30 AM'),
            (2,'inc','Referral fee',500,'2026-06-12','','3:45 PM'),
            (2,'exp','Transportation',200,'2026-06-11','Transportation','7:20 AM'),
            (3,'inc','Sari-sari store sales',4500,'2026-06-15','','5:30 PM'),
            (3,'inc','Online order #1024',1520,'2026-06-16','','10:15 AM'),
            (3,'exp','Supplies restock',820,'2026-06-14','Supplies','2:00 PM'),
            (3,'inc','Weekly payout',18000,'2026-06-17','','9:00 AM'),
            (3,'exp','Electric bill',380,'2026-06-13','Utilities','11:30 AM'),
            (3,'inc','Referral fee',500,'2026-06-12','','3:45 PM'),
            (3,'exp','Transportation',200,'2026-06-11','Transportation','7:20 AM');

        INSERT INTO inventory VALUES
            (1,1,'Cooking Oil (1L)',12,'bottle',5),
            (2,1,'Instant Noodles',24,'pcs',10),
            (3,1,'Canned Sardines',8,'pcs',10),
            (4,1,'Coffee 3in1 (50pk)',3,'box',2),
            (5,1,'Candies (jar)',1,'pack',1),
            (6,2,'Tote Bag',5,'pcs',2),
            (7,2,'Phone Case',12,'pcs',5),
            (8,2,'Keychain',30,'pcs',10),
            (9,3,'T-Shirt (Bulk)',20,'pcs',10),
            (10,3,'Denim Jeans',8,'pcs',5),
            (11,3,'Sneakers (Pair)',6,'pair',3),
            (12,3,'Cap',15,'pcs',5);
    """)

# ── Profile CRUD ──

def get_profiles(conn):
    return [dict(r) for r in conn.execute("SELECT * FROM profiles ORDER BY id").fetchall()]

def get_profile(conn, profile_id):
    r = conn.execute("SELECT * FROM profiles WHERE id=?", (profile_id,)).fetchone()
    return dict(r) if r else None

def create_profile(conn, data):
    c = conn.execute(
        "INSERT INTO profiles (name,email,avatar,biz_name,biz_type,biz_city,lang,tier) VALUES (?,?,?,?,?,?,?,?)",
        (data["name"], data["email"], data.get("avatar",""), data.get("biz_name",""), data.get("biz_type",""), data.get("biz_city",""), data.get("lang","taglish"), data.get("tier","simula"))
    )
    conn.commit()
    return c.lastrowid

PROFILE_ALLOWED_KEYS = {"name", "email", "avatar", "biz_name", "biz_type", "biz_city", "lang", "tier"}

def update_profile(conn, profile_id, data):
    keys = [k for k in data if data[k] is not None and k in PROFILE_ALLOWED_KEYS]
    if not keys:
        return
    set_clause = ", ".join(f"{k}=?" for k in keys)
    values = [data[k] for k in keys] + [profile_id]
    conn.execute(f"UPDATE profiles SET {set_clause} WHERE id=?", values)
    conn.commit()

# ── Transaction CRUD ──

def get_transactions(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM transactions WHERE profile_id=? ORDER BY id DESC", (profile_id,)
    ).fetchall()]

def add_transaction(conn, tx):
    c = conn.execute(
        "INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time) VALUES (?,?,?,?,?,?,?)",
        (tx["profile_id"], tx["type"], tx["desc"], tx["amt"], tx["date"], tx.get("cat",""), tx.get("time",""))
    )
    conn.commit()
    return c.lastrowid

def delete_transaction(conn, tx_id):
    conn.execute("DELETE FROM transactions WHERE id=?", (tx_id,))
    conn.commit()

# ── Inventory CRUD ──

def get_inventory(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM inventory WHERE profile_id=? ORDER BY name", (profile_id,)
    ).fetchall()]

def add_inventory_item(conn, item):
    c = conn.execute(
        "INSERT INTO inventory (profile_id,name,qty,unit,min_threshold) VALUES (?,?,?,?,?)",
        (item["profile_id"], item["name"], item["qty"], item["unit"], item.get("min_threshold", 0))
    )
    conn.commit()
    return c.lastrowid

def set_stock_threshold(conn, item_id, min_threshold):
    conn.execute("UPDATE inventory SET min_threshold=? WHERE id=?", (min_threshold, item_id))
    conn.commit()

INVENTORY_ALLOWED_KEYS = {"name", "qty", "unit", "min_threshold"}

def update_inventory_item(conn, item_id, data):
    keys = [k for k in data if data[k] is not None and k in INVENTORY_ALLOWED_KEYS]
    if not keys:
        return
    set_clause = ", ".join(f"{k}=?" for k in keys)
    values = [data[k] for k in keys] + [item_id]
    conn.execute(f"UPDATE inventory SET {set_clause} WHERE id=?", values)
    conn.commit()

def delete_inventory_item(conn, item_id):
    conn.execute("DELETE FROM inventory WHERE id=?", (item_id,))
    conn.commit()

# ── Customer CRUD ──

def get_customers(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM customers WHERE profile_id=? ORDER BY name", (profile_id,)
    ).fetchall()]

def add_customer(conn, data):
    c = conn.execute(
        "INSERT INTO customers (profile_id,name,contact) VALUES (?,?,?)",
        (data["profile_id"], data["name"], data["contact"])
    )
    conn.commit()
    return c.lastrowid

# ── Goal CRUD ──

def get_goals(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM goals WHERE profile_id=? ORDER BY id", (profile_id,)
    ).fetchall()]

def add_goal(conn, data):
    c = conn.execute(
        "INSERT INTO goals (profile_id,name,target_amt,deadline) VALUES (?,?,?,?)",
        (data["profile_id"], data["name"], data["target_amt"], data["deadline"])
    )
    conn.commit()
    return c.lastrowid

# ── Load full state for a profile (used on login) ──

def load_state(conn, profile_id):
    profile = get_profile(conn, profile_id)
    if not profile:
        return None
    transactions = get_transactions(conn, profile_id)
    ids = [t["id"] for t in transactions]
    return {
        "profileId": profile["id"],
        "user": {"name": profile["name"], "email": profile["email"], "avatar": profile["avatar"]},
        "business": {"name": profile["biz_name"], "type": profile["biz_type"], "city": profile["biz_city"], "lang": profile["lang"]},
        "tier": profile["tier"],
        "transactions": transactions,
        "nextTransactionId": max(ids) + 1 if ids else 1,
        "inventory": get_inventory(conn, profile_id),
        "customers": get_customers(conn, profile_id),
        "goals": get_goals(conn, profile_id),
        "simulaQueriesRemaining": 10,
    }
