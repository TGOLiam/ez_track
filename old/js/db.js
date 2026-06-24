/* ============================================================
   EzTrack – SQLite Database Layer
   Wraps sql.js WASM with schema, seed data, CRUD operations,
   and localStorage persistence.
   ============================================================ */

const DB = {
  _sql: null,
  _db: null,

  /* ── Initialise / restore ── */
  async init() {
    this._sql = await initSqlJs({
      locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/' + f,
    });
    const blob = this._loadBlob();
    this._db = blob ? new this._sql.Database(blob) : new this._sql.Database();
    this._createTables();
    if (!blob) {
      this._seed();
    }
    this._saveBlob();
  },

  /* ── Schema ── */
  _createTables() {
    this._db.run(`CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY,
      name TEXT, email TEXT, avatar TEXT,
      biz_name TEXT, biz_type TEXT, biz_city TEXT,
      lang TEXT DEFAULT '${CONFIG.DEFAULT_LANG}', tier TEXT DEFAULT '${CONFIG.TIERS.SIMULA}'
    )`);
    this._db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      profile_id INTEGER, type TEXT, desc TEXT,
      amt REAL, date TEXT, cat TEXT DEFAULT '', time TEXT
    )`);
    this._db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY,
      profile_id INTEGER, name TEXT, qty INTEGER,
      unit TEXT, min_threshold INTEGER DEFAULT 0
    )`);
    this._db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY,
      profile_id INTEGER, name TEXT, contact TEXT
    )`);
    this._db.run(`CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY,
      profile_id INTEGER, name TEXT, target_amt REAL,
      deadline TEXT
    )`);
  },

  /* ── Seed data ── */
  _seed() {
    this._db.run(`INSERT INTO profiles VALUES
      (1,'Maria Anning','maria@email.com','MA','Anning Sari-Sari Store','sari','Quezon City','taglish','${CONFIG.TIERS.SIMULA}'),
      (2,'Juan Dela Cruz','juan@email.com','JD','JC Online Shop','online','Manila','taglish','${CONFIG.TIERS.SIGLA}'),
      (3,'Rosa Magsaysay','rosa@email.com','RM','RM Retail Hub','retail','Makati','taglish','${CONFIG.TIERS.UNLAD}')`);

    const tx = (pid, type, desc, amt, date, cat, time) =>
      `(${pid},'${type}','${desc}',${amt},'${date}','${cat}','${time}')`;

    const baseTxs = [
      tx(1,CONFIG.TX.INCOME,'Sold softdrinks + chips',340,'2025-06-18','','2:14 PM'),
      tx(1,CONFIG.TX.EXPENSE,'Bought supplies (SM Market)',580,'2025-06-18','Supplies','10:30 AM'),
      tx(1,CONFIG.TX.INCOME,'Sold phone load',15,'2025-06-17','','6:45 PM'),
      tx(1,CONFIG.TX.EXPENSE,'Electricity bill',620,'2025-06-17','Utilities','3:00 PM'),
      tx(1,CONFIG.TX.INCOME,'Morning sales',460,'2025-06-16','','8:00 AM'),
      tx(1,CONFIG.TX.INCOME,'Ulam sales noon',680,'2025-06-15','','12:30 PM'),
      tx(1,CONFIG.TX.EXPENSE,'LPG refill',420,'2025-06-14','Supplies','9:00 AM'),
      tx(2,CONFIG.TX.INCOME,'Sold softdrinks + chips',340,'2025-06-18','','2:14 PM'),
      tx(2,CONFIG.TX.EXPENSE,'Bought supplies (SM Market)',580,'2025-06-18','Supplies','10:30 AM'),
      tx(2,CONFIG.TX.INCOME,'Sold phone load',15,'2025-06-17','','6:45 PM'),
      tx(2,CONFIG.TX.EXPENSE,'Electricity bill',620,'2025-06-17','Utilities','3:00 PM'),
      tx(2,CONFIG.TX.INCOME,'Morning sales',460,'2025-06-16','','8:00 AM'),
      tx(2,CONFIG.TX.INCOME,'Ulam sales noon',680,'2025-06-15','','12:30 PM'),
      tx(2,CONFIG.TX.EXPENSE,'LPG refill',420,'2025-06-14','Supplies','9:00 AM'),
      tx(3,CONFIG.TX.INCOME,'Sold softdrinks + chips',340,'2025-06-18','','2:14 PM'),
      tx(3,CONFIG.TX.EXPENSE,'Bought supplies (SM Market)',580,'2025-06-18','Supplies','10:30 AM'),
      tx(3,CONFIG.TX.INCOME,'Sold phone load',15,'2025-06-17','','6:45 PM'),
      tx(3,CONFIG.TX.EXPENSE,'Electricity bill',620,'2025-06-17','Utilities','3:00 PM'),
      tx(3,CONFIG.TX.INCOME,'Morning sales',460,'2025-06-16','','8:00 AM'),
      tx(3,CONFIG.TX.INCOME,'Ulam sales noon',680,'2025-06-15','','12:30 PM'),
      tx(3,CONFIG.TX.EXPENSE,'LPG refill',420,'2025-06-14','Supplies','9:00 AM'),
    ];
    this._db.run(`INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time)
      VALUES ${baseTxs.join(',')}`);

    const inv = (pid, name, qty, unit, min) =>
      `(${pid},'${name}',${qty},'${unit}',${min})`;

    this._db.run(`INSERT INTO inventory (profile_id,name,qty,unit,min_threshold)
      VALUES ${[
        inv(1,'Softdrinks (1.5L)',48,'pcs',20),
        inv(1,'Instant Noodles',6,'pcs',10),
        inv(1,'Shampoo Sachet',0,'sachet',12),
        inv(1,'Canned Sardines',24,'pcs',12),
        inv(1,'Cooking Oil (1L)',9,'liter',5),
        inv(2,'T-Shirts',30,'pcs',10),
        inv(2,'Bags',15,'pcs',5),
        inv(2,'Shoes',8,'pair',3),
        inv(3,'Softdrinks (1.5L)',60,'pcs',20),
        inv(3,'Instant Noodles',24,'pcs',10),
        inv(3,'Rice (50kg)',50,'kg',25),
        inv(3,'Canned Goods',40,'pcs',15),
      ].join(',')}`);
  },

  /* ── Persistence ── */
  _saveBlob() {
    const data = this._db.export();
    let bin = '';
    const u8 = new Uint8Array(data);
    for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    localStorage.setItem(CONFIG.STORAGE_KEY, btoa(bin));
  },

  _loadBlob() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!raw) return null;
    const bin = atob(raw);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  },

  /* ── Profile queries ── */
  getProfiles() {
    const rows = this._db.exec('SELECT * FROM profiles ORDER BY id');
    if (!rows.length) return [];
    return rows[0].values.map(r => ({
      id: r[0], name: r[1], email: r[2], avatar: r[3],
      biz_name: r[4], biz_type: r[5], biz_city: r[6],
      lang: r[7], tier: r[8],
    }));
  },

  getProfile(id) {
    const rows = this._db.exec('SELECT * FROM profiles WHERE id = ?', [id]);
    if (!rows.length || !rows[0].values.length) return null;
    const r = rows[0].values[0];
    return {
      id: r[0], name: r[1], email: r[2], avatar: r[3],
      biz_name: r[4], biz_type: r[5], biz_city: r[6],
      lang: r[7], tier: r[8],
    };
  },

  createProfile(data) {
    this._db.run(`INSERT INTO profiles (name,email,avatar,biz_name,biz_type,biz_city,lang,tier)
      VALUES (?,?,?,?,?,?,?,?)`,
      [data.name, data.email, data.avatar, data.biz_name, data.biz_type, data.biz_city, data.lang, data.tier]);
    const id = this._db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    this._saveBlob();
    return id;
  },

  updateProfile(id, data) {
    const fields = [];
    const vals = [];
    for (const k of ['name','email','avatar','biz_name','biz_type','biz_city','lang','tier']) {
      if (data[k] !== undefined) { fields.push(k + '=?'); vals.push(data[k]); }
    }
    if (!fields.length) return;
    vals.push(id);
    this._db.run(`UPDATE profiles SET ${fields.join(',')} WHERE id=?`, vals);
    this._saveBlob();
  },

  /* ── Transaction queries ── */
  getTransactions(profileId) {
    const rows = this._db.exec(
      'SELECT id,profile_id,type,desc,amt,date,cat,time FROM transactions WHERE profile_id=? ORDER BY id DESC',
      [profileId]);
    if (!rows.length) return [];
    return rows[0].values.map(r => ({
      id: r[0], profile_id: r[1], type: r[2], desc: r[3],
      amt: r[4], date: r[5], cat: r[6], time: r[7],
    }));
  },

  addTransaction(tx) {
    this._db.run(`INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time)
      VALUES (?,?,?,?,?,?,?)`,
      [tx.profile_id, tx.type, tx.desc, tx.amt, tx.date, tx.cat, tx.time]);
    const id = this._db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    this._saveBlob();
    return id;
  },

  deleteTransaction(id) {
    this._db.run('DELETE FROM transactions WHERE id=?', [id]);
    this._saveBlob();
  },

  /* ── Inventory queries ── */
  getInventory(profileId) {
    const rows = this._db.exec(
      'SELECT id,profile_id,name,qty,unit,min_threshold FROM inventory WHERE profile_id=? ORDER BY name',
      [profileId]);
    if (!rows.length) return [];
    return rows[0].values.map(r => ({
      id: r[0], profile_id: r[1], name: r[2], qty: r[3],
      unit: r[4], min_threshold: r[5],
    }));
  },

  addInventoryItem(item) {
    this._db.run(`INSERT INTO inventory (profile_id,name,qty,unit,min_threshold)
      VALUES (?,?,?,?,?)`,
      [item.profile_id, item.name, item.qty, item.unit, item.min_threshold || 0]);
    const id = this._db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    this._saveBlob();
    return id;
  },

  /* ── Customer queries ── */
  getCustomers(profileId) {
    const rows = this._db.exec('SELECT id,profile_id,name,contact FROM customers WHERE profile_id=? ORDER BY name', [profileId]);
    if (!rows.length) return [];
    return rows[0].values.map(r => ({ id: r[0], profile_id: r[1], name: r[2], contact: r[3] }));
  },

  addCustomer(data) {
    this._db.run('INSERT INTO customers (profile_id,name,contact) VALUES (?,?,?)',
      [data.profile_id, data.name, data.contact]);
    const id = this._db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    this._saveBlob();
    return id;
  },

  /* ── Goal queries ── */
  getGoals(profileId) {
    const rows = this._db.exec('SELECT id,profile_id,name,target_amt,deadline FROM goals WHERE profile_id=? ORDER BY id', [profileId]);
    if (!rows.length) return [];
    return rows[0].values.map(r => ({ id: r[0], profile_id: r[1], name: r[2], target_amt: r[3], deadline: r[4] }));
  },

  addGoal(data) {
    this._db.run('INSERT INTO goals (profile_id,name,target_amt,deadline) VALUES (?,?,?,?)',
      [data.profile_id, data.name, data.target_amt, data.deadline]);
    const id = this._db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    this._saveBlob();
    return id;
  },

  /* ── Full STATE loader ── */
  loadState(profileId) {
    const p = this.getProfile(profileId);
    if (!p) return;
    STATE.profileId = p.id;
    STATE.user = { name: p.name, email: p.email, avatar: p.avatar };
    STATE.business  = { name: p.biz_name, type: p.biz_type, city: p.biz_city, lang: p.lang };
    STATE.tier = p.tier;
    STATE.transactions = this.getTransactions(profileId);
    STATE.nextTransactionId = STATE.transactions.length
      ? Math.max(...STATE.transactions.map(t => t.id)) + 1 : 1;
    STATE.inventory = this.getInventory(profileId);
    STATE.customers = this.getCustomers(profileId);
    STATE.goals = this.getGoals(profileId);
  },
};
