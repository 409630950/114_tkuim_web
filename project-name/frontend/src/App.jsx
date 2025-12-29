import "./App.css";
import { useEffect, useMemo, useState } from "react";

const empty = {
  ownerName: "",
  petName: "",
  petType: "cat",
  appointmentDate: "",
  timeSlot: "morning",
  reason: "",
  status: "booked",
};

const API = "http://127.0.0.1:5000/api/appointments";

export default function App() {
  const [list, setList] = useState([]);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [errorMsg, setErrorMsg] = useState("");

  const title = useMemo(() => "PetCare 寵物掛號系統", []);

  const load = async () => {
    try {
      setErrorMsg("");
      const res = await fetch(API);
      if (!res.ok) throw new Error("後端連線失敗，請確認後端與 MongoDB 已啟動（5000）。");
      const data = await res.json();
      if (Array.isArray(data)) setList(data);
      else if (Array.isArray(data?.data)) setList(data.data);
      else setList([]);
    } catch (e) {
      setErrorMsg(e.message || "讀取失敗");
      setList([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const goList = () => {
    setMode("list");
    setEditingId(null);
  };

  const goCreate = () => {
    setEditingId(null);
    setForm({
      ...empty,
      appointmentDate: new Date().toISOString().slice(0, 16),
    });
    setMode("create");
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      ownerName: item.ownerName || "",
      petName: item.petName || "",
      petType: item.petType || "cat",
      appointmentDate: (item.appointmentDate || "").slice(0, 16),
      timeSlot: item.timeSlot || "morning",
      reason: item.reason || "",
      status: item.status || "booked",
    });
    setMode("edit");
  };

  const validate = () => {
    if (!form.ownerName.trim()) return "請輸入飼主姓名";
    if (!form.petName.trim()) return "請輸入寵物名字";
    if (!form.appointmentDate) return "請選擇掛號日期時間";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return alert(msg);

    try {
      setErrorMsg("");

      if (mode === "create") {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("新增失敗，請檢查後端是否正常。");
        const created = await res.json();
        const item = created?.data ?? created;
        setList((prev) => [item, ...prev]);
        goList();
      }

      if (mode === "edit" && editingId) {
        const res = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("更新失敗，請檢查後端是否正常。");
        const updated = await res.json();
        const item = updated?.data ?? updated;
        setList((prev) => prev.map((x) => (x._id === editingId ? item : x)));
        goList();
      }
    } catch (e) {
      alert(e.message || "操作失敗");
    }
  };

  const remove = async (id) => {
    const ok = window.confirm("確定要刪除這筆掛號嗎？");
    if (!ok) return;

    try {
      setErrorMsg("");
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗，請檢查後端是否正常。");
      setList((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.message || "刪除失敗");
    }
  };

  const slotLabel = (slot) => {
    if (slot === "morning") return "上午";
    if (slot === "afternoon") return "下午";
    if (slot === "evening") return "晚上";
    return slot;
  };

  const statusLabel = (s) => {
    if (s === "booked") return "booked";
    if (s === "cancelled") return "cancelled";
    return s;
  };

  return (
    <main className="page">
      <div className="container">
        <header className="topbar">
          <div className="brand-title">{title}</div>
          <nav className="nav">
            <button className={mode === "list" ? "navbtn active" : "navbtn"} onClick={goList}>
              掛號清單
            </button>
            <button className={mode !== "list" ? "navbtn active" : "navbtn"} onClick={goCreate}>
              新增掛號
            </button>
          </nav>
        </header>

        {errorMsg ? <div className="alert">{errorMsg}</div> : null}

        {mode === "list" ? (
          <div className="card">
            <div className="card-title">掛號清單</div>

            {list.length === 0 ? (
              <div className="empty">目前沒有掛號資料</div>
            ) : (
              <div className="list">
                {list.map((a) => (
                  <div className="item" key={a._id}>
                    <div className="item-head">
                      <div className="item-title">
                        {a.petName}（{a.petType === "cat" ? "貓" : "狗"}）
                      </div>
                      <div className="item-actions">
                        <button className="btn" onClick={() => startEdit(a)}>
                          編輯
                        </button>
                        <button className="btn danger" onClick={() => remove(a._id)}>
                          刪除
                        </button>
                      </div>
                    </div>

                    <div className="meta">
                      飼主：{a.ownerName}　|　時段：{slotLabel(a.timeSlot)}　|　狀態：{statusLabel(a.status)}
                    </div>
                    <div className="meta">
                      日期：{String(a.appointmentDate || "").replace("T", " ").slice(0, 16)}
                    </div>
                    {a.reason ? <div className="meta">原因：{a.reason}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="card-title">{mode === "edit" ? "編輯掛號" : "新增掛號"}</div>

            <form className="form" onSubmit={submit}>
              <div className="grid">
                <label className="field">
                  <span className="label">飼主姓名</span>
                  <input
                    value={form.ownerName}
                    onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
                    placeholder="例如：王Aden"
                  />
                </label>

                <label className="field">
                  <span className="label">寵物名字</span>
                  <input
                    value={form.petName}
                    onChange={(e) => setForm((p) => ({ ...p, petName: e.target.value }))}
                    placeholder="例如：大跳"
                  />
                </label>

                <label className="field">
                  <span className="label">寵物類型</span>
                  <select value={form.petType} onChange={(e) => setForm((p) => ({ ...p, petType: e.target.value }))}>
                    <option value="cat">貓</option>
                    <option value="dog">狗</option>
                  </select>
                </label>

                <label className="field">
                  <span className="label">掛號日期時間</span>
                  <input
                    type="datetime-local"
                    value={form.appointmentDate}
                    onChange={(e) => setForm((p) => ({ ...p, appointmentDate: e.target.value }))}
                  />
                </label>

                <label className="field">
                  <span className="label">時段</span>
                  <select value={form.timeSlot} onChange={(e) => setForm((p) => ({ ...p, timeSlot: e.target.value }))}>
                    <option value="morning">上午</option>
                    <option value="afternoon">下午</option>
                    <option value="evening">晚上</option>
                  </select>
                </label>

                <label className="field">
                  <span className="label">狀態</span>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="booked">booked</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </label>

                <label className="field full">
                  <span className="label">看診原因</span>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                    placeholder="可選填"
                    rows={3}
                  />
                </label>
              </div>

              <div className="actions">
                <button type="submit" className="btn primary">
                  儲存
                </button>
                <button type="button" className="btn" onClick={goList}>
                  取消
                </button>
                <button type="button" className="btn ghost" onClick={load}>
                  重新整理
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
