import React from 'react';
import { BookOpen, Target, Heart, Award, Shield, Users } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
          Our Story
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Democratizing World-Class Tech Education
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          LearnHub was founded with a clear objective: to bridge the gap between academic theory and high-impact engineering practice.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Practical Excellence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every course is architected with real-world industry standards, ensuring students write production-ready code from day one.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Student First</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We prioritize student outcomes through interactive knowledge checks, instant feedback, and direct instructor mentorship.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
          <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Recognized Certification</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Certificates of completion provide verifiable proof of competency in modern technology stacks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
