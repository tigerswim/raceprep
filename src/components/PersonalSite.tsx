import React from 'react';
import { Mail, Linkedin, Award, TrendingUp, Users, Target } from 'lucide-react';

const PersonalSite: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dan Hoeller</h1>
              <p className="text-xl text-blue-600 font-medium mb-3">
                Chief Marketing Officer | Senior VP Marketing | P&amp;L Owner
              </p>
              <p className="text-gray-600 max-w-2xl">
                Passionate marketing leader blending strategic vision with human-centered perspective. 
                Building brands with grit, insight, and the kind of connection that goes beyond data points.
              </p>
            </div>
            <div className="flex gap-4">
              <a 
                href="mailto:danhoeller@gmail.com" 
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail size={20} />
                Contact Me
              </a>
              <a 
                href="https://www.linkedin.com/in/danhoeller" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Linkedin size={20} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              In nearly 20 years of marketing, I&apos;ve learned that the best brands are built with grit, insight, 
              and genuine human connection. Whether it&apos;s baby shampoo or yes, even hemorrhoid pads at Johnson &amp; Johnson, 
              true success means understanding what people care about.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Most recently, as SVP of Marketing at Central Garden &amp; Pet, I led a team of 25 to help homeowners 
              create their own unique outdoor spaces. Marketing isn&apos;t about the highs of big wins or the lows of 
              tests that didn&apos;t quite land—it&apos;s about showing up, taking smart risks, and always keeping the 
              consumer at the heart of it.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              When I&apos;m not crafting brand stories, you&apos;ll find me training for my next Ironman, hitting the trails 
              on my mountain bike, or diving into a DIY project—whether it&apos;s home improvement, auto repair, or 
              experimenting with AI. I believe the same curiosity and problem-solving mindset that drives my 
              personal interests fuels my marketing success.
            </p>
          </div>
        </section>

        {/* Key Achievements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Achievements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-blue-600" size={24} />
                <h3 className="font-semibold text-gray-900">Growth Driver</h3>
              </div>
              <p className="text-gray-600">15+ years driving growth for iconic consumer brands with P&amp;L ownership mentality</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <Award className="text-green-600" size={24} />
                <h3 className="font-semibold text-gray-900">#FlipTheTurf</h3>
              </div>
              <p className="text-gray-600">4B impressions, 2 Clio Sports awards - a cultural moment that sparked change</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <Users className="text-purple-600" size={24} />
                <h3 className="font-semibold text-gray-900">Team Builder</h3>
              </div>
              <p className="text-gray-600">Led teams of 25+ people with servant leadership approach, empowering through collaboration</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <Target className="text-orange-600" size={24} />
                <h3 className="font-semibold text-gray-900">P&amp;L Growth</h3>
              </div>
              <p className="text-gray-600">Delivered exceptional results including +98.8% EBIT growth and $200MM+ ARR milestones</p>
            </div>
          </div>
        </section>

        {/* Experience Highlights */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Experience Highlights</h2>
          <div className="space-y-8">
            {/* Central Garden & Pet */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Senior Vice President of Marketing</h3>
                  <p className="text-blue-600 font-medium">Central Garden &amp; Pet</p>
                </div>
                <span className="text-gray-500 font-medium">2019-2024</span>
              </div>
              <p className="text-gray-700 mb-4">
                Led marketing strategy for $3B+ manufacturer&apos;s Garden segment as de facto CMO, managing team of 25 across 
                Consumer Insights, Innovation, Digital Marketing, and Creative Services.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Grew Pennington sales +8.2% (4x faster than category) through innovative launches and effective media</li>
                <li>• Created #FlipTheTurf campaign delivering 3.95B impressions and winning two Clio Sports awards</li>
                <li>• Built Garden Innovation team developing $20MM+ annual product pipeline focused on sustainability</li>
                <li>• Led Pennington brand reinvention focusing on consumer trends and visual identity</li>
              </ul>
            </div>
            {/* Johnson & Johnson */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Brand Manager &amp; Marketing Manager</h3>
                  <p className="text-blue-600 font-medium">Johnson &amp; Johnson</p>
                </div>
                <span className="text-gray-500 font-medium">2006-2013</span>
              </div>
              <p className="text-gray-700 mb-4">
                Managed iconic consumer brands including Johnson&apos;s Baby, Tucks, and K-Y across $15B Consumer segment, 
                plus medical device marketing at Ortho Clinical Diagnostics.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Reversed years of Tucks decline, delivering +26.8% growth through targeted marketing</li>
                <li>• Won J&amp;J Global Burke Award for Thanks, Mom Olympic campaign with 290MM+ impressions</li>
                <li>• Grew Baby Oil +9.8% and Baby Powder +5.2% despite heavy private label competition</li>
                <li>• Brought patient-first perspective to medical device marketing in regulated environment</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Core Competencies */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Competencies</h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Strategic Leadership</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Marketing Strategy &amp; Planning</li>
                  <li>• P&amp;L Management &amp; Pricing</li>
                  <li>• Brand Architecture &amp; Identity</li>
                  <li>• Cross-Functional Collaboration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Data &amp; Innovation</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Data-Driven Decision Making</li>
                  <li>• Marketing Mix Modeling</li>
                  <li>• Innovation Pipeline Development</li>
                  <li>• Consumer Insights &amp; Analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Digital &amp; Execution</h4>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Omnichannel &amp; eCommerce</li>
                  <li>• Marketing Technology Stack</li>
                  <li>• Agency Management</li>
                  <li>• Team Leadership &amp; Development</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Write the Next Chapter?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Looking for a marketing leader who blends strategic acumen with a human touch and focus on results? 
              Let&apos;s talk about how I can help write the next chapter of your brand story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:danhoeller@gmail.com" 
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Mail size={20} />
                danhoeller@gmail.com
              </a>
              <a 
                href="https://www.linkedin.com/in/danhoeller" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
              >
                <Linkedin size={20} />
                LinkedIn Profile
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 Dan Hoeller. Triathlete, Ironman finisher, DIY enthusiast, and passionate marketing leader.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PersonalSite; 