"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { segmentVoters } from "../../lib/segmentVoters.js";
import { getSchemes } from "../../lib/getSchemes.js";
import CategoryChart from "../../components/CategoryChart";
import AgeChart from "../../components/AgeChart";
import { generateInsight } from "../../lib/generateInsight";
import { Wheat, GraduationCap, UserRound, Wrench, Users, BarChart3 } from "lucide-react";
import BackButton from "../../components/BackButton";
import ProgressBar from "../../components/ProgressBar";

export default function Dashboard() {
  const router = useRouter();
  const [segments, setSegments] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [boothInsight, setBoothInsight] = useState(null);
  const [boothInsightText, setBoothInsightText] = useState("");
  const [allVoters, setAllVoters] = useState([]);

  useEffect(() => {
    const storedVoters = localStorage.getItem("voters");
    if (!storedVoters) {
      router.push("/booth-selection");
      return;
    }

    const voters = JSON.parse(storedVoters);
    setAllVoters(voters);

    // 2. Define 'result' BEFORE using it
    const result = segmentVoters(voters);
    setSegments(result);

    // 3. Generate insight using the defined result
    const insight = generateInsight(voters, result);
    setBoothInsightText(insight);

    // Calculate booth summary
    const total = voters.length;
    const avgAge = voters.reduce((sum, v) => sum + v.age, 0) / total;

    const categories = [
      { name: "Farmers", count: result.farmers.length },
      { name: "Students", count: result.students.length },
      { name: "Senior Citizens", count: result.seniorCitizens.length },
      { name: "Workers", count: result.workers.length },
      { name: "Others", count: result.others.length },
    ];

    const major = categories.sort((a, b) => b.count - a.count)[0];

    setBoothInsight({
      total,
      avgAge: avgAge.toFixed(1),
      majorGroup: major.name,
    });
  }, [router]);

  if (!segments) {
    return <p className="p-10" style={{ color: "var(--text-secondary)" }}>Loading dashboard...</p>;
  }

  return (
    <div className="min-h-[calc(100vh-70px)] p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <BackButton fallbackHref="/booth-selection" />

      {/* Outer Container */}
      <div className="outer-container">
        {/* Main Content Wrapper */}
        <div className="flex flex-col gap-6">
          {/* Booth Intelligence Summary - Large Box */}
          {boothInsight && (
            <div className="booth-summary-card">
              <h2 className="text-lg md:text-xl font-semibold text-center text-white mb-6">
                Booth Intelligence Summary
              </h2>
              
              {/* Data Display Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto mb-6">
                <div className="insight-stat-box">
                  <p className="text-slate-400 text-xs md:text-sm mb-3 font-medium">Total Voters</p>
                  <p className="text-2xl md:text-4xl font-bold text-white">{boothInsight.total}</p>
                </div>
                <div className="insight-stat-box">
                  <p className="text-slate-400 text-xs md:text-sm mb-3 font-medium">Average Age</p>
                  <p className="text-2xl md:text-4xl font-bold text-white">{boothInsight.avgAge}</p>
                </div>
                <div className="insight-stat-box">
                  <p className="text-slate-400 text-xs md:text-sm mb-3 font-medium">Major Category</p>
                  <p className="text-2xl md:text-4xl font-bold text-white">{boothInsight.majorGroup}</p>
                </div>
              </div>

              {/* AI Insight Summary Box */}
              {boothInsightText && (
                <div className="insight-text-box">
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed">{boothInsightText}</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Section: Categories + Charts */}
            <div className="flex flex-col lg:flex-row items-stretch w-full gap-6">
            {/* Left: Categories Wise Distribution - 60% width */}
            <div className="categories-card" style={{ flex: "1.5 1 0%" }}>
              <h2 className="text-base md:text-lg font-semibold text-center text-white mb-4">
                Categories Wise Distribution
              </h2>
              <div className="categories-grid">
                <CategoryCard
                  title="Farmers"
                  voters={segments.farmers}
                  onClick={() =>
                    setSelectedCategory({ name: "Farmers", voters: segments.farmers })
                  }
                />
                <CategoryCard
                  title="Students"
                  voters={segments.students}
                  onClick={() =>
                    setSelectedCategory({ name: "Students", voters: segments.students })
                  }
                />
                <CategoryCard
                  title="Senior Citizens"
                  voters={segments.seniorCitizens}
                  onClick={() =>
                    setSelectedCategory({
                      name: "Senior Citizens",
                      voters: segments.seniorCitizens,
                    })
                  }
                />
                <CategoryCard
                  title="Workers"
                  voters={segments.workers}
                  onClick={() =>
                    setSelectedCategory({ name: "Workers", voters: segments.workers })
                  }
                />
                <CategoryCard
                  title="Others"
                  voters={segments.others}
                  onClick={() =>
                    setSelectedCategory({ name: "Others", voters: segments.others })
                  }
                />
                <CategoryCard
                  title="All Voters"
                  voters={[
                    ...segments.farmers,
                    ...segments.students,
                    ...segments.seniorCitizens,
                    ...segments.workers,
                    ...segments.others,
                  ]}
                  onClick={() =>
                    setSelectedCategory({
                      name: "All Voters",
                      voters: [
                        ...segments.farmers,
                        ...segments.students,
                        ...segments.seniorCitizens,
                        ...segments.workers,
                        ...segments.others,
                      ],
                    })
                  }
                />
              </div>
            </div>

            {/* Right: Charts Stacked Vertically - 40% width */}
            <div className="charts-container" style={{ flex: "1 1 0%" }}>
              <div className="chart-wrapper">
                <CategoryChart segments={segments} />
              </div>
              <div className="chart-wrapper">
                <AgeChart voters={allVoters} />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Category Details */}
        {selectedCategory && (
          <div className="mt-6">
            <div className="card">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-white">
                {selectedCategory.name} ({selectedCategory.voters.length})
              </h2>
              <ul className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {selectedCategory.voters.map((voter, index) => (
                  <li key={index} className="inner-card text-slate-200 text-sm">
                    {voter.name} — Age {voter.age} — {voter.occupation}
                  </li>
                ))}
              </ul>
              <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
                Recommended Government Schemes
              </h3>
              <ul className="list-disc ml-6 text-slate-300 text-sm space-y-1">
                {getSchemes(selectedCategory.name).map((scheme, index) => (
                  <li key={index}>{scheme}</li>
                ))}
              </ul>
              <button
                className="mt-6 primary-button text-white"
                onClick={() => router.push("/notifications")}
              >
                Send Notifications →
              </button>
            </div>
          </div>
        )}

        {/* Proceed to Notifications CTA */}
        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Ready to deliver scheme notifications?
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Proceed to the Notification Engine to target categories and send alerts
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/notifications")}
              className="primary-button mt-3 sm:mt-0"
            >
              Open Notification Engine →
            </motion.button>
          </motion.div>
        </div>

        {/* Steps indicator */}
        <ProgressBar currentStep={3} />
      </div>
      </motion.div>
    </div>
  );
}

function CategoryCard({ title, voters, onClick }) {
  const iconMap = {
    Farmers: Wheat,
    Students: GraduationCap,
    "Senior Citizens": UserRound,
    Workers: Wrench,
    Others: Users,
    "All Voters": BarChart3,
  };

  const Icon = iconMap[title] || Users;

  return (
    <div
      onClick={onClick}
      className="category-card"
    >
      <div className="mb-2"><Icon size={22} style={{ color: "var(--text-secondary)" }} /></div>
      <h2 className="text-xs md:text-sm font-semibold text-white mb-1">{title}</h2>
      <p className="text-xs text-slate-400">{voters.length} voters</p>
    </div>
  );
}
