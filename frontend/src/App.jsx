import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const API_URL = "http://localhost:8081/api/transactions";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [decisionFilter, setDecisionFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    location: "",
    deviceId: "",
    failedAttempts: 0,
    accountBalance: "",
    dailyTransactionCount: 1,
    averageTransactionAmount7d: "",
    transactionDistance: 10,
  });

  // ==============================
  // FETCH TRANSACTIONS
  // ==============================

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();

      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ==============================
  // FORM CHANGE
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ==============================
  // CREATE TRANSACTION
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const transaction = {
        userId: Number(formData.userId),
        amount: Number(formData.amount),
        location: formData.location,
        deviceId: formData.deviceId,
        failedAttempts: Number(formData.failedAttempts),
        accountBalance:
          formData.accountBalance === ""
            ? null
            : Number(formData.accountBalance),

        dailyTransactionCount: Number(
          formData.dailyTransactionCount
        ),

        averageTransactionAmount7d:
          formData.averageTransactionAmount7d === ""
            ? null
            : Number(formData.averageTransactionAmount7d),

        transactionDistance: Number(
          formData.transactionDistance
        ),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error("Transaction creation failed");
      }

      // Close form
      setShowForm(false);

      // Reset form
      setFormData({
        userId: "",
        amount: "",
        location: "",
        deviceId: "",
        failedAttempts: 0,
        accountBalance: "",
        dailyTransactionCount: 1,
        averageTransactionAmount7d: "",
        transactionDistance: 10,
      });

      /*
       * Kafka risk processing is asynchronous.
       * Give Kafka + ML + DB a little time,
       * then fetch updated transactions.
       */
      setTimeout(() => {
        fetchTransactions();
      }, 1500);

    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STATISTICS
  // ==============================

  const totalTransactions = transactions.length;

  const highRisk = transactions.filter(
    (t) => t.riskLevel === "HIGH"
  ).length;

  const mediumRisk = transactions.filter(
    (t) => t.riskLevel === "MEDIUM"
  ).length;

  const lowRisk = transactions.filter(
    (t) => t.riskLevel === "LOW"
  ).length;

  const blocked = transactions.filter(
    (t) => t.decision === "BLOCK"
  ).length;

  const allowed = transactions.filter(
    (t) => t.decision === "ALLOW"
  ).length;

  const review = transactions.filter(
    (t) => t.decision === "REVIEW"
  ).length;

  // ==============================
  // CHART DATA
  // ==============================

  const riskData = [
    {
      name: "High Risk",
      value: highRisk,
      color: "#ff4757",
    },
    {
      name: "Medium Risk",
      value: mediumRisk,
      color: "#ffb000",
    },
    {
      name: "Low Risk",
      value: lowRisk,
      color: "#20c968",
    },
  ];

  const decisionData = [
    {
      name: "Allowed",
      value: allowed,
      color: "#18aee0",
    },
    {
      name: "Review",
      value: review,
      color: "#8b5cf6",
    },
    {
      name: "Blocked",
      value: blocked,
      color: "#ff4757",
    },
  ];

  // ==============================
  // FORMAT MONEY
  // ==============================

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return "₹0";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // ==============================
  // RISK COLOR
  // ==============================

  const getRiskClass = (risk) => {
    if (risk === "HIGH") return "risk-high";
    if (risk === "MEDIUM") return "risk-medium";
    return "risk-low";
  };

  const getDecisionClass = (decision) => {
    if (decision === "BLOCK") return "decision-block";
    if (decision === "REVIEW") return "decision-review";
    return "decision-allow";
  };

 // ==============================
// RECENT TRANSACTIONS
// ==============================

const filteredTransactions = [...transactions]
  .filter((transaction) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      String(transaction.id || "")
        .toLowerCase()
        .includes(searchText) ||
      String(transaction.userId || "")
        .toLowerCase()
        .includes(searchText) ||
      String(transaction.location || "")
        .toLowerCase()
        .includes(searchText)
    );
  })
  .filter((transaction) => {
    if (riskFilter === "ALL") return true;
    return transaction.riskLevel === riskFilter;
  })
  .filter((transaction) => {
    if (decisionFilter === "ALL") return true;
    return transaction.decision === decisionFilter;
  })
  .sort((a, b) => (b.id || 0) - (a.id || 0));

const recentTransactions = filteredTransactions.slice(0, 10);

return (
  <div className="app">

    {/* ==============================
        HEADER
    ============================== */}

    <header className="header">

      <div className="brand">

        <div className="logo">
          🛡
        </div>

        <div>
          <h1>RiskShield AI</h1>
          <p>AI-Powered Transaction Risk Detection</p>
        </div>

      </div>

      <div className="system-status">
        <span className="status-dot"></span>
        System Online
      </div>

    </header>

      {/* ==============================
          MAIN
      ============================== */}

      <main className="container">

        {/* Dashboard Heading */}

        <div className="dashboard-header">

          <div>
            <h2>Risk Dashboard</h2>

            <p>
              Monitor and analyze transaction risk in real-time
            </p>
          </div>

          <div className="header-buttons">

            <button
              className="new-transaction-btn"
              onClick={() => setShowForm(true)}
            >
              + New Transaction
            </button>

            <button
              className="refresh-btn"
              onClick={fetchTransactions}
              disabled={loading}
            >
              ↻ Refresh
            </button>

          </div>

        </div>


        {/* ==============================
            STAT CARDS
        ============================== */}

        <div className="stats-grid">

          <div className="stat-card total-card">
            <div className="stat-icon">↗</div>

            <div>
              <p>Total Transactions</p>
              <h3>{totalTransactions}</h3>
            </div>
          </div>


          <div className="stat-card high-card">
            <div className="stat-icon">!</div>

            <div>
              <p>High Risk</p>
              <h3>{highRisk}</h3>
            </div>
          </div>


          <div className="stat-card medium-card">
            <div className="stat-icon">⚠</div>

            <div>
              <p>Medium Risk</p>
              <h3>{mediumRisk}</h3>
            </div>
          </div>


          <div className="stat-card low-card">
            <div className="stat-icon">✓</div>

            <div>
              <p>Low Risk</p>
              <h3>{lowRisk}</h3>
            </div>
          </div>


          <div className="stat-card blocked-card">
            <div className="stat-icon">×</div>

            <div>
              <p>Blocked</p>
              <h3>{blocked}</h3>
            </div>
          </div>

        </div>


        {/* ==============================
            CHARTS
        ============================== */}

        <div className="charts-grid">

          {/* Risk Distribution */}

          <div className="chart-card">

            <h2>Risk Distribution</h2>

            <p>
              Transaction risk classification
            </p>

            <div className="chart-content">

              <div className="donut-wrapper">

                <ResponsiveContainer width="100%" height={260}>

                  <PieChart>

                    <Pie
                      data={riskData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                    >

                      {riskData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                        />
                      ))}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>{totalTransactions}</strong>
                  <span>Total</span>
                </div>

              </div>


              <div className="chart-legend">

                {riskData.map((item) => (

                  <div
                    className="legend-item"
                    key={item.name}
                  >

                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor: item.color,
                      }}
                    ></span>

                    <div>

                      <strong>{item.name}</strong>

                      <span>
                        {item.value} (
                        {totalTransactions
                          ? (
                              (item.value /
                                totalTransactions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %)
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>


          {/* Decision Breakdown */}

          <div className="chart-card">

            <h2>Decision Breakdown</h2>

            <p>
              Automated transaction decisions
            </p>

            <div className="chart-content">

              <div className="donut-wrapper">

                <ResponsiveContainer width="100%" height={260}>

                  <PieChart>

                    <Pie
                      data={decisionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                    >

                      {decisionData.map(
                        (entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.color}
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>{totalTransactions}</strong>
                  <span>Total</span>
                </div>

              </div>


              <div className="chart-legend">

                {decisionData.map((item) => (

                  <div
                    className="legend-item"
                    key={item.name}
                  >

                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor:
                          item.color,
                      }}
                    ></span>

                    <div>

                      <strong>{item.name}</strong>

                      <span>
                        {item.value} (
                        {totalTransactions
                          ? (
                              (item.value /
                                totalTransactions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %)
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>


        {/* ==============================
            RECENT TRANSACTIONS
        ============================== */}

        <div className="transactions-card">
                    <div className="section-heading">

            <div>
              <h2>Recent Transactions</h2>

              <p>
                AI and rule-based risk analysis results
              </p>
            </div>

          </div>


          {/* ==============================
              SEARCH & FILTERS
          ============================== */}

          <div className="transaction-filters">

            <div className="search-box">

              <span>🔍</span>

              <input
                type="text"
                placeholder="Search by ID, User ID or Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>


            <select
              value={riskFilter}
              onChange={(e) =>
                setRiskFilter(e.target.value)
              }
            >

              <option value="ALL">
                All Risk Levels
              </option>

              <option value="HIGH">
                High Risk
              </option>

              <option value="MEDIUM">
                Medium Risk
              </option>

              <option value="LOW">
                Low Risk
              </option>

            </select>


            <select
              value={decisionFilter}
              onChange={(e) =>
                setDecisionFilter(e.target.value)
              }
            >

              <option value="ALL">
                All Decisions
              </option>

              <option value="ALLOW">
                Allowed
              </option>

              <option value="REVIEW">
                Review
              </option>

              <option value="BLOCK">
                Blocked
              </option>

            </select>


            <button
              type="button"
              className="clear-filter-btn"
              onClick={() => {
                setSearch("");
                setRiskFilter("ALL");
                setDecisionFilter("ALL");
              }}
            >
              Clear
            </button>

          </div>


          <div className="table-wrapper">

          {/* <div className="section-heading">

            <div>
              <h2>Recent Transactions</h2>

              <p>
                AI and rule-based risk analysis results
              </p>
            </div>

          </div>


          <div className="table-wrapper"> */}

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Location</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Decision</th>
                </tr>

              </thead>

              <tbody>

                {recentTransactions.map(
                  (transaction) => (

                    <tr
                      key={transaction.id}
                      onClick={() =>
                        setSelectedTransaction(
                          transaction
                        )
                      }
                    >

                      <td>
                        #{transaction.id}
                      </td>

                      <td>
                        {transaction.userId}
                      </td>

                      <td className="amount">
                        {formatAmount(
                          transaction.amount
                        )}
                      </td>

                      <td>
                        {transaction.location ||
                          "Unknown"}
                      </td>

                      <td>
                        <strong>
                          {transaction.riskScore ??
                            0}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`badge ${getRiskClass(
                            transaction.riskLevel
                          )}`}
                        >
                          {transaction.riskLevel ||
                            "LOW"}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge ${getDecisionClass(
                            transaction.decision
                          )}`}
                        >
                          {transaction.decision ||
                            "ALLOW"}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

            {recentTransactions.length === 0 && (
              <div className="empty">
                No transactions found.
              </div>
            )}

          </div>

        </div>

      </main>


      {/* ==============================
          NEW TRANSACTION MODAL
      ============================== */}

      {showForm && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              className="close-btn"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

            <h2>New Transaction</h2>

            <p className="modal-subtitle">
              Submit a transaction for AI risk analysis
            </p>


            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">

                  <label>User ID</label>

                  <input
                    type="number"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="e.g. 1001"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>Amount</label>

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>Location</label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Delhi"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>Device ID</label>

                  <input
                    type="text"
                    name="deviceId"
                    value={formData.deviceId}
                    onChange={handleChange}
                    placeholder="e.g. DEV1001"
                  />

                </div>


                <div className="form-group">

                  <label>Failed Attempts</label>

                  <input
                    type="number"
                    name="failedAttempts"
                    value={formData.failedAttempts}
                    onChange={handleChange}
                    min="0"
                  />

                </div>


                <div className="form-group">

                  <label>Account Balance</label>

                  <input
                    type="number"
                    name="accountBalance"
                    value={formData.accountBalance}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                  />

                </div>


                <div className="form-group">

                  <label>Daily Transactions</label>

                  <input
                    type="number"
                    name="dailyTransactionCount"
                    value={
                      formData.dailyTransactionCount
                    }
                    onChange={handleChange}
                    min="1"
                  />

                </div>


                <div className="form-group">

                  <label>Avg Amount 7d</label>

                  <input
                    type="number"
                    name="averageTransactionAmount7d"
                    value={
                      formData.averageTransactionAmount7d
                    }
                    onChange={handleChange}
                    placeholder="Optional"
                  />

                </div>


                <div className="form-group">

                  <label>Transaction Distance</label>

                  <input
                    type="number"
                    name="transactionDistance"
                    value={
                      formData.transactionDistance
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : "Analyze Transaction"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ==============================
          TRANSACTION DETAILS MODAL
      ============================== */}

      {selectedTransaction && (

        <div className="modal-overlay">

          <div className="details-modal">

            <button
              className="close-btn"
              onClick={() =>
                setSelectedTransaction(null)
              }
            >
              ×
            </button>

            <h2>
              Transaction #
              {selectedTransaction.id}
            </h2>

            <p className="modal-subtitle">
              Detailed risk analysis
            </p>


            <div className="details-grid">

              <div className="detail-box">
                <span>Transaction ID</span>
                <strong>
                  #{selectedTransaction.id}
                </strong>
              </div>

              <div className="detail-box">
                <span>User ID</span>
                <strong>
                  {selectedTransaction.userId}
                </strong>
              </div>

              <div className="detail-box">
                <span>Amount</span>
                <strong>
                  {formatAmount(
                    selectedTransaction.amount
                  )}
                </strong>
              </div>

              <div className="detail-box">
                <span>Location</span>
                <strong>
                  {selectedTransaction.location ||
                    "Unknown"}
                </strong>
              </div>

              <div className="detail-box">
                <span>Device ID</span>
                <strong>
                  {selectedTransaction.deviceId ||
                    "Unknown"}
                </strong>
              </div>

              <div className="detail-box">
                <span>Failed Attempts</span>
                <strong>
                  {selectedTransaction.failedAttempts ??
                    0}
                </strong>
              </div>

              <div className="detail-box">
                <span>Risk Score</span>
                <strong>
                  {selectedTransaction.riskScore ??
                    0}
                </strong>
              </div>

              <div className="detail-box">
                <span>Risk Level</span>
                <strong>
                  {selectedTransaction.riskLevel ||
                    "LOW"}
                </strong>
              </div>

              <div className="detail-box">
                <span>Decision</span>
                <strong>
                  {selectedTransaction.decision ||
                    "ALLOW"}
                </strong>
              </div>

            </div>


            <div className="risk-decision">

              <h3>Risk Decision</h3>

              <div>

                <span
                  className={`badge ${getRiskClass(
                    selectedTransaction.riskLevel
                  )}`}
                >
                  {selectedTransaction.riskLevel ||
                    "LOW"}
                </span>

                <span
                  className={`badge ${getDecisionClass(
                    selectedTransaction.decision
                  )}`}
                >
                  {selectedTransaction.decision ||
                    "ALLOW"}
                </span>

              </div>

            </div>


            <div className="ai-analysis">

              <h3>🤖 AI Analysis</h3>

              <p>
                {selectedTransaction.aiReason ||
                  "No AI analysis available."}
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;