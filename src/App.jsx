import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, X, ChevronDown, Calendar, DollarSign,
  FileText, Sparkles, TrendingUp, Wallet, Settings, User
} from "lucide-react";

const COLORS = [
  { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-400" },
  { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-blue-400" },
  { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-400" },
  { bg: "bg-pink-100", text: "text-pink-700", bar: "bg-pink-400" },
  { bg: "bg-purple-100", text: "text-purple-700", bar: "bg-purple-400" },
  { bg: "bg-green-100", text: "text-green-700", bar: "bg-green-400" },
  { bg: "bg-gray-100", text: "text-gray-700", bar: "bg-gray-400" },
  { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-400" },
  { bg: "bg-teal-100", text: "text-teal-700", bar: "bg-teal-400" },
  { bg: "bg-indigo-100", text: "text-indigo-700", bar: "bg-indigo-400" },
  { bg: "bg-cyan-100", text: "text-cyan-700", bar: "bg-cyan-400" },
  { bg: "bg-lime-100", text: "text-lime-700", bar: "bg-lime-400" },
  { bg: "bg-rose-100", text: "text-rose-700", bar: "bg-rose-400" },
  { bg: "bg-yellow-100", text: "text-yellow-700", bar: "bg-yellow-400" },
];

const DEFAULT_CATEGORIES = [
  { id: "bills", name: "Bills", emoji: "💡", colorIdx: 0, isDefault: true },
  { id: "transport", name: "Transportation", emoji: "🚗", colorIdx: 1, isDefault: true },
  { id: "food", name: "Food", emoji: "🍔", colorIdx: 2, isDefault: true },
  { id: "shopping", name: "Shopping", emoji: "🛍️", colorIdx: 3, isDefault: true },
  { id: "entertainment", name: "Entertainment", emoji: "🎬", colorIdx: 4, isDefault: true },
  { id: "health", name: "Health", emoji: "💊", colorIdx: 5, isDefault: true },
  { id: "misc", name: "Miscellaneous", emoji: "📦", colorIdx: 6, isDefault: true },
];

const EMOJI_OPTIONS = [
  "☕", "🍕", "🍜", "🥗", "🍺", "🏠", "💰", "📱", "🎮", "🎵",
  "✈️", "🚌", "🚕", "⛽", "🏋️", "💇", "🐶", "🐱", "👶", "🎁",
  "📚", "🎓", "💻", "🔧", "🏥", "💳", "📝", "🧹", "👗", "👟",
  "🎨", "🌿", "🏖️", "⚽", "🎯", "🔔", "💎", "🧴", "🍷", "🎪",
];

const PEOPLE = ["Kent", "Kone"];

const PERSON_COLORS = {
  Kent: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    ring: "ring-sky-400",
    gradient: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-200",
  },
  Kone: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    ring: "ring-emerald-400",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-200",
  },
};

const today = () => new Date().toISOString().split("T")[0];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  const [expenses, setExpenses] = useState(() =>
    loadJSON("spendwise_expenses", [])
  );
  const [categories, setCategories] = useState(() =>
    loadJSON("spendwise_categories", DEFAULT_CATEGORIES)
  );
  const [selectedDate, setSelectedDate] = useState(today());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("food");
  const [date, setDate] = useState(today());
  const [person, setPerson] = useState("Kent");
  const [filterPerson, setFilterPerson] = useState("All");
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("☕");
  const [showManage, setShowManage] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef(null);

  // Persist expenses
  useEffect(() => {
    saveJSON("spendwise_expenses", expenses);
  }, [expenses]);

  // Persist categories
  useEffect(() => {
    saveJSON("spendwise_categories", categories);
  }, [categories]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addExpense = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const exp = {
      id: Date.now().toString(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      description: description.trim() || "No description",
      categoryId,
      date,
      person,
    };
    setExpenses((p) => [exp, ...p]);
    setAmount("");
    setDescription("");
    setDate(today());
  };

  const deleteExpense = (id) =>
    setExpenses((p) => p.filter((e) => e.id !== id));

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const cat = {
      id: "custom_" + Date.now(),
      name: newCatName.trim(),
      emoji: newCatEmoji,
      colorIdx: categories.length % COLORS.length,
      isDefault: false,
    };
    setCategories((p) => [...p, cat]);
    setNewCatName("");
    setNewCatEmoji("☕");
    setShowCatModal(false);
  };

  const deleteCategory = (id) => {
    setCategories((p) => p.filter((c) => c.id !== id));
    setExpenses((p) =>
      p.map((e) => (e.categoryId === id ? { ...e, categoryId: "misc" } : e))
    );
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.date === selectedDate &&
      (filterPerson === "All" || e.person === filterPerson)
  );
  const totalToday = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const getCat = (id) =>
    categories.find((c) => c.id === id) ||
    categories.find((c) => c.id === "misc") ||
    DEFAULT_CATEGORIES[6];
  const getColor = (idx) => COLORS[idx % COLORS.length];
  const selectedCat = getCat(categoryId);
  const pc = PERSON_COLORS[person];

  const personTotals = PEOPLE.map((p) => ({
    name: p,
    total: expenses
      .filter((e) => e.date === selectedDate && e.person === p)
      .reduce((s, e) => s + e.amount, 0),
    count: expenses.filter((e) => e.date === selectedDate && e.person === p)
      .length,
  }));

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ====== HEADER ====== */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-5">
          {/* Logo + Settings */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Wallet size={18} color="white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                SpendWise
              </h1>
            </div>
            <button
              onClick={() => setShowManage(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Date Selector + Person Filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
            />
            {selectedDate !== today() && (
              <button
                onClick={() => setSelectedDate(today())}
                className="text-xs text-violet-600 font-medium hover:underline"
              >
                Today
              </button>
            )}
            <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {["All", ...PEOPLE].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPerson(p)}
                  className={
                    "px-3 py-1 rounded-md text-xs font-medium transition-all " +
                    (filterPerson === p
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700")
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Per-Person Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {personTotals.map((pt) => {
              const c = PERSON_COLORS[pt.name];
              return (
                <button
                  key={pt.name}
                  onClick={() =>
                    setFilterPerson(
                      filterPerson === pt.name ? "All" : pt.name
                    )
                  }
                  className={
                    "rounded-xl p-3.5 text-white shadow-lg transition-all text-left bg-gradient-to-br " +
                    c.gradient +
                    " " +
                    c.shadow +
                    " " +
                    (filterPerson === pt.name
                      ? "ring-2 ring-white ring-offset-2 scale-105"
                      : "opacity-90 hover:opacity-100")
                  }
                >
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">
                    {pt.name}
                  </p>
                  <p className="text-xl font-bold tracking-tight">
                    ฿
                    {pt.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {pt.count} item{pt.count !== 1 ? "s" : ""}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Combined Total Card */}
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-violet-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-200 text-xs font-medium uppercase tracking-wider mb-0.5">
                  {filterPerson === "All"
                    ? "Total"
                    : filterPerson + "'s Total"}{" "}
                  {selectedDate === today()
                    ? "Today"
                    : new Date(selectedDate + "T12:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  ฿
                  {totalToday.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5">
                <TrendingUp size={14} />
                <span className="text-sm font-medium">
                  {filteredExpenses.length} items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Add Expense Form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Add Expense
          </h2>

          {/* Person Toggle */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">
              Who's spending?
            </label>
            <div className="flex gap-2">
              {PEOPLE.map((p) => {
                const c = PERSON_COLORS[p];
                return (
                  <button
                    key={p}
                    onClick={() => setPerson(p)}
                    className={
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 " +
                      (person === p
                        ? c.bg +
                          " " +
                          c.text +
                          " border-transparent ring-2 " +
                          c.ring
                        : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300")
                    }
                  >
                    <User size={15} />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">
                Amount (฿)
              </label>
              <div className="relative">
                <DollarSign
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 font-medium mb-1 block">
              Description
            </label>
            <div className="relative">
              <FileText
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="text"
                placeholder="What did you spend on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExpense()}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 font-medium mb-1 block">
              Category
            </label>
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all bg-white"
              >
                <span className="flex items-center gap-2">
                  <span>{selectedCat.emoji}</span>
                  <span className="text-gray-700">{selectedCat.name}</span>
                </span>
                <ChevronDown
                  size={16}
                  className={
                    "text-gray-400 transition-transform " +
                    (showDropdown ? "rotate-180" : "")
                  }
                />
              </button>
              {showDropdown && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCategoryId(c.id);
                        setShowDropdown(false);
                      }}
                      className={
                        "w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left " +
                        (c.id === categoryId ? "bg-violet-50" : "")
                      }
                    >
                      <span>{c.emoji}</span>
                      <span className="text-gray-700">{c.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowCatModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-violet-600 hover:bg-violet-50 transition-colors border-t border-gray-100"
                  >
                    <Plus size={15} />
                    <span className="font-medium">Add Category</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={addExpense}
            className={
              "w-full py-3 bg-gradient-to-r " +
              pc.gradient +
              " text-white rounded-xl font-semibold text-sm shadow-md " +
              pc.shadow +
              " hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            }
          >
            <Plus size={18} />
            Add as {person}
          </button>
        </div>

        {/* ====== EXPENSES LIST ====== */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Expenses ({filteredExpenses.length})
          </h2>
          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <Sparkles size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No expenses for this day</p>
              <p className="text-gray-300 text-xs mt-1">
                Add your first expense above
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map((exp) => {
                const cat = getCat(exp.categoryId);
                const color = getColor(cat.colorIdx);
                const personColor =
                  PERSON_COLORS[exp.person] || PERSON_COLORS["Kent"];
                return (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 group hover:shadow-md transition-all"
                  >
                    <div
                      className={
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 " +
                        color.bg
                      }
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {exp.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className={
                            "inline-block text-xs font-medium px-2 py-0.5 rounded-full " +
                            color.bg +
                            " " +
                            color.text
                          }
                        >
                          {cat.name}
                        </span>
                        <span
                          className={
                            "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full " +
                            personColor.bg +
                            " " +
                            personColor.text
                          }
                        >
                          <User size={10} />
                          {exp.person}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        ฿
                        {exp.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ====== CATEGORY BREAKDOWN ====== */}
        {filteredExpenses.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Breakdown
            </h2>
            <div className="space-y-2">
              {Object.entries(
                filteredExpenses.reduce((acc, e) => {
                  acc[e.categoryId] = (acc[e.categoryId] || 0) + e.amount;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([catId, total]) => {
                  const cat = getCat(catId);
                  const color = getColor(cat.colorIdx);
                  const pct =
                    totalToday > 0 ? (total / totalToday) * 100 : 0;
                  return (
                    <div key={catId} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">
                        {cat.emoji}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">
                            {cat.name}
                          </span>
                          <span className="text-gray-500">
                            ฿
                            {total.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={"h-full rounded-full " + color.bar}
                            style={{
                              width: pct + "%",
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ====== ADD CATEGORY MODAL ====== */}
      {showCatModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4"
          onClick={() => setShowCatModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                New Category
              </h3>
              <button
                onClick={() => setShowCatModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-400 font-medium mb-1 block">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. Coffee"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                maxLength={20}
              />
            </div>
            <div className="mb-4">
              <label className="text-xs text-gray-400 font-medium mb-1 block">
                Pick an Emoji
              </label>
              <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewCatEmoji(em)}
                    className={
                      "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all " +
                      (newCatEmoji === em
                        ? "bg-violet-100 ring-2 ring-violet-400 scale-110"
                        : "hover:bg-gray-100")
                    }
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4">
              <span className="text-2xl">{newCatEmoji}</span>
              <span className="font-medium text-gray-700">
                {newCatName || "Category Name"}
              </span>
            </div>
            <button
              onClick={addCategory}
              disabled={!newCatName.trim()}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Create Category
            </button>
          </div>
        </div>
      )}

      {/* ====== MANAGE CATEGORIES MODAL ====== */}
      {showManage && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4"
          onClick={() => setShowManage(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl max-h-96 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Manage Categories
              </h3>
              <button
                onClick={() => setShowManage(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {categories.map((c) => {
                const color = getColor(c.colorIdx);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          "w-9 h-9 rounded-lg flex items-center justify-center text-lg " +
                          color.bg
                        }
                      >
                        {c.emoji}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {c.name}
                      </span>
                      {c.isDefault && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {!c.isDefault && (
                      <button
                        onClick={() => deleteCategory(c.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowManage(false);
                setShowCatModal(true);
              }}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl font-medium text-sm hover:border-violet-300 hover:text-violet-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add New Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
}