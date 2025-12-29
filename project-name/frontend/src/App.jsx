import "./App.css";
import { useState } from "react";

const empty = {
  ownerName: "",
  petName: "",
  petType: "cat",
  appointmentDate: "",
  timeSlot: "morning",
  reason: "",
  status: "booked",
};

export default function App() {
  const [list, setList] = useState([]);
  const [mode, setMode] = useState("list"); // list | create | edit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...empty });

  const goList = () => {
    setMode("list");
    setEditingId(null);
  };

  const goCreate = () => {
    setForm({
      ...empty,
      appointmentDate: new Date().toISOString().slice(0, 16), // datetime-local 格式
    });
    setMode("create");
    setEditingId(null);
  };

  const startEdit = (id) => {
    const target = list.find((x) => x.id === id);
    if (!target) return;
    setForm({ ...target });
    setEditingId(id);
    setMode("edit");
  };

  const validate = () => {
    if (!form.ownerName.trim()) return "請輸入飼主姓名";
    if (!form.petName.trim()) return "請輸入寵物名字";
    if (!form.appointmentDate) return "請選擇掛號日期時間";
    return "";
  };

  const submit = (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return alert(msg);

    if (mode === "create") {
      const newItem = {
        ...form,
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        createdAt: Date.now(),
      };
      setList((prev) => [newItem, ...prev]);
      goList();
    }

    if (mode === "edit" && editingId) {
      setList((prev) =>
        prev.map((x) => (x.id === editingId ? { ...x, ...form } : x))
      );
      goList();
    }
  };

  const remove = (id) => {
    const ok = window.confirm("確定要取消/刪除此掛號嗎？");
    if (!ok) return;
    setList((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) goList();
  };

  const slotLabel = (slot) => {
    if (slot === "morning") return "上午";
    if (slot === "afternoon") return "下午";
    if (slot === "evening") return "晚上";
    return slot;
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>🐾 PetCare 寵物掛號系統</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={goList}>掛號清單</button>
          <button onClick={goCreate}>+ 新增掛號</button>
        </div>
      </header>

      <hr style={{ margin: "16px 0" }} />

      {mode === "list" && (
        <div>
          {list.length === 0 ? (
            <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, color: "#666" }}>
              目前沒有掛號資料，點「新增掛號」建立第一筆～
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {list.map((a) => (
                <div key={a.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>
                        {a.petName}（{a.petType}）
                      </div>
                      <div style={{ color: "#666", marginTop: 4 }}>
                        飼主：{a.ownerName} ｜ 時段：{slotLabel(a.timeSlot)} ｜ 狀態：{a.status}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>日期：</b>{a.appointmentDate}
                      </div>
                      {a.reason && (
                        <div style={{ marginTop: 6 }}>
                          <b>原因：</b>{a.reason}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEdit(a.id)}>編輯</button>
                      <button onClick={() => remove(a.id)}>取消/刪除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(mode === "create" || mode === "edit") && (
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <h3 style={{ margin: "0 0 6px" }}>{mode === "create" ? "新增掛號" : "編輯掛號"}</h3>

          <label>
            飼主姓名 *
            <input
              value={form.ownerName}
              onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label>
            寵物名字 *
            <input
              value={form.petName}
              onChange={(e) => setForm((p) => ({ ...p, petName: e.target.value }))}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label>
            寵物類型
            <select
              value={form.petType}
              onChange={(e) => setForm((p) => ({ ...p, petType: e.target.value }))}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="cat">貓 cat</option>
              <option value="dog">狗 dog</option>
            </select>
          </label>

          <label>
            掛號日期時間 *
            <input
              type="datetime-local"
              value={form.appointmentDate}
              onChange={(e) => setForm((p) => ({ ...p, appointmentDate: e.target.value }))}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label>
            時段
            <select
              value={form.timeSlot}
              onChange={(e) => setForm((p) => ({ ...p, timeSlot: e.target.value }))}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="morning">上午</option>
              <option value="afternoon">下午</option>
              <option value="evening">晚上</option>
            </select>
          </label>

          <label>
            看診原因（可選）
            <textarea
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              rows={3}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label>
            狀態
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="booked">booked</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="submit">{mode === "create" ? "建立掛號" : "更新掛號"}</button>
            <button type="button" onClick={goList}>回清單</button>
          </div>
        </form>
      )}

      <p style={{ marginTop: 16, color: "#777", fontSize: 13 }}>
        目前資料只存在前端（刷新會消失）。之後再接後端 MongoDB API。
      </p>
    </div>
  );
}
