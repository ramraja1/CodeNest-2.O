import React from 'react';
import { useNavigate } from 'react-router-dom';
const AboutSection = () => {
    const navigate = useNavigate();
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-6 md:px-12 rounded-lg shadow-lg max-w-5xl mx-auto my-16">
      
       <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-sm text-gray-900 hover:text-white mb-6"
              >
                Back to Dashboard
              </button>


      <h2 className="text-4xl font-bold text-indigo-900 text-center mb-10 tracking-wide">
        About CodeNest
      </h2>


      <p className="max-w-3xl mx-auto text-lg text-indigo-800 leading-relaxed mb-12 text-center">
        CodeNest is a comprehensive coding assessment and learning management platform designed for colleges and educational institutions seeking to elevate their coding education and evaluation processes.
      </p>

      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-semibold text-indigo-900 mb-4 border-b-4 border-indigo-400 inline-block pb-1">
            Platform Overview
          </h3>
          <p className="text-indigo-800 max-w-4xl leading-relaxed">
            CodeNest operates on a three-panel architecture offering distinct roles:
            <strong className="text-indigo-900"> super admins</strong> overseeing platform-wide management and college onboarding;
            <strong className="text-indigo-900"> college admins</strong> managing batches, contests, and student performance; and
            <strong className="text-indigo-900"> students</strong> engaging in contests and progress tracking to boost their coding skills.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-indigo-900 mb-4 border-b-4 border-indigo-400 inline-block pb-1">
            Key Features
          </h3>
          <ul className="list-disc list-inside max-w-4xl text-indigo-800 space-y-2">
            <li>Multi-role authentication system for super admins, admins, and students</li>
            <li>Batch management with unique enrollment codes for student groups</li>
            <li>Contest creation with manual and AI-powered question generation, live leaderboards, and anti-cheating tools</li>
            <li>Real-time coding environment featuring syntax highlighting, code completion, and plagiarism detection</li>
            <li>Detailed analytics for student progress and institutional performance</li>
          
          </ul>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-indigo-900 mb-4 border-b-4 border-indigo-400 inline-block pb-1">
            Mission and Vision
          </h3>
          <p className="max-w-4xl text-indigo-800 leading-relaxed">
            CodeNest aims to streamline coding education by delivering an interactive, scalable, and secure platform. Its mission is to empower colleges with advanced tools for assessment, foster a community of competitive programmers, and support students in achieving coding excellence.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-indigo-900 mb-4 border-b-4 border-indigo-400 inline-block pb-1">
            Business Model & Future Plans
          </h3>
          <p className="max-w-4xl text-indigo-800 leading-relaxed">
            Operating on a subscription-based model with scalable pricing, CodeNest offers premium features like advanced analytics and custom development. Future plans include AI tutoring integration, mobile app development, multi-language support, and video-based learning modules to enhance modern coding education.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
