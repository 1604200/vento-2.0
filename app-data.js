const AppData = (() => {
  const APP_NAMESPACE = "ahm-shared-json-v1";
  const AUDIT_KEY = `${APP_NAMESPACE}:audit-log`;
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(APP_NAMESPACE) : null;

  function nowISO() {
    return new Date().toISOString();
  }

  function safeParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function getCurrentUser() {
    return {
      nama: localStorage.getItem("verifiedName") || "UNKNOWN USER",
      id: localStorage.getItem("verifiedId") || "-",
      role: localStorage.getItem("verifiedRole") || "USER"
    };
  }

  function getStorageKey(moduleName) {
    return `${APP_NAMESPACE}:${moduleName}`;
  }

  function createEnvelope(moduleName, defaultData = []) {
    const user = getCurrentUser();
    return {
      meta: {
        module: moduleName,
        version: 1,
        createdAt: nowISO(),
        createdBy: user,
        updatedAt: nowISO(),
        updatedBy: user,
        totalData: Array.isArray(defaultData) ? defaultData.length : 0
      },
      data: defaultData
    };
  }

  function readModule(moduleName, defaultData = []) {
    const key = getStorageKey(moduleName);
    const raw = localStorage.getItem(key);

    if (!raw) {
      const envelope = createEnvelope(moduleName, defaultData);
      localStorage.setItem(key, JSON.stringify(envelope, null, 2));
      return envelope;
    }

    const parsed = safeParse(raw, null);

    if (!parsed || typeof parsed !== "object") {
      const envelope = createEnvelope(moduleName, defaultData);
      localStorage.setItem(key, JSON.stringify(envelope, null, 2));
      return envelope;
    }

    if (!("meta" in parsed) || !("data" in parsed)) {
      const user = getCurrentUser();
      const wrapped = {
        meta: {
          module: moduleName,
          version: 1,
          createdAt: nowISO(),
          createdBy: user,
          updatedAt: nowISO(),
          updatedBy: user,
          totalData: Array.isArray(parsed) ? parsed.length : 0
        },
        data: Array.isArray(parsed) ? parsed : defaultData
      };
      localStorage.setItem(key, JSON.stringify(wrapped, null, 2));
      return wrapped;
    }

    return parsed;
  }

  function readData(moduleName, defaultData = []) {
    return readModule(moduleName, defaultData).data || [];
  }

  function writeModule(moduleName, data, action = "UPDATE", extra = {}) {
    const key = getStorageKey(moduleName);
    const existing = readModule(moduleName, Array.isArray(data) ? data : []);
    const user = getCurrentUser();

    const envelope = {
      meta: {
        ...existing.meta,
        module: moduleName,
        version: Number(existing.meta?.version || 0) + 1,
        updatedAt: nowISO(),
        updatedBy: user,
        totalData: Array.isArray(data) ? data.length : 0
      },
      data: Array.isArray(data) ? data : []
    };

    if (!existing.meta?.createdAt) {
      envelope.meta.createdAt = nowISO();
      envelope.meta.createdBy = user;
    }

    localStorage.setItem(key, JSON.stringify(envelope, null, 2));

    appendAudit({
      module: moduleName,
      action,
      user,
      totalData: envelope.meta.totalData,
      timestamp: envelope.meta.updatedAt,
      extra
    });

    broadcast({
      type: "module-updated",
      module: moduleName,
      timestamp: envelope.meta.updatedAt
    });

    return envelope;
  }

  function appendAudit(entry) {
    const current = safeParse(localStorage.getItem(AUDIT_KEY), []);
    const next = Array.isArray(current) ? current : [];
    next.unshift({
      id: crypto.randomUUID(),
      ...entry
    });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(next.slice(0, 1000), null, 2));
  }

  function getAuditLog() {
    return safeParse(localStorage.getItem(AUDIT_KEY), []);
  }

  function loginAudit() {
    const user = getCurrentUser();
    appendAudit({
      module: "auth",
      action: "LOGIN",
      user,
      totalData: 0,
      timestamp: nowISO(),
      extra: { message: "User login" }
    });
  }

  function logoutAudit() {
    const user = getCurrentUser();
    appendAudit({
      module: "auth",
      action: "LOGOUT",
      user,
      totalData: 0,
      timestamp: nowISO(),
      extra: { message: "User logout" }
    });
  }

  function broadcast(payload) {
    if (channel) {
      channel.postMessage(payload);
    }
  }

  function subscribe(moduleName, callback) {
    function handler(event) {
      if (event.key === getStorageKey(moduleName)) {
        const fresh = readModule(moduleName, []);
        callback(fresh);
      }
      if (event.key === AUDIT_KEY && moduleName === "__audit__") {
        callback(getAuditLog());
      }
    }

    window.addEventListener("storage", handler);

    if (channel) {
      channel.addEventListener("message", (event) => {
        const msg = event.data || {};
        if (msg.type === "module-updated" && msg.module === moduleName) {
          callback(readModule(moduleName, []));
        }
        if (msg.type === "audit-updated" && moduleName === "__audit__") {
          callback(getAuditLog());
        }
      });
    }

    return () => window.removeEventListener("storage", handler);
  }

  function pushAuditNotice() {
    broadcast({ type: "audit-updated", timestamp: nowISO() });
  }

  function save(moduleName, data, action = "SAVE", extra = {}) {
    const result = writeModule(moduleName, data, action, extra);
    pushAuditNotice();
    return result;
  }

  function removeById(moduleName, id, defaultData = []) {
    const data = readData(moduleName, defaultData);
    const next = data.filter((item) => String(item.id) !== String(id));
    return save(moduleName, next, "DELETE", { deletedId: id });
  }

  function upsertById(moduleName, item, defaultData = []) {
    const data = readData(moduleName, defaultData);
    const index = data.findIndex((x) => String(x.id) === String(item.id));

    let next;
    let action;

    if (index >= 0) {
      next = [...data];
      next[index] = item;
      action = "UPDATE_ROW";
    } else {
      next = [item, ...data];
      action = "ADD_ROW";
    }

    return save(moduleName, next, action, { rowId: item.id });
  }

  return {
    getCurrentUser,
    readModule,
    readData,
    save,
    removeById,
    upsertById,
    getAuditLog,
    subscribe,
    loginAudit,
    logoutAudit,
    getStorageKey
  };
})();