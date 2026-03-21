"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { segmentVoters } from "../../lib/segmentVoters.js";
import { fetchSchemes } from "../../lib/api/schemes";
import CategoryChart from "../../components/CategoryChart";
import AgeChart from "../../components/AgeChart";
import { generateInsight } from "../../lib/generateInsight";
import { Wheat, GraduationCap, UserRound, Wrench, Users, BarChart3 } from "lucide-react";
import BackButton from "../../components/BackButton";
import ProgressBar from "../../components/ProgressBar";

const getWomenSegment = (rawVoters = [], existing = []) => {
  const femaleVoters = Array.isArray(rawVoters)
    ? rawVoters.filter((v) => (v.gender || "").toString().toLowerCase() === "female")
    : [];

  if (femaleVoters.length > 0) return femaleVoters;
  if (Array.isArray(existing) && existing.length > 0) return existing;
  return [];
};

export default function Dashboard() {
  const router = useRouter();
  const [segments, setSegments] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]); // Added state for schemes
  const [boothInsight, setBoothInsight] = useState(null);
  const [boothInsightText, setBoothInsightText] = useState("");
  const [allVoters, setAllVoters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const LOAD_INCREMENT = 10;

  // New effect to fetch schemes when category is selected
  useEffect(() => {
    if (selectedCategory?.name) {
      // If "All Voters" is selected, we might want schemes for all categories or handle it differently
      // For now, let's just fetch generic schemes if "All Voters" or specific schemes if a category matches
      const categoryToFetch = selectedCategory.name === "All Voters" ? "" : selectedCategory.name;
      
      fetchSchemes(categoryToFetch)
        .then(data => setRecommendedSchemes(data))
        .catch(err => console.error("Failed to fetch schemes:", err));
    } else {
      setRecommendedSchemes([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const storedBooth = localStorage.getItem("boothId");
    if (!storedBooth) {
      router.push("/booth-selection");
      return;
    }

    const storedAnalysis = localStorage.getItem("boothAnalysis");
    if (storedAnalysis) {
      try {
        const analysis = JSON.parse(storedAnalysis);
        if (analysis?.segments) {
          setSegments({
            ...analysis.segments,
            women: getWomenSegment(analysis?.raw?.voters, analysis.segments?.women ?? analysis.segments?.others),
          });
        }
        if (analysis?.summary) {
          setBoothInsight({
            total: analysis.summary.totalVoters,
            avgAge: analysis.summary.avgAge,
            majorGroup: analysis.summary.dominantCategory,
          });
          setBoothInsightText(analysis.summary.insightText);
        }
        if (analysis?.raw?.voters) {
          setAllVoters(analysis.raw.voters);
        }
      } catch {
        /* ignore parse errors */
      }
    }

    // Fetch latest dashboard data (fallback if we did not have stored analysis)
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/dashboard/${storedBooth}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success) return;

        const normalizedSegments = {
          farmers: data.segments?.farmers || [],
          students: data.segments?.students || [],
          seniorCitizens: data.segments?.seniorCitizens || [],
          workers: data.segments?.workers || [],
          women: getWomenSegment(data.raw?.voters, data.segments?.women ?? data.segments?.others ?? []),
        };

        setSegments(normalizedSegments);
        setBoothInsight({
          total: data.summary.totalVoters,
          avgAge: data.summary.avgAge,
          majorGroup: data.summary.dominantCategory,
        });
        setBoothInsightText(data.summary.insightText);
        setAllVoters(data.raw?.voters || []);

        localStorage.setItem("boothAnalysis", JSON.stringify(data));
      } catch (err) {
        console.warn("Failed to fetch dashboard data:", err);
      }
    };

    fetchDashboard();
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
                  onClick={() => {
                    setSelectedCategory({ name: "Farmers", voters: segments.farmers })
                    setVisibleCount(LOAD_INCREMENT)
                  }}
                />
                <CategoryCard
                  title="Students"
                  voters={segments.students}
                  onClick={() => {
                    setSelectedCategory({ name: "Students", voters: segments.students })
                    setVisibleCount(LOAD_INCREMENT)
                  }}
                />
                <CategoryCard
                  title="Senior Citizens"
                  voters={segments.seniorCitizens}
                  onClick={() => {
                    setSelectedCategory({
                      name: "Senior Citizens",
                      voters: segments.seniorCitizens,
                    })
                    setVisibleCount(LOAD_INCREMENT)
                  }}
                />
                <CategoryCard
                  title="Workers"
                  voters={segments.workers}
                  onClick={() => {
                    setSelectedCategory({ name: "Workers", voters: segments.workers })
                    setVisibleCount(LOAD_INCREMENT)
                  }}
                />
                <CategoryCard
                  title="Women"
                  voters={segments.women}
                  onClick={() =>
                    setSelectedCategory({ name: "Women", voters: segments.women })
                  }
                />
                <CategoryCard
                  title="All Voters"
                  voters={[
                    ...segments.farmers,
                    ...segments.students,
                    ...segments.seniorCitizens,
                    ...segments.workers,
                    ...(segments.women || []),
                  ]}
                  onClick={() => {
                    setSelectedCategory({
                      name: "All Voters",
                      voters: [
                        ...segments.farmers,
                        ...segments.students,
                        ...segments.seniorCitizens,
                        ...segments.workers,
                        ...segments.women,
                      ],
                    })
                    setVisibleCount(LOAD_INCREMENT)
                  }}
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
                {selectedCategory.voters.slice(0, visibleCount).map((voter, index) => (
                  <li key={index} className="inner-card text-slate-200 text-sm">
                    {voter.name} | Age {voter.age}
                  </li>
                ))}
              </ul>
              {visibleCount < selectedCategory.voters.length && (
                <div className="flex items-center justify-center mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setVisibleCount(prev => prev + LOAD_INCREMENT)}
                    className="px-5 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: "var(--accent-dim)",
                      border: "1px solid rgba(200,255,0,0.2)",
                      color: "var(--accent)",
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Show More ({selectedCategory.voters.length - visibleCount} remaining)
                  </motion.button>
                </div>
              )}
              {visibleCount >= selectedCategory.voters.length && selectedCategory.voters.length > LOAD_INCREMENT && (
                <div className="flex items-center justify-center mb-4">
                  <button
                    onClick={() => setVisibleCount(LOAD_INCREMENT)}
                    className="px-4 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                    }}
                  >
                    Collapse List
                  </button>
                </div>
              )}
              {/* <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
                Recommended Government Schemes
              </h3>
              <ul className="list-disc ml-6 text-slate-300 text-sm space-y-1">
                {recommendedSchemes.length > 0 ? (
                  recommendedSchemes.map((scheme) => (
                    <li key={scheme.id || scheme.scheme_id}>{scheme.name || scheme.scheme_name}</li>
                  ))
                ) : (
                  <li>No schemes found for this category.</li>
                )}
              </ul> */}
              {/* <button
                className="mt-6 primary-button text-white"
                onClick={() => router.push("/notifications")}
              >
                Send Notifications →
              </button> */}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className=" mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between p-5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Ready to deliver scheme notifications?
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Target categories and send alerts via the Notification Engine
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/notifications")}
              className="primary-button"
            >
              Notification Engine →
            </motion.button>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-start justify-between p-5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Manage Government Schemes
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Add schemes, launch campaigns, track applications and analytics
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/schemes")}
              className="primary-button mt-3"
            >
              Scheme Management →
            </motion.button>
          </motion.div> */}
        </div>

        {/* Steps indicator */}
        <ProgressBar currentStep={3} />
      </div>
      </motion.div>
    </div>
  );
}

function CategoryCard({ title, voters = [], onClick }) {
  const iconMap = {
    Farmers: Wheat,
    Students: GraduationCap,
    "Senior Citizens": UserRound,
    Workers: Wrench,
    Women: Users,
    "All Voters": BarChart3,
  };

  const Icon = iconMap[title] || Users;
  const voterCount = Array.isArray(voters) ? voters.length : 0;

  return (
    <div
      onClick={onClick}
      className="category-card"
    >
      <div className="mb-2"><Icon size={22} style={{ color: "var(--text-secondary)" }} /></div>
      <h2 className="text-xs md:text-sm font-semibold text-white mb-1">{title}</h2>
      <p className="text-xs text-slate-400">{voterCount} voters</p>
    </div>
  );
}
